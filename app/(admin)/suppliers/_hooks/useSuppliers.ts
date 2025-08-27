import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } from '@/services/suppliersService';
import { Supplier } from '@/types';
import { toast } from '@/components/ui/use-toast';

export interface UseSuppliersState {
  items: Supplier[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

export interface UseSuppliersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<Supplier>) => Promise<Supplier | null>;
  update: (id: string, data: Partial<Supplier>) => Promise<Supplier | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useSuppliers() {
  const [state, setState] = useState<UseSuppliersState>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const res = await getSuppliers({ page, pageSize: PAGE_SIZE });
    const suppliers = res.data?.suppliers || [];
    return suppliers as Supplier[];
  }, []);

  const load = useCallback(async (reset: boolean = false) => {
    setState((s) => ({ ...s, loading: true, ...(reset ? { page: 1 } : {}) }));
    try {
      const page = reset ? 1 : state.page;
      const partners = await fetchPage(page);
      setState((s) => ({
        items: reset ? partners : [...s.items, ...partners],
        loading: false,
        page,
        hasMore: partners.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({ title: 'Falha ao carregar fornecedores', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  }, [state.page, fetchPage]);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    const partners = await fetchPage(nextPage);
    setState((s) => ({
      ...s,
      items: [...s.items, ...partners],
      hasMore: partners.length === PAGE_SIZE,
      loading: false,
    }));
  }, [state.loading, state.hasMore, state.page, fetchPage]);

  const create = useCallback(async (data: Partial<Supplier>) => {
    try {
      const res = await createSupplier(data);
      const supplier = res.data?.supplier;
      if (supplier) {
        setState((s) => ({ ...s, items: [supplier, ...s.items] }));
        toast({ title: 'Fornecedor criado', description: supplier.name || 'Registro criado.' });
        return supplier;
      }
      toast({ title: 'Fornecedor criado', description: 'Registro criado.' });
      return null;
    } catch (e) {
      toast({ title: 'Erro ao criar fornecedor', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Supplier>) => {
    try {
      const res = await updateSupplier(id, data);
      const supplier = res.data?.supplier;
      if (supplier) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? supplier : it)),
        }));
        toast({ title: 'Fornecedor atualizado', description: supplier.name || 'Registro atualizado.' });
        return supplier;
      }
      toast({ title: 'Fornecedor atualizado', description: 'Registro atualizado.' });
      return null;
    } catch (e) {
      toast({ title: 'Erro ao atualizar fornecedor', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteSupplier(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Fornecedor removido', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover fornecedor', description: 'Tente novamente.', variant: 'destructive' });
      return false;
    }
  }, [])

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: UseSuppliersApi = useMemo(() => ({ load, loadMore, create, update, remove }), [load, loadMore, create, update, remove]);

  return { ...state, ...api };
}
