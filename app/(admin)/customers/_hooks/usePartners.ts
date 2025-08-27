import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listPartners, createPartner, updatePartner, deletePartner } from '@/services/partnersService';
import type { Partner } from '@/types';

// Usando a interface Partner importada de @/types

export interface UsePartnersState {
  items: Partner[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

export interface UsePartnersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<Partner>) => Promise<Partner | null>;
  update: (id: string, data: Partial<Partner>) => Promise<Partner | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function usePartners() {
  const [state, setState] = useState<UsePartnersState>({ items: [], loading: false, page: 1, hasMore: true });

  const load = useCallback(async (reset: boolean = false) => {
    setState((s) => ({ ...s, loading: true, ...(reset ? { page: 1 } : {}) }));
    try {
      const page = reset ? 1 : state.page;
      const response = await listPartners({ page, pageSize: PAGE_SIZE });
      if (response.error) {
        throw new Error(response.error);
      }
      const partners = response.data?.partners || [];
      setState((s) => ({
        items: reset ? partners : [...s.items, ...partners],
        loading: false,
        page,
        hasMore: partners.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({ title: 'Falha ao carregar parceiros', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  }, [state.page]);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    // After updating page, trigger load for next page
    try {
      const response = await listPartners({ page: nextPage, pageSize: PAGE_SIZE });
      if (response.error) {
        throw new Error(response.error);
      }
      const partners = response.data?.partners || [];
      setState((s) => ({
        ...s,
        items: [...s.items, ...partners],
        hasMore: partners.length === PAGE_SIZE,
        loading: false,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({ title: 'Falha ao carregar mais parceiros', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  }, [state.loading, state.hasMore, state.page]);

  const create = useCallback(async (data: Partial<Partner>) => {
    try {
      const response = await createPartner(data);
      if (response.error) {
        throw new Error(response.error);
      }
      const partner = response.data?.partner;
      if (partner) {
        setState((s) => ({ ...s, items: [partner, ...s.items] }));
        toast({ title: 'Parceiro criado', description: partner.name || 'Registro criado.' });
        return partner;
      }
      return null;
    } catch (e) {
      toast({ title: 'Erro ao criar parceiro', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Partner>) => {
    try {
      const response = await updatePartner(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      const partner = response.data?.partner;
      if (partner) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? partner : it)),
        }));
        toast({ title: 'Parceiro atualizado', description: partner.name || 'Registro atualizado.' });
        return partner;
      }
      return null;
    } catch (e) {
      toast({ title: 'Erro ao atualizar parceiro', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await deletePartner(id);
      if (response.error) {
        throw new Error(response.error);
      }
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Parceiro removido', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover parceiro', description: 'Tente novamente.', variant: 'destructive' });
      return false;
    }
  }, []);

  useEffect(() => {
    // initial load
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: UsePartnersApi = useMemo(() => ({ load, loadMore, create, update, remove }), [load, loadMore, create, update, remove]);

  return { ...state, ...api };
}
