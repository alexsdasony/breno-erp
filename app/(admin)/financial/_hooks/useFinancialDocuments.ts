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
  forceRefresh: () => Promise<void>;
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
      let currentPage: number;
      setState((s) => {
        currentPage = reset ? 1 : s.page;
        return s;
      });
      const list = await fetchPage(currentPage!);
      setState((s) => ({
        ...s,
        items: reset ? list : [...s.items, ...list],
        loading: false,
        refetching: false,
        page: currentPage!,
        hasMore: list.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false, refetching: false }));
      toast({ title: 'Falha ao carregar documentos financeiros', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    let canLoad = false;
    let nextPage: number;
    setState((s) => {
      canLoad = !s.loading && s.hasMore;
      nextPage = s.page + 1;
      return canLoad ? { ...s, page: nextPage, loading: true } : s;
    });
    
    if (!canLoad) return;
    
    try {
      const list = await fetchPage(nextPage!);
      setState((s) => ({
        ...s,
        items: [...s.items, ...list],
        hasMore: list.length === PAGE_SIZE,
        loading: false,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({ title: 'Falha ao carregar mais documentos', description: 'Tente novamente.', variant: 'destructive' });
    }
  }, [fetchPage]);

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
      
      // Atualizar estado local diretamente (padrão cost-centers)
      if (item) {
        setState((s) => ({ ...s, items: [item, ...s.items] }));
      }
      
      toast({ title: 'Documento criado', description: item?.description || 'Registro criado.' });
      return item;
    } catch (e) {
      console.error('Erro ao criar documento:', e);
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
      
      // Atualizar estado local diretamente (padrão cost-centers)
      if (item) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? item : it)),
        }));
      }
      
      toast({ title: 'Documento atualizado', description: item?.description || 'Registro atualizado.' });
      return item;
    } catch (e) {
      console.error('Erro ao atualizar documento:', e);
      toast({ title: 'Erro ao atualizar documento', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const forceRefresh = useCallback(async () => {
    console.log('🔄 Forçando refresh completo dos dados financeiros');
    await refetch();
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
      console.error('Erro ao remover documento:', e);
      toast({ title: 'Erro ao remover documento', description: 'Tente novamente.', variant: 'destructive' });
      return false;
    }
  }, []);

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: Api = useMemo(() => ({ load, loadMore, refetch, forceRefresh, create, update, remove }), [load, loadMore, refetch, forceRefresh, create, update, remove]);

  return { ...state, ...api };
}
