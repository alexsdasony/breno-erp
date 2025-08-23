import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export interface BillingItem {
  id: string;
  customer_id?: string | null;
  customer_name?: string;
  invoice_number?: string;
  issue_date?: string;
  due_date?: string;
  amount?: number;
  tax_amount?: number;
  total_amount?: number;
  status?: string;
  payment_method?: string | null;
  notes?: string | null;
  segment_id?: string | null;
}

interface State {
  items: BillingItem[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<BillingItem>) => Promise<BillingItem | null>;
  update: (id: string, data: Partial<BillingItem>) => Promise<BillingItem | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useBillings() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const res = await apiService.getBillings({ page, pageSize: PAGE_SIZE });
    const list = (res as any).billings || (res as any).data || [];
    return list as BillingItem[];
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

  const create = useCallback(async (data: Partial<BillingItem>) => {
    try {
      const res = await apiService.createBilling(data);
      const item = (res as any).billing || (res as any).data || res;
      setState((s) => ({ ...s, items: [item as BillingItem, ...s.items] }));
      toast({ title: 'Cobrança criada', description: (item as BillingItem)?.invoice_number || 'Registro criado.' });
      return item as BillingItem;
    } catch (e) {
      toast({ title: 'Erro ao criar cobrança', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<BillingItem>) => {
    try {
      const res = await apiService.updateBilling(id, data);
      const item = (res as any).billing || (res as any).data || res;
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? (item as BillingItem) : it)),
      }));
      toast({ title: 'Cobrança atualizada', description: (item as BillingItem)?.invoice_number || 'Registro atualizado.' });
      return item as BillingItem;
    } catch (e) {
      toast({ title: 'Erro ao atualizar cobrança', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiService.deleteBilling(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Cobrança removida', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover cobrança', description: 'Tente novamente.', variant: 'destructive' });
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
