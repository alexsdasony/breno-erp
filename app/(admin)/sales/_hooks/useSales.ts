import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listSales, createSale, updateSale, deleteSale } from '@/services/salesService';
import { useAppData } from '@/hooks/useAppData';
import { Sale, SaleItem } from '@/types';

interface State {
  items: Sale[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<Sale>) => Promise<Sale | null>;
  update: (id: string, data: Partial<Sale>) => Promise<Sale | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useSales() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });
  const { activeSegmentId } = useAppData();

  const fetchPage = useCallback(async (page: number) => {
    console.log('🛒 fetchPage - page:', page, 'activeSegmentId:', activeSegmentId);
    const response = await listSales({ page, pageSize: PAGE_SIZE, segment_id: activeSegmentId });
    console.log('🛒 API Response:', response); // Log para debug
    console.log('🛒 Response data:', response.data);
    console.log('🛒 Sales array:', response.data?.sales);
    const list = response.data?.sales || [];
    console.log('🛒 List length:', list.length);
    return list as Sale[];
  }, [activeSegmentId]);

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
        title: 'Falha ao carregar vendas',
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

  const create = useCallback(async (data: Partial<Sale>) => {
    try {
      const response = await createSale(data as any);
      const sale = response.data?.sale;
      if (sale) {
        setState((s) => ({ ...s, items: [sale, ...s.items] }));
        toast({ title: 'Venda criada', description: `ID: ${sale.id || ''}` });
        return sale;
      }
      toast({ title: 'Aviso', description: 'Venda criada, mas não foi possível obter os detalhes' });
      return null;
    } catch (e) {
      toast({ title: 'Erro ao criar venda', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Sale>) => {
    try {
      const response = await updateSale(id, data as any);
      const sale = response.data?.sale;
      if (sale) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? sale : it)),
        }));
        toast({ title: 'Venda atualizada', description: `ID: ${sale.id || ''}` });
        return sale;
      }
      toast({ title: 'Aviso', description: 'Venda atualizada, mas não foi possível obter os detalhes' });
      return null;
    } catch (e) {
      toast({ title: 'Erro ao atualizar venda', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteSale(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Venda removida', description: `ID: ${id}` });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover venda', description: 'Tente novamente.', variant: 'destructive' });
      return false;
    }
  }, []);

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: Api = useMemo(() => ({ load, loadMore, create, update, remove }), [load, loadMore, create, update, remove]);

  return { 
    ...state, 
    ...api 
  };
}
