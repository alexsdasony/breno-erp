import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export interface Partner {
  id: string;
  name: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  status?: string;
  segment_id?: string | null;
}

export interface UseSuppliersState {
  items: Partner[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

export interface UseSuppliersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<Partner>) => Promise<Partner | null>;
  update: (id: string, data: Partial<Partner>) => Promise<Partner | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useSuppliers() {
  const [state, setState] = useState<UseSuppliersState>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const res = await apiService.getPartners({ role: 'supplier', page, pageSize: PAGE_SIZE });
    const partners = (res as any).partners || (res as any).data || [];
    return partners as Partner[];
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

  const create = useCallback(async (data: Partial<Partner>) => {
    try {
      const res = await apiService.createPartner({ ...data, role: 'supplier' });
      const partner = (res as any).partner || (res as any).data || res;
      setState((s) => ({ ...s, items: [partner as Partner, ...s.items] }));
      toast({ title: 'Fornecedor criado', description: (partner as Partner)?.name || 'Registro criado.' });
      return partner as Partner;
    } catch (e) {
      toast({ title: 'Erro ao criar fornecedor', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Partner>) => {
    try {
      const res = await apiService.updatePartner(id, data);
      const partner = (res as any).partner || (res as any).data || res;
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? (partner as Partner) : it)),
      }));
      toast({ title: 'Fornecedor atualizado', description: (partner as Partner)?.name || 'Registro atualizado.' });
      return partner as Partner;
    } catch (e) {
      toast({ title: 'Erro ao atualizar fornecedor', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiService.deletePartner(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Fornecedor removido', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover fornecedor', description: 'Tente novamente.', variant: 'destructive' });
      return false;
    }
  }, []);

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: UseSuppliersApi = useMemo(() => ({ load, loadMore, create, update, remove }), [load, loadMore, create, update, remove]);

  return { ...state, ...api };
}
