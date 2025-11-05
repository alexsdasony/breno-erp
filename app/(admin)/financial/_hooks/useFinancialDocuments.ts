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

export function useFinancialDocuments(pageSize: number = PAGE_SIZE, dateStart?: string, dateEnd?: string, segmentId?: string) {
  const [state, setState] = useState<State>({ items: [], loading: false, refetching: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    try {
      const params: Record<string, any> = { page, pageSize };
      
      // Adicionar filtros de data se fornecidos
      if (dateStart) {
        params.dateStart = dateStart;
      }
      if (dateEnd) {
        params.dateEnd = dateEnd;
      }
      
      // Adicionar filtro de segmento se fornecido
      if (segmentId && segmentId !== '') {
        params.segment_id = segmentId;
      }
      
      const response = await getFinancialDocuments(params);
      const list = response.data?.financialDocuments || [];
      
      // Se não há dados, tentar buscar diretamente da API
      if (list.length === 0) {
        try {
          const directResponse = await fetch(`/api/financial-documents?page=1&pageSize=${pageSize}`, {
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const directData = await directResponse.json();
          
          if (directData.financialDocuments && directData.financialDocuments.length > 0) {
            const directList = directData.financialDocuments || [];
            return directList.map(normalizeFinancialDocument);
          }
        } catch (error) {
          console.error('Erro na busca direta:', error);
        }
      }
      
      return list.map(normalizeFinancialDocument);
    } catch (error) {
      console.error('Erro ao buscar documentos financeiros:', error);
      return [];
    }
  }, [pageSize, dateStart, dateEnd, segmentId]);

  const load = useCallback(async (reset: boolean = false) => {
    setState((s) => ({ ...s, loading: true, ...(reset ? { page: 1 } : {}) }));
    try {
      let currentPage: number;
      setState((s) => {
        currentPage = reset ? 1 : s.page;
        return s;
      });
      const list = await fetchPage(currentPage!);
      setState((s) => {
        const newItems = reset ? list : [...s.items, ...list];
        return {
          ...s,
          items: newItems,
          loading: false,
          refetching: false,
          page: currentPage!,
          hasMore: list.length === PAGE_SIZE,
        };
      });
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
      // Ordenar por data de emissão decrescente
      const sortedList = list.sort((a: any, b: any) => {
        const dateA = new Date(a.issue_date || 0).getTime();
        const dateB = new Date(b.issue_date || 0).getTime();
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

  // TODO: Analise humana
  const update = useCallback(async (id: string, data: Partial<FinancialDocument>) => {
    try {
      const response = await updateFinancialDocument(id, data);
      console.log('PUT /financial-documents/' + id + ' - Resposta recebida', response);
      const documentData = response.data?.financialDocument;
      if (!documentData) {
        console.log('PUT /financial-documents/' + id + ' - Dados não retornados pelo servidor', response);
        toast({ title: 'Erro ao atualizar documento', description: 'Dados não retornados pelo servidor.', variant: 'destructive' });
        return null;
      }
      const item = normalizeFinancialDocument(documentData);
      console.log('PUT /financial-documents/' + id + ' - Dados normalizados', item);
      // Atualizar estado local diretamente (padrão cost-centers)
      if (item) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? item : it)),
        }));
      }
      
      toast({ title: 'Documento atualizado', description: item?.description || 'Registro atualizado.' });
      // Refetch
      console.log('PUT /financial-documents/' + id + ' - Forçando refresh completo dos dados financeiros');
      await refetch();
      return item;
    } catch (e) {
      console.error('Erro ao atualizar documento:', e);
      toast({ title: 'Erro ao atualizar documento', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, [refetch]);

  const forceRefresh = useCallback(async () => {
    console.log('Forçando refresh completo dos dados financeiros');
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
