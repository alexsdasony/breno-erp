import { useCallback, useEffect, useMemo, useState } from 'react';
import { listChartOfAccounts, createChartOfAccount, updateChartOfAccount, deleteChartOfAccount } from '@/services/chartOfAccountsService';
import { toast } from '@/components/ui/use-toast';
import type { ChartOfAccount, ChartOfAccountPayload } from '@/types';

interface State {
  items: ChartOfAccount[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<ChartOfAccount>) => Promise<ChartOfAccount | null>;
  update: (id: string, data: Partial<ChartOfAccount>) => Promise<ChartOfAccount | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useChartOfAccounts() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const response = await listChartOfAccounts({ page, limit: PAGE_SIZE });
    return response.data?.chartOfAccounts || [];
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

  const create = useCallback(async (data: Partial<ChartOfAccount>) => {
    try {
      // Garantir que o campo code seja uma string válida
      if (data.code === null) {
        data.code = '';
      }
      
      const payload: ChartOfAccountPayload = {
        code: data.code,
        name: data.name,
        type: data.type,
        parent_id: data.parent_id,
        description: data.description,
        is_active: data.is_active !== undefined ? data.is_active : true
      };
      
      const response = await createChartOfAccount(payload);
      const item = response.data?.chartOfAccount;
      
      if (item) {
        setState((s) => ({ ...s, items: [item, ...s.items] }));
        toast({ title: 'Conta criada', description: item.name || 'Registro criado.' });
        return item;
      }
      
      toast({ title: 'Aviso', description: 'Conta criada, mas não foi possível atualizar a lista' });
      return null;
    } catch (e) {
      toast({ title: 'Erro ao criar conta', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<ChartOfAccount>) => {
    try {
      // Garantir que o campo code seja uma string válida
      if (data.code === null) {
        data.code = '';
      }
      
      const payload: ChartOfAccountPayload = {
        code: data.code,
        name: data.name,
        type: data.type,
        parent_id: data.parent_id,
        description: data.description,
        is_active: data.is_active
      };
      
      const response = await updateChartOfAccount(id, payload);
      const item = response.data?.chartOfAccount;
      
      if (item) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? item : it)),
        }));
        toast({ title: 'Conta atualizada', description: item.name || 'Registro atualizado.' });
        return item;
      }
      
      toast({ title: 'Aviso', description: 'Conta atualizada, mas não foi possível atualizar a lista' });
      return null;
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
