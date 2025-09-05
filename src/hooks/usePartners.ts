import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listPartners, createPartner, updatePartner, deletePartner } from '@/services/partnersService';
import type { Partner } from '@/types';

export type PartnerRole = 'customer' | 'supplier';

export interface UsePartnersState {
  items: Partner[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

export interface UsePartnersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<Partner>) => Promise<Partner | null>;
  update: (id: string, data: Partial<Partner>) => Promise<Partner | null>;
  remove: (id: string) => Promise<boolean>;
  search: (query: string) => Promise<Partner[]>;
}

const PAGE_SIZE = 20;

export function usePartners(role?: PartnerRole) {
  const [state, setState] = useState<UsePartnersState>({
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
      if (role) params.role = role;
      
      const response = await listPartners(params);
      if (response.error) {
        throw new Error(response.error);
      }
      const partners = response.data?.partners || [];
      setState((s) => ({
        items: reset ? partners : [...s.items, ...partners],
        loading: false,
        page,
        hasMore: partners.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      const entityName = role === 'customer' ? 'clientes' : role === 'supplier' ? 'fornecedores' : 'parceiros';
      toast({
        title: `Falha ao carregar ${entityName}`,
        description: 'Tente novamente em instantes.',
        variant: 'destructive'
      });
    }
  }, [state.page, role]);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    
    try {
      const params: any = { page: nextPage, pageSize: PAGE_SIZE };
      if (role) params.role = role;
      
      const response = await listPartners(params);
      if (response.error) {
        throw new Error(response.error);
      }
      const partners = response.data?.partners || [];
      setState((s) => ({
        ...s,
        items: [...s.items, ...partners],
        hasMore: partners.length === PAGE_SIZE,
        loading: false,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      const entityName = role === 'customer' ? 'clientes' : role === 'supplier' ? 'fornecedores' : 'parceiros';
      toast({
        title: `Falha ao carregar mais ${entityName}`,
        description: 'Tente novamente em instantes.',
        variant: 'destructive'
      });
    }
  }, [state.loading, state.hasMore, state.page, role]);

  const create = useCallback(async (data: Partial<Partner>) => {
    try {
      const response = await createPartner(data);
      if (response.error) {
        throw new Error(response.error);
      }
      const partner = response.data?.partner;
      if (partner) {
        setState((s) => ({ ...s, items: [partner, ...s.items] }));
        const entityName = role === 'customer' ? 'Cliente' : role === 'supplier' ? 'Fornecedor' : 'Parceiro';
        toast({
          title: `${entityName} criado`,
          description: partner.name || 'Registro criado.'
        });
        return partner;
      }
      return null;
    } catch (e) {
      const entityName = role === 'customer' ? 'cliente' : role === 'supplier' ? 'fornecedor' : 'parceiro';
      toast({
        title: `Erro ao criar ${entityName}`,
        description: 'Verifique os dados informados.',
        variant: 'destructive'
      });
      return null;
    }
  }, [role]);

  const update = useCallback(async (id: string, data: Partial<Partner>) => {
    try {
      const response = await updatePartner(id, data);
      if (response.error) {
        throw new Error(response.error);
      }
      const partner = response.data?.partner;
      if (partner) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? partner : it)),
        }));
        const entityName = role === 'customer' ? 'Cliente' : role === 'supplier' ? 'Fornecedor' : 'Parceiro';
        toast({
          title: `${entityName} atualizado`,
          description: partner.name || 'Registro atualizado.'
        });
        return partner;
      }
      return null;
    } catch (e) {
      const entityName = role === 'customer' ? 'cliente' : role === 'supplier' ? 'fornecedor' : 'parceiro';
      toast({
        title: `Erro ao atualizar ${entityName}`,
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return null;
    }
  }, [role]);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await deletePartner(id);
      if (response.error) {
        throw new Error(response.error);
      }
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      const entityName = role === 'customer' ? 'Cliente' : role === 'supplier' ? 'Fornecedor' : 'Parceiro';
      toast({
        title: `${entityName} removido`,
        description: 'Registro excluído com sucesso.'
      });
      return true;
    } catch (e) {
      const entityName = role === 'customer' ? 'cliente' : role === 'supplier' ? 'fornecedor' : 'parceiro';
      toast({
        title: `Erro ao remover ${entityName}`,
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return false;
    }
  }, [role]);

  const search = useCallback(async (query: string) => {
    try {
      const params: any = { q: query, page: 1, pageSize: 50 };
      if (role) params.role = role;
      
      const response = await listPartners(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.partners || [];
    } catch (e) {
      console.error('Erro ao buscar parceiros:', e);
      return [];
    }
  }, [role]);

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const api: UsePartnersApi = useMemo(
    () => ({ load, loadMore, create, update, remove, search }),
    [load, loadMore, create, update, remove, search]
  );

  return { ...state, ...api };
}

// Hooks especializados para facilitar o uso
export const useCustomers = () => usePartners('customer');
export const useSuppliers = () => usePartners('supplier');