import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listFinancialDocuments, createFinancialDocument, updateFinancialDocument, deleteFinancialDocument } from '@/services/financialService';
import type { FinancialDocument } from '@/types';

// Usando a interface FinancialDocument importada de @/types

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
  const documentType =
    row?.document_type ?? row?.type ?? (direction === 'payable' ? 'expense' : direction === 'receivable' ? 'income' : 'other');
  const entityName =
    (row.entity && typeof row.entity === 'object' ? row.entity.name : undefined)
    ?? row.entity_name
    ?? (typeof row.entity === 'string' ? row.entity : undefined)
    ?? row.partner_name
    ?? null;
  return {
    id: row.id,
    document_number: row.document_number ?? '',
    document_type: documentType,
    issue_date: row.issue_date ?? row.date ?? '',
    due_date: row.due_date ?? '',
    amount: row.amount != null ? Number(row.amount) : 0,
    status: row.status === 'open' ? 'pending' : row.status ?? '',
    entity_id: row.entity_id ?? row.partner_id ?? null,
    entity_name: entityName,
    entity_type: row.entity_type ?? 'customer',
    notes: row.notes ?? row.description ?? null,
    payment_method: row.payment_method ?? null,
    category: row.category ?? null
  };
}

export function useFinancialDocuments() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const response = await listFinancialDocuments({ page, pageSize: PAGE_SIZE });
    const list = response.data?.financialDocuments || [];
    return list.map(normalizeFinancialDocument);
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
      const response = await createFinancialDocument(data);
      if (!response.data?.financialDocument) {
        toast({ title: 'Erro ao criar documento', description: 'Dados não retornados pelo servidor.', variant: 'destructive' });
        return null;
      }
      const item = normalizeFinancialDocument(response.data.financialDocument);
      setState((s) => ({ ...s, items: [item, ...s.items] }));
      toast({ title: 'Documento criado', description: item?.notes || 'Registro criado.' });
      return item;
    } catch (e) {
      toast({ title: 'Erro ao criar documento', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<FinancialDocument>) => {
    try {
      const response = await updateFinancialDocument(id, data);
      if (!response.data?.financialDocument) {
        toast({ title: 'Erro ao atualizar documento', description: 'Dados não retornados pelo servidor.', variant: 'destructive' });
        return null;
      }
      const item = normalizeFinancialDocument(response.data.financialDocument);
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? item : it)),
      }));
      toast({ title: 'Documento atualizado', description: item?.notes || 'Registro atualizado.' });
      return item;
    } catch (e) {
      toast({ title: 'Erro ao atualizar documento', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await deleteFinancialDocument(id);
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Erro ao excluir');
      }
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
