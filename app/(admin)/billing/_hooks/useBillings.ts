import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listBillings, createBilling, updateBilling, deleteBilling } from '@/services/billingService';
import { useAppData } from '@/hooks/useAppData';
import type { Billing, BillingPayload } from '@/types';

// Usando a interface Billing do sistema para manter consistência
export type BillingItem = Billing;

interface State {
  items: BillingItem[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: BillingPayload) => Promise<BillingItem | null>;
  update: (id: string, data: BillingPayload) => Promise<BillingItem | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useBillings() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });
  const { data, activeSegmentId } = useAppData();

  // O filtro por segmento é feito na API, não no frontend

  const fetchPage = useCallback(async (page: number) => {
    const response = await listBillings({ page, pageSize: PAGE_SIZE, segment_id: activeSegmentId });
    const list = response.data?.billings || [];
    return list as BillingItem[];
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
      toast({ title: 'Falha ao carregar cobranças', description: 'Tente novamente em instantes.', variant: 'destructive' });
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

  const create = useCallback(async (data: BillingPayload) => {
    try {
      const response = await createBilling(data);
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Erro ao criar cobrança');
      }
      const item = response.data?.billing;
      if (item) {
        setState((s) => ({ ...s, items: [item, ...s.items] }));
        toast({ title: 'Cobrança criada', description: `Cobrança de ${item.customer_name || 'cliente'} criada.` });
        return item;
      }
      return null;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Verifique os dados informados.';
      toast({ title: 'Erro ao criar cobrança', description: errorMessage, variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: BillingPayload) => {
    try {
      const response = await updateBilling(id, data);
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Erro ao atualizar cobrança');
      }
      const item = response.data?.billing;
      if (item) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? item : it)),
        }));
        toast({ title: 'Cobrança atualizada', description: `Cobrança de ${item.customer_name || 'cliente'} atualizada.` });
        return item;
      }
      return null;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Tente novamente.';
      toast({ title: 'Erro ao atualizar cobrança', description: errorMessage, variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await deleteBilling(id);
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Erro ao remover cobrança');
      }
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Cobrança removida', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Tente novamente.';
      toast({ title: 'Erro ao remover cobrança', description: errorMessage, variant: 'destructive' });
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
    items: state.items, // Usar dados do estado local
    ...api 
  };
}
