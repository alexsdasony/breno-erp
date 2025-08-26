import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export interface AccountPayableItem {
  id: string;
  description: string;
  amount: number;
  due_date?: string | null;
  supplier_id?: string | null;
  supplier_name?: string | null;
  category?: string | null;
  status?: string;
  segment_id?: string | null;
  notes?: string | null;
  payment_date?: string | null;
  payment_method?: string | null;
}

interface State {
  items: AccountPayableItem[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<AccountPayableItem>) => Promise<AccountPayableItem | null>;
  update: (id: string, data: Partial<AccountPayableItem>) => Promise<AccountPayableItem | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useAccountsPayable() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const res: any = await apiService.getAccountsPayable({ page, pageSize: PAGE_SIZE });
    // Edge Function returns { success, accounts_payable: [] }
    const list = res.accounts_payable || res.accountsPayable || res.data || [];
    return Array.isArray(list) ? (list as AccountPayableItem[]) : [];
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
      toast({ title: 'Falha ao carregar contas a pagar', description: 'Tente novamente em instantes.', variant: 'destructive' });
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

  const create = useCallback(async (data: Partial<AccountPayableItem>) => {
    try {
      const res = await apiService.createAccountPayable(data);
      const item = (res as any).account || (res as any).data || res;
      setState((s) => ({ ...s, items: [item as AccountPayableItem, ...s.items] }));
      toast({ title: 'Conta a pagar criada', description: (item as AccountPayableItem)?.description || 'Registro criado.' });
      return item as AccountPayableItem;
    } catch (e) {
      toast({ title: 'Erro ao criar conta a pagar', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<AccountPayableItem>) => {
    try {
      const res = await apiService.updateAccountPayable(id, data);
      const item = (res as any).account || (res as any).data || res;
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? (item as AccountPayableItem) : it)),
      }));
      toast({ title: 'Conta a pagar atualizada', description: (item as AccountPayableItem)?.description || 'Registro atualizado.' });
      return item as AccountPayableItem;
    } catch (e) {
      toast({ title: 'Erro ao atualizar conta a pagar', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiService.deleteAccountPayable(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Conta a pagar removida', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover conta a pagar', description: 'Tente novamente.', variant: 'destructive' });
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
