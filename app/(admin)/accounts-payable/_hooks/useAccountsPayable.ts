import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listAccountsPayable, createAccountPayable, updateAccountPayable, deleteAccountPayable } from '@/services/accountsPayableService';
import { AccountPayable, AccountPayablePayload } from '@/types';

export type AccountPayableItem = AccountPayable;

interface State {
  items: AccountPayableItem[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

interface UseAccountsPayableReturn {
  items: AccountPayableItem[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  create: (data: Partial<AccountPayableItem>) => Promise<AccountPayableItem | null>;
  update: (id: string, data: Partial<AccountPayableItem>) => Promise<AccountPayableItem | null>;
  remove: (id: string) => Promise<boolean>;
}

interface Api {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<AccountPayableItem>) => Promise<AccountPayableItem | null>;
  update: (id: string, data: Partial<AccountPayableItem>) => Promise<AccountPayableItem | null>;
  remove: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useAccountsPayable() {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });

  const fetchPage = useCallback(async (page: number) => {
    const response = await listAccountsPayable({ page, pageSize: PAGE_SIZE });
    return response.data?.accounts_payable || [];
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
      toast({ title: 'Falha ao carregar contas a pagar', description: 'Tente novamente em instantes.', variant: 'destructive' });
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

  const create = useCallback(async (data: Partial<AccountPayableItem>) => {
    try {
      // Validar campos obrigatórios
      if (!data.description) {
        toast({ title: 'Erro ao criar conta a pagar', description: 'A descrição é obrigatória.', variant: 'destructive' });
        return null;
      }
      
      if (!data.amount && data.amount !== 0) {
        toast({ title: 'Erro ao criar conta a pagar', description: 'O valor é obrigatório.', variant: 'destructive' });
        return null;
      }
      
      // Criar payload com campos obrigatórios
      const payload: AccountPayablePayload = {
        description: data.description,
        amount: typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount,
        due_date: data.due_date,
        supplier_id: data.supplier_id,
        category: data.category,
        status: data.status,
        segment_id: data.segment_id,
        notes: data.notes,
        payment_date: data.payment_date,
        payment_method: data.payment_method
      };
      
      const response = await createAccountPayable(payload);
      const item = response.data?.account_payable;
      
      if (item) {
        setState((s) => ({ ...s, items: [item, ...s.items] }));
        toast({ title: 'Conta a pagar criada', description: item.description || 'Registro criado.' });
        return item;
      }
      
      toast({ title: 'Aviso', description: 'Conta a pagar criada, mas não foi possível atualizar a lista' });
      return null;
    } catch (e) {
      toast({ title: 'Erro ao criar conta a pagar', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<AccountPayableItem>) => {
    try {
      // Validar campos obrigatórios se estiverem presentes no payload
      if (data.description === '') {
        toast({ title: 'Erro ao atualizar conta a pagar', description: 'A descrição não pode ser vazia.', variant: 'destructive' });
        return null;
      }
      
      // Criar payload com os campos fornecidos
      const payload: Partial<AccountPayablePayload> = {};
      
      if (data.description !== undefined) payload.description = data.description;
      if (data.amount !== undefined) payload.amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount;
      if (data.due_date !== undefined) payload.due_date = data.due_date;
      if (data.supplier_id !== undefined) payload.supplier_id = data.supplier_id;
      if (data.category !== undefined) payload.category = data.category;
      if (data.status !== undefined) payload.status = data.status;
      if (data.segment_id !== undefined) payload.segment_id = data.segment_id;
      if (data.notes !== undefined) payload.notes = data.notes;
      if (data.payment_date !== undefined) payload.payment_date = data.payment_date;
      if (data.payment_method !== undefined) payload.payment_method = data.payment_method;
      
      const response = await updateAccountPayable(id, payload);
      const item = response.data?.account_payable;
      
      if (item) {
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? item : it)),
        }));
        toast({ title: 'Conta a pagar atualizada', description: item.description || 'Registro atualizado.' });
        return item;
      }
      
      toast({ title: 'Aviso', description: 'Conta a pagar atualizada, mas não foi possível atualizar a lista' });
      return null;
    } catch (e) {
      toast({ title: 'Erro ao atualizar conta a pagar', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await deleteAccountPayable(id);
      setState((s) => ({ ...s, items: s.items.filter((it) => it.id !== id) }));
      toast({ title: 'Conta a pagar removida', description: 'Registro excluído com sucesso.' });
      return true;
    } catch (e) {
      toast({ title: 'Erro ao remover conta a pagar', description: 'Tente novamente.', variant: 'destructive' });
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
