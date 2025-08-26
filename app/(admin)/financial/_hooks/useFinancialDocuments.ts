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
  payment_method_id?: string | null;
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

// Normalize backend row (DB schema) to frontend shape expected by UI
function normalizeFinancialDocument(row: any): FinancialDocument {
  const direction: string | undefined = row?.direction;
  const mappedType =
    row?.type ?? (direction === 'payable' ? 'expense' : direction === 'receivable' ? 'income' : null);
  const partnerName =
    (row.partner && typeof row.partner === 'object' ? row.partner.name : undefined)
    ?? row.partner_name
    ?? (typeof row.partner === 'string' ? row.partner : undefined)
    ?? null;
  return {
    id: row.id,
    type: mappedType,
    description: row.description ?? null,
    amount: row.amount != null ? Number(row.amount) : null,
    date: row.date ?? row.issue_date ?? null,
    due_date: row.due_date ?? null,
    status: row.status === 'open' ? 'pending' : row.status ?? null,
    partner_id: row.partner_id ?? null,
    partner_name: partnerName,
    segment_id: row.segment_id ?? null,
    payment_method_id: row.payment_method_id ?? null,
  };
}

export function useFinancialDocuments() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const res = await apiService.getFinancialDocuments({ page, pageSize: PAGE_SIZE });
    const list = (res as any).financialDocuments || (res as any).data || [];
    return (list as any[]).map(normalizeFinancialDocument);
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
      const raw = (res as any).financialDocument || (res as any).data || res;
      const item = normalizeFinancialDocument(raw);
      setState((s) => ({ ...s, items: [item, ...s.items] }));
      toast({ title: 'Documento criado', description: item?.description || 'Registro criado.' });
      return item;
    } catch (e) {
      toast({ title: 'Erro ao criar documento', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<FinancialDocument>) => {
    try {
      const res = await apiService.updateFinancialDocument(id, data);
      const raw = (res as any).financialDocument || (res as any).data || res;
      const item = normalizeFinancialDocument(raw);
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? item : it)),
      }));
      toast({ title: 'Documento atualizado', description: item?.description || 'Registro atualizado.' });
      return item;
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
