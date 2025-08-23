import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export interface FinancialDocument {
  id: string;
  type?: string | null; // invoice, receipt, payment, etc.
  description?: string | null;
  amount?: number | null;
  date?: string | null;
  due_date?: string | null;
  status?: string | null; // pending, paid, canceled
  partner_id?: string | null;
  partner_name?: string | null;
  segment_id?: string | null;
}

interface State {
  items: FinancialDocument[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<FinancialDocument>) => Promise<FinancialDocument | null>;
  update: (id: string, data: Partial<FinancialDocument>) => Promise<FinancialDocument | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useFinancialDocuments() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const res = await apiService.getFinancialDocuments({ page, pageSize: PAGE_SIZE });
    const list = (res as any).financialDocuments || (res as any).data || [];
    return list as FinancialDocument[];
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
      toast({ title: 'Falha ao carregar documentos financeiros', description: 'Tente novamente em instantes.', variant: 'destructive' });
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

  const create = useCallback(async (data: Partial<FinancialDocument>) => {
    try {
      const res = await apiService.createFinancialDocument(data);
      const item = (res as any).financialDocument || (res as any).data || res;
      setState((s) => ({ ...s, items: [item as FinancialDocument, ...s.items] }));
      toast({ title: 'Documento criado', description: (item as FinancialDocument)?.description || 'Registro criado.' });
      return item as FinancialDocument;
    } catch (e) {
      toast({ title: 'Erro ao criar documento', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<FinancialDocument>) => {
    try {
      const res = await apiService.updateFinancialDocument(id, data);
      const item = (res as any).financialDocument || (res as any).data || res;
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? (item as FinancialDocument) : it)),
      }));
      toast({ title: 'Documento atualizado', description: (item as FinancialDocument)?.description || 'Registro atualizado.' });
      return item as FinancialDocument;
    } catch (e) {
      toast({ title: 'Erro ao atualizar documento', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiService.deleteFinancialDocument(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Documento removido', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover documento', description: 'Tente novamente.', variant: 'destructive' });
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
