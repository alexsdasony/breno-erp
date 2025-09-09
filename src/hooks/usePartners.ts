import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listPartners, createPartner, updatePartner, deletePartner } from '@/services/partnersService';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '@/services/customersService';
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/services/suppliersService';
import type { Partner, Customer, Supplier } from '@/types';

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

export interface UseCustomersState {
  items: Customer[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

export interface UseCustomersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<Customer>) => Promise<Customer | null>;
  update: (id: string, data: Partial<Customer>) => Promise<Customer | null>;
  remove: (id: string) => Promise<boolean>;
  search: (query: string) => Promise<Customer[]>;
  toggleStatus: (id: string) => Promise<Customer | null>;
}

export interface UseSuppliersState {
  items: Supplier[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

export interface UseSuppliersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<Supplier>) => Promise<Supplier | null>;
  update: (id: string, data: Partial<Supplier>) => Promise<Supplier | null>;
  remove: (id: string) => Promise<boolean>;
  search: (query: string) => Promise<Supplier[]>;
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
export const useCustomers = () => {
  const [state, setState] = useState<UseCustomersState>({
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
      
      const response = await getCustomers(params);
      if (response.error) {
        throw new Error(response.error);
      }
      const customers = response.data?.customers || [];
      setState((s) => ({
        items: reset ? customers : [...s.items, ...customers],
        loading: false,
        page,
        hasMore: customers.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Falha ao carregar clientes',
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
      
      const response = await getCustomers(params);
      if (response.error) {
        throw new Error(response.error);
      }
      const customers = response.data?.customers || [];
      setState((s) => ({
        ...s,
        items: [...s.items, ...customers],
        hasMore: customers.length === PAGE_SIZE,
        loading: false,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Falha ao carregar mais clientes',
        description: 'Tente novamente em instantes.',
        variant: 'destructive'
      });
    }
  }, [state.loading, state.hasMore, state.page]);

  const create = useCallback(async (data: Partial<Customer>) => {
    try {
      const response = await createCustomer(data as any);
      if (response.error) {
        throw new Error(response.error);
      }
      const customer = response.data?.customer;
      if (customer) {
        setState((s) => ({ ...s, items: [customer, ...s.items] }));
        toast({
          title: 'Cliente criado',
          description: customer.name || 'Registro criado.'
        });
        return customer;
      }
      return null;
    } catch (e) {
      toast({
        title: 'Erro ao criar cliente',
        description: 'Verifique os dados informados.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Customer>) => {
    try {
      const response = await updateCustomer(id, data as any);
      if (response.error) {
        throw new Error(response.error);
      }
      const customer = response.data?.customer;
      if (customer) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? customer : it)),
        }));
        toast({
          title: 'Cliente atualizado',
          description: customer.name || 'Registro atualizado.'
        });
        return customer;
      }
      return null;
    } catch (e) {
      toast({
        title: 'Erro ao atualizar cliente',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      const response = await deleteCustomer(id);
      if (response.error) {
        throw new Error(response.error);
      }
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({
        title: 'Cliente removido',
        description: 'Registro excluído com sucesso.'
      });
      return true;
    } catch (e) {
      toast({
        title: 'Erro ao remover cliente',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return false;
    }
  }, []);

  const search = useCallback(async (query: string) => {
    try {
      const params: any = { q: query, page: 1, pageSize: 50 };
      
      const response = await getCustomers(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data?.customers || [];
    } catch (e) {
      console.error('Erro ao buscar clientes:', e);
      return [];
    }
  }, []);

  const toggleStatus = useCallback(async (id: string) => {
    try {
      // Encontrar o cliente atual
      const currentCustomer = state.items.find(customer => customer.id === id);
      if (!currentCustomer) {
        throw new Error('Cliente não encontrado');
      }

      console.log('🔄 Toggle status - Cliente atual:', {
        id: currentCustomer.id,
        name: currentCustomer.name,
        currentStatus: currentCustomer.status
      });

      // Alternar status: 'ativo' <-> 'inativo'
      const newStatus = currentCustomer.status === 'ativo' ? 'inativo' : 'ativo';
      
      console.log('🔄 Toggle status - Novo status:', newStatus);
      
      const response = await updateCustomer(id, { status: newStatus } as any);
      if (response.error) {
        console.error('❌ Erro na resposta da API:', response.error);
        throw new Error(response.error);
      }
      
      const customer = response.data?.customer;
      if (customer) {
        console.log('✅ Cliente atualizado com sucesso:', customer);
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? customer : it)),
        }));
        toast({
          title: 'Status alterado',
          description: `Cliente ${newStatus === 'ativo' ? 'ativado' : 'inativado'} com sucesso.`
        });
        return customer;
      }
      return null;
    } catch (e) {
      console.error('❌ Erro no toggleStatus:', e);
      toast({
        title: 'Erro ao alterar status',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return null;
    }
  }, [state.items, update]);

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: UseCustomersApi = useMemo(
    () => ({ load, loadMore, create, update, remove, search, toggleStatus }),
    [load, loadMore, create, update, remove, search, toggleStatus]
  );

  return { ...state, ...api };
};

export const useSuppliers = () => {
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

  const create = useCallback(async (data: Partial<Supplier>) => {
    try {
      const response = await createSupplier(data as any);
      if (response.error) {
        throw new Error(response.error);
      }
      const supplier = response.data?.supplier;
      if (supplier) {
        setState((s) => ({ ...s, items: [supplier, ...s.items] }));
        toast({
          title: 'Fornecedor criado',
          description: supplier.razao_social || 'Registro criado.'
        });
        return supplier;
      }
      return null;
    } catch (e) {
      toast({
        title: 'Erro ao criar fornecedor',
        description: 'Verifique os dados informados.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Supplier>) => {
    try {
      const response = await updateSupplier(id, data as any);
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

  useEffect(() => {
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: UseSuppliersApi = useMemo(
    () => ({ load, loadMore, create, update, remove, search }),
    [load, loadMore, create, update, remove, search]
  );

  return { ...state, ...api };
};