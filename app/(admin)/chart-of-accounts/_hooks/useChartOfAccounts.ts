import { useCallback, useEffect, useMemo, useState } from 'react';
import { listChartOfAccounts, createChartOfAccount, updateChartOfAccount, deleteChartOfAccount } from '@/services/chartOfAccountsService';
import { toast } from '@/components/ui/use-toast';

export interface ChartAccount {
  id: string;
  code?: string | null;
  name?: string | null;
  description?: string | null;
  type?: string | null; // asset, liability, equity, revenue, expense
  parent_id?: string | null;
  segment_id?: string | null;
}

interface State {
  items: ChartAccount[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<ChartAccount>) => Promise<ChartAccount | null>;
  update: (id: string, data: Partial<ChartAccount>) => Promise<ChartAccount | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useChartOfAccounts() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const res = await listChartOfAccounts({ page, limit: PAGE_SIZE });
    const list = (res as any).chartOfAccounts || (res as any).data || res || [];
    return list as ChartAccount[];
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
      toast({ title: 'Falha ao carregar plano de contas', description: 'Tente novamente em instantes.', variant: 'destructive' });
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

  const create = useCallback(async (data: Partial<ChartAccount>) => {
    try {
      const res = await createChartOfAccount(data);
      const item = (res as any).chartOfAccount || (res as any).data || res;
      setState((s) => ({ ...s, items: [item as ChartAccount, ...s.items] }));
      toast({ title: 'Conta criada', description: (item as ChartAccount)?.name || 'Registro criado.' });
      return item as ChartAccount;
    } catch (e) {
      toast({ title: 'Erro ao criar conta', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<ChartAccount>) => {
    try {
      const res = await updateChartOfAccount(id, data);
      const item = (res as any).chartOfAccount || (res as any).data || res;
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? (item as ChartAccount) : it)),
      }));
      toast({ title: 'Conta atualizada', description: (item as ChartAccount)?.name || 'Registro atualizado.' });
      return item as ChartAccount;
    } catch (e) {
      toast({ title: 'Erro ao atualizar conta', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteChartOfAccount(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Conta removida', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover conta', description: 'Tente novamente.', variant: 'destructive' });
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
