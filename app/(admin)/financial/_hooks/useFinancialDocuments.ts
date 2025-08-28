import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { getFinancialDocuments, createFinancialDocument, updateFinancialDocument, deleteFinancialDocument, normalizeFinancialDocument } from '@/services/financialDocumentsService';
import type { FinancialDocument } from '@/types/FinancialDocument';

// Usando a interface FinancialDocument importada de @/types

interface State {
  items: FinancialDocument[];
  loading: boolean;
  refetching: boolean;
  page: number;
  hasMore: boolean;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
  create: (data: Partial<FinancialDocument>) => Promise<FinancialDocument | null>;
  update: (id: string, data: Partial<FinancialDocument>) => Promise<FinancialDocument | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

// Usando a função normalizeFinancialDocument do service

export function useFinancialDocuments() {
  const [state, setState] = useState<State>({ items: [], loading: false, refetching: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const response = await getFinancialDocuments({ page, pageSize: PAGE_SIZE });
    const list = response.data?.financialDocuments || [];
    console.log('📊 Dados financeiros recebidos do backend:', {
      page,
      total: list.length,
      response: response.data,
      rawData: list
    });
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
        refetching: false,
        page,
        hasMore: list.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, refetching: false }));
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

  const refetch = useCallback(async () => {
    setState((s) => ({ ...s, refetching: true }));
    try {
      const list = await fetchPage(1);
      // Ordenar por data de criação decrescente
      const sortedList = list.sort((a, b) => {
        const dateA = new Date(a.created_at || 0).getTime();
        const dateB = new Date(b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setState((s) => ({
        ...s,
        items: sortedList,
        refetching: false,
        page: 1,
        hasMore: list.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, refetching: false }));
      toast({ title: 'Falha ao recarregar dados', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  }, [fetchPage]);

  const create = useCallback(async (data: Partial<FinancialDocument>) => {
    try {
      const response = await createFinancialDocument(data);
      if (!response.data?.financialDocument) {
        toast({ title: 'Erro ao criar documento', description: 'Dados não retornados pelo servidor.', variant: 'destructive' });
        return null;
      }
      const item = normalizeFinancialDocument(response.data.financialDocument);
      toast({ title: 'Documento criado', description: item?.notes || 'Registro criado.' });
      // Refetch automático após criação
      await refetch();
      return item;
    } catch (e) {
      toast({ title: 'Erro ao criar documento', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, [refetch]);

  const update = useCallback(async (id: string, data: Partial<FinancialDocument>) => {
    try {
      const response = await updateFinancialDocument(id, data);
      if (!response.data?.financialDocument) {
        toast({ title: 'Erro ao atualizar documento', description: 'Dados não retornados pelo servidor.', variant: 'destructive' });
        return null;
      }
      const item = normalizeFinancialDocument(response.data.financialDocument);
      toast({ title: 'Documento atualizado', description: item?.notes || 'Registro atualizado.' });
      // Refetch automático após atualização
      await refetch();
      return item;
    } catch (e) {
      toast({ title: 'Erro ao atualizar documento', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, [refetch]);

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

  const api: Api = useMemo(() => ({ load, loadMore, refetch, create, update, remove }), [load, loadMore, refetch, create, update, remove]);

  return { ...state, ...api };
}
