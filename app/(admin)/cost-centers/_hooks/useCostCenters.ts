import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listCostCenters, createCostCenter, updateCostCenter, deleteCostCenter } from '@/services/costCentersService';
import type { CostCenter, CostCenterPayload } from '@/types';

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
    const response = await listCostCenters({ page, pageSize: PAGE_SIZE });
    // Debug: inspecionar resposta bruta
    // eslint-disable-next-line no-console
    console.log('[useCostCenters] fetchPage raw response:', response);
    
    const costCenters = response.data?.costCenters || [];
    
    // eslint-disable-next-line no-console
    console.log('[useCostCenters] fetchPage normalized length:', costCenters?.length);
    return costCenters;
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
      // Garantir que o campo name seja fornecido
      if (!data.name) {
        toast({ title: 'Erro ao criar centro de custo', description: 'O nome é obrigatório.', variant: 'destructive' });
        return null;
      }
      
      const payload: CostCenterPayload = {
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        segment_id: data.segment_id
      };
      
      const response = await createCostCenter(payload);
      const item = response.data?.costCenter;
      
      if (item) {
        setState((s) => ({ ...s, items: [item, ...s.items] }));
        toast({ title: 'Centro de custo criado', description: item.name || 'Registro criado.' });
        return item;
      }
      
      toast({ title: 'Aviso', description: 'Centro de custo criado, mas não foi possível atualizar a lista' });
      return null;
    } catch (e) {
      toast({ title: 'Erro ao criar centro de custo', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<CostCenter>) => {
    try {
      // Garantir que o campo name seja fornecido
      if (!data.name) {
        toast({ title: 'Erro ao atualizar centro de custo', description: 'O nome é obrigatório.', variant: 'destructive' });
        return null;
      }
      
      const payload: CostCenterPayload = {
        name: data.name,
        description: data.description,
        is_active: data.is_active,
        segment_id: data.segment_id
      };
      
      const response = await updateCostCenter(id, payload);
      const item = response.data?.costCenter;
      
      if (item) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? item : it)),
        }));
        toast({ title: 'Centro de custo atualizado', description: item.name || 'Registro atualizado.' });
        return item;
      }
      
      toast({ title: 'Aviso', description: 'Centro de custo atualizado, mas não foi possível atualizar a lista' });
      return null;
    } catch (e) {
      toast({ title: 'Erro ao atualizar centro de custo', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteCostCenter(id);
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
