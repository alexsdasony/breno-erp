import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export interface Product {
  id: string;
  name: string;
  price: number;
  category?: string | null;
  stock?: number;
  min_stock?: number;
  segment_id?: string | null;
  code?: string | null;
  description?: string | null;
  cost_price?: number | null;
  supplier?: string | null;
}

interface State {
  items: Product[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<Product>) => Promise<Product | null>;
  update: (id: string, data: Partial<Product>) => Promise<Product | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useProducts() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const res = await apiService.getProducts({ page, pageSize: PAGE_SIZE });
    const list = (res as any).products || (res as any).data || [];
    return list as Product[];
  }, []);

  const load = useCallback(async (reset: boolean = false) => {
    setState((s) => ({ ...s, loading: true, ...(reset ? { page: 1 } : {}) }));
    try {
      const page = reset ? 1 : state.page;
      const list = await fetchPage(page);
      setState((s) => ({
        items: reset ? list : [...s.items, ...list],
        loading: false,
        page,
        hasMore: list.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Falha ao carregar produtos',
        description: 'Tente novamente em instantes.',
        variant: 'destructive',
      });
    }
  }, [state.page, fetchPage]);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    const list = await fetchPage(nextPage);
    setState((s) => ({
      ...s,
      items: [...s.items, ...list],
      hasMore: list.length === PAGE_SIZE,
      loading: false,
    }));
  }, [state.loading, state.hasMore, state.page, fetchPage]);

  const create = useCallback(async (data: Partial<Product>) => {
    try {
      const res = await apiService.createProduct(data);
      const item = (res as any).product || (res as any).data || res;
      setState((s) => ({ ...s, items: [item as Product, ...s.items] }));
      toast({ title: 'Produto criado', description: (item as Product)?.name || 'Registro adicionado.' });
      return item as Product;
    } catch (e) {
      toast({ title: 'Erro ao criar produto', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Product>) => {
    try {
      const res = await apiService.updateProduct(id, data);
      const item = (res as any).product || (res as any).data || res;
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? (item as Product) : it)),
      }));
      toast({ title: 'Produto atualizado', description: (item as Product)?.name || 'Registro atualizado.' });
      return item as Product;
    } catch (e) {
      toast({ title: 'Erro ao atualizar produto', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiService.deleteProduct(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Produto removido', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover produto', description: 'Tente novamente.', variant: 'destructive' });
      return false;
    }
  }, []);

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: Api = useMemo(() => ({ load, loadMore, create, update, remove }), [load, loadMore, create, update, remove]);

  return { ...state, ...api };
}
