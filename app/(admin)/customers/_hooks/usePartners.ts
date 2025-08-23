import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

// Minimal Customer type aligned to apiService.getCustomers mapping
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  cpf: string;
  cnpj: string;
  status: string;
  segment_id: string | null;
}

export interface UsePartnersState {
  items: Customer[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

export interface UsePartnersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<Customer>) => Promise<Customer | null>;
  update: (id: string, data: Partial<Customer>) => Promise<Customer | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function usePartners() {
  const [state, setState] = useState<UsePartnersState>({ items: [], loading: false, page: 1, hasMore: true });

  const load = useCallback(async (reset: boolean = false) => {
    setState((s) => ({ ...s, loading: true, ...(reset ? { page: 1 } : {}) }));
    try {
      const page = reset ? 1 : state.page;
      const { customers } = await apiService.getCustomers({ page, pageSize: PAGE_SIZE });
      setState((s) => ({
        items: reset ? customers : [...s.items, ...customers],
        loading: false,
        page,
        hasMore: customers.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({ title: 'Falha ao carregar clientes', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  }, [state.page]);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    // After updating page, trigger load for next page
    const { customers } = await apiService.getCustomers({ page: nextPage, pageSize: PAGE_SIZE });
    setState((s) => ({
      ...s,
      items: [...s.items, ...customers],
      hasMore: customers.length === PAGE_SIZE,
      loading: false,
    }));
  }, [state.loading, state.hasMore, state.page]);

  const create = useCallback(async (data: Partial<Customer>) => {
    try {
      const { customer } = await apiService.createCustomer(data);
      setState((s) => ({ ...s, items: [customer, ...s.items] }));
      toast({ title: 'Cliente criado', description: customer?.name || 'Registro criado.' });
      return customer as Customer;
    } catch (e) {
      toast({ title: 'Erro ao criar cliente', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<Customer>) => {
    try {
      const { customer } = await apiService.updateCustomer(id, data);
      setState((s) => ({
        ...s,
        items: s.items.map((it) => (it.id === id ? customer : it)),
      }));
      toast({ title: 'Cliente atualizado', description: customer?.name || 'Registro atualizado.' });
      return customer as Customer;
    } catch (e) {
      toast({ title: 'Erro ao atualizar cliente', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiService.deleteCustomer(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Cliente removido', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover cliente', description: 'Tente novamente.', variant: 'destructive' });
      return false;
    }
  }, []);

  useEffect(() => {
    // initial load
    void load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const api: UsePartnersApi = useMemo(() => ({ load, loadMore, create, update, remove }), [load, loadMore, create, update, remove]);

  return { ...state, ...api };
}
