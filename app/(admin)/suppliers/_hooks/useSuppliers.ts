import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/services/suppliersService';
import type { Supplier, SupplierPayload } from '@/types';

export interface UseSuppliersState {
  items: Supplier[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

export interface UseSuppliersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: SupplierPayload) => Promise<Supplier | null>;
  update: (id: string, data: SupplierPayload) => Promise<Supplier | null>;
  remove: (id: string) => Promise<boolean>;
  search: (query: string) => Promise<Supplier[]>;
}

const PAGE_SIZE = 20;

export function useSuppliers() {
  const [state, setState] = useState<UseSuppliersState>({
    items: [],
    loading: false,
    page: 1,
    hasMore: true
  });

  const load = useCallback(async (reset: boolean = false) => {
    setState((s) => ({ ...s, loading: true, ...(reset ? { page: 1 } : {}) }));
    try {
      const page = reset ? 1 : state.page;
      const params: any = { page, pageSize: PAGE_SIZE };
      
      const response = await listSuppliers(params);
      if (response.error) {
        throw new Error(response.error);
      }
      const suppliers = response.data?.suppliers || [];
      setState((s) => ({
        items: reset ? suppliers : [...s.items, ...suppliers],
        loading: false,
        page,
        hasMore: suppliers.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Falha ao carregar fornecedores',
        description: 'Tente novamente em instantes.',
        variant: 'destructive'
      });
    }
  }, [state.page]);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    
    try {
      const params: any = { page: nextPage, pageSize: PAGE_SIZE };
      
      const response = await listSuppliers(params);
      if (response.error) {
        throw new Error(response.error);
      }
      const suppliers = response.data?.suppliers || [];
      setState((s) => ({
        ...s,
        items: [...s.items, ...suppliers],
        hasMore: suppliers.length === PAGE_SIZE,
        loading: false,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Falha ao carregar mais fornecedores',
        description: 'Tente novamente em instantes.',
        variant: 'destructive'
      });
    }
  }, [state.loading, state.hasMore, state.page]);

  const create = useCallback(async (data: SupplierPayload) => {
    try {
      const response = await createSupplier(data);
      if (response.error) {
        throw new Error(response.error);
      }
      const supplier = response.data?.supplier;
      if (supplier) {
        setState((s) => ({ ...s, items: [supplier, ...s.items] }));
        toast({
          title: 'Fornecedor criado',
          description: supplier.razao_social || 'Registro criado.'
        });
        return supplier;
      }
      return null;
    } catch (e) {
      toast({
        title: 'Erro ao criar fornecedor',
        description: 'Verifique os dados informados.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: SupplierPayload) => {
    try {
      const response = await updateSupplier(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      const supplier = response.data?.supplier;
      if (supplier) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? supplier : it)),
        }));
        toast({
          title: 'Fornecedor atualizado',
          description: supplier.razao_social || 'Registro atualizado.'
        });
        return supplier;
      }
      return null;
    } catch (e) {
      toast({
        title: 'Erro ao atualizar fornecedor',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await deleteSupplier(id);
      if (response.error) {
        throw new Error(response.error);
      }
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({
        title: 'Fornecedor removido',
        description: 'Registro excluído com sucesso.'
      });
      return true;
    } catch (e) {
      toast({
        title: 'Erro ao remover fornecedor',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return false;
    }
  }, []);

  const search = useCallback(async (query: string) => {
    try {
      const params: any = { q: query, page: 1, pageSize: 50 };
      
      const response = await listSuppliers(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.suppliers || [];
    } catch (e) {
      console.error('Erro ao buscar fornecedores:', e);
      return [];
    }
  }, []);

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: UseSuppliersApi = useMemo(
    () => ({ load, loadMore, create, update, remove, search }),
    [load, loadMore, create, update, remove, search]
  );

  return { ...state, ...api };
}
