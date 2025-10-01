import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/services/suppliersService';
import type { Supplier, SupplierPayload } from '@/types';

export interface UseSuppliersState {
  items: Supplier[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

export interface UseSuppliersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: SupplierPayload) => Promise<Supplier | null>;
  update: (id: string, data: SupplierPayload) => Promise<Supplier | null>;
  remove: (id: string) => Promise<boolean>;
  search: (query: string) => Promise<Supplier[]>;
  toggleStatus: (id: string) => Promise<Supplier | null>;
}

const PAGE_SIZE = 20;

export function useSuppliers() {
  const [state, setState] = useState<UseSuppliersState>({
    items: [],
    loading: false,
    page: 1,
    hasMore: true
  });

  const load = useCallback(async (reset: boolean = false) => {
    setState((s) => ({ ...s, loading: true, ...(reset ? { page: 1 } : {}) }));
    try {
      const page = reset ? 1 : state.page;
      const params: any = { page, pageSize: PAGE_SIZE };
      
      const response = await listSuppliers(params);
      if (response.error) {
        throw new Error(response.error);
      }
      const suppliers = response.data?.suppliers || [];
      setState((s) => ({
        items: reset ? suppliers : [...s.items, ...suppliers],
        loading: false,
        page,
        hasMore: suppliers.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Falha ao carregar fornecedores',
        description: 'Tente novamente em instantes.',
        variant: 'destructive'
      });
    }
  }, [state.page]);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    
    try {
      const params: any = { page: nextPage, pageSize: PAGE_SIZE };
      
      const response = await listSuppliers(params);
      if (response.error) {
        throw new Error(response.error);
      }
      const suppliers = response.data?.suppliers || [];
      setState((s) => ({
        ...s,
        items: [...s.items, ...suppliers],
        hasMore: suppliers.length === PAGE_SIZE,
        loading: false,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Falha ao carregar mais fornecedores',
        description: 'Tente novamente em instantes.',
        variant: 'destructive'
      });
    }
  }, [state.loading, state.hasMore, state.page]);

  const create = useCallback(async (data: SupplierPayload) => {
    console.log('🚀 useSuppliers.create chamado com dados:', data);
    try {
      const response = await createSupplier(data);
      console.log('📥 Resposta do createSupplier:', response);
      if (response.error) {
        console.log('❌ Erro na resposta:', response.error);
        throw new Error(response.error);
      }
      const supplier = response.data?.supplier;
      console.log('📦 Supplier extraído:', supplier);
      if (supplier) {
        setState((s) => ({ ...s, items: [supplier, ...s.items] }));
        toast({
          title: 'Fornecedor criado',
          description: supplier.razao_social || 'Registro criado.'
        });
        console.log('✅ Fornecedor criado com sucesso');
        return supplier;
      }
      console.log('⚠️ Nenhum supplier retornado');
      return null;
    } catch (e) {
      console.error('❌ Erro em useSuppliers.create:', e);
      toast({
        title: 'Erro ao criar fornecedor',
        description: 'Verifique os dados informados.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: SupplierPayload) => {
    try {
      const response = await updateSupplier(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      const supplier = response.data?.supplier;
      if (supplier) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? supplier : it)),
        }));
        toast({
          title: 'Fornecedor atualizado',
          description: supplier.razao_social || 'Registro atualizado.'
        });
        return supplier;
      }
      return null;
    } catch (e) {
      toast({
        title: 'Erro ao atualizar fornecedor',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await deleteSupplier(id);
      if (response.error) {
        throw new Error(response.error);
      }
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({
        title: 'Fornecedor removido',
        description: 'Registro excluído com sucesso.'
      });
      return true;
    } catch (e) {
      toast({
        title: 'Erro ao remover fornecedor',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return false;
    }
  }, []);

  const search = useCallback(async (query: string) => {
    try {
      const params: any = { q: query, page: 1, pageSize: 50 };
      
      const response = await listSuppliers(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.suppliers || [];
    } catch (e) {
      console.error('Erro ao buscar fornecedores:', e);
      return [];
    }
  }, []);

  const toggleStatus = useCallback(async (id: string) => {
    try {
      console.log('🔄 [TOGGLE] Iniciando toggle status para:', id);
      
      // Encontrar o fornecedor atual
      const currentSupplier = state.items.find(supplier => supplier.id === id);
      if (!currentSupplier) {
        console.error('❌ [TOGGLE] Fornecedor não encontrado:', id);
        throw new Error('Fornecedor não encontrado');
      }

      console.log('🔄 [TOGGLE] Fornecedor atual:', currentSupplier);

      // Alternar status: 'ativo' <-> 'inativo'
      const newStatus = currentSupplier.status === 'ativo' ? 'inativo' : 'ativo';
      
      console.log('🔄 [TOGGLE] Toggle status:', {
        current: currentSupplier.status,
        new: newStatus,
        supplierId: id,
        supplierName: currentSupplier.razao_social || currentSupplier.nome_fantasia
      });
      
      console.log('🔄 [TOGGLE] Chamando updateSupplier com:', { id, status: newStatus });
      const response = await updateSupplier(id, { status: newStatus } as any);
      
      console.log('🔄 [TOGGLE] Resposta do updateSupplier:', response);
      
      if (response.error) {
        console.error('❌ [TOGGLE] Erro na resposta:', response.error);
        throw new Error(response.error);
      }
      
      const supplier = response.data?.supplier;
      console.log('🔄 [TOGGLE] Fornecedor retornado:', supplier);
      
      if (supplier) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? supplier : it)),
        }));
        toast({
          title: 'Status alterado',
          description: `Fornecedor ${newStatus === 'ativo' ? 'ativado' : 'inativado'} com sucesso.`
        });
        console.log('✅ [TOGGLE] Status alterado com sucesso');
        return supplier;
      }
      
      console.warn('⚠️ [TOGGLE] Nenhum fornecedor retornado');
      return null;
    } catch (e) {
      console.error('❌ [TOGGLE] Erro ao alterar status:', e);
      toast({
        title: 'Erro ao alterar status',
        description: e instanceof Error ? e.message : 'Tente novamente.',
        variant: 'destructive'
      });
      return null;
    }
  }, [state.items]);

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: UseSuppliersApi = useMemo(
    () => ({ load, loadMore, create, update, remove, search, toggleStatus }),
    [load, loadMore, create, update, remove, search, toggleStatus]
  );

  return { ...state, ...api };
}
