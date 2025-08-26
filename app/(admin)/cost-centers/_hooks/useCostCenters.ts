import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export interface CostCenter {
  id: string;
  name: string;
  description?: string | null;
  code?: string | null;
  budget?: number | null;
  status?: 'active' | 'inactive' | string;
  segment_id?: string | null;
  manager_id?: string | null;
}

interface State {
  items: CostCenter[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<CostCenter>) => Promise<CostCenter | null>;
  update: (id: string, data: Partial<CostCenter>) => Promise<CostCenter | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useCostCenters() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const res = await apiService.getCostCenters({ page, pageSize: PAGE_SIZE });
    // Debug: inspecionar resposta bruta
    // eslint-disable-next-line no-console
    console.log('[useCostCenters] fetchPage raw response:', res);
    // Normalizar possíveis formatos de retorno
    const anyRes: any = res ?? {};
    const list = Array.isArray(anyRes)
      ? anyRes
      : anyRes.costCenters ||
        anyRes.cost_centers ||
        anyRes.data?.costCenters ||
        anyRes.data?.cost_centers ||
        anyRes.data ||
        anyRes.items ||
        anyRes.results ||
        [];
    const normalized = list as CostCenter[];
    // eslint-disable-next-line no-console
    console.log('[useCostCenters] fetchPage normalized length:', normalized?.length);
    return normalized;
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
      // eslint-disable-next-line no-console
      console.log('[useCostCenters] load items length after set (page):', page, 'len:', list.length);
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({ title: 'Falha ao carregar centros de custo', description: 'Tente novamente em instantes.', variant: 'destructive' });
      // eslint-disable-next-line no-console
      console.error('[useCostCenters] load error:', e);
    }
  }, [state.page, fetchPage]);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage, loading: true }));
    const list = await fetchPage(nextPage);
    setState((s) => ({
      ...s,
      items: [...s.items, ...list],
      hasMore: list.length === PAGE_SIZE,
      loading: false,
    }));
  }, [state.loading, state.hasMore, state.page, fetchPage]);

  const create = useCallback(async (data: Partial<CostCenter>) => {
    try {
      const res = await apiService.createCostCenter(data);
      const anyRes: any = res ?? {};
      const item = anyRes.costCenter || anyRes.cost_center || anyRes.data || res;
      setState((s) => ({ ...s, items: [item as CostCenter, ...s.items] }));
      toast({ title: 'Centro de custo criado', description: (item as CostCenter)?.name || 'Registro criado.' });
      return item as CostCenter;
    } catch (e) {
      toast({ title: 'Erro ao criar centro de custo', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<CostCenter>) => {
    try {
      const res = await apiService.updateCostCenter(id, data);
      const anyRes: any = res ?? {};
      const item = anyRes.costCenter || anyRes.cost_center || anyRes.data || res;
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? (item as CostCenter) : it)),
      }));
      toast({ title: 'Centro de custo atualizado', description: (item as CostCenter)?.name || 'Registro atualizado.' });
      return item as CostCenter;
    } catch (e) {
      toast({ title: 'Erro ao atualizar centro de custo', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiService.deleteCostCenter(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Centro de custo removido', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover centro de custo', description: 'Tente novamente.', variant: 'destructive' });
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
