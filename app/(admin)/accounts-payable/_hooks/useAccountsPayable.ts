import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { listAccountsPayable, createAccountPayable, updateAccountPayable, deleteAccountPayable, normalizeAccountsPayable } from '@/services/accountsPayableService';
import { useAppData } from '@/hooks/useAppData';
import { AccountsPayable, AccountsPayablePayload } from '@/types';
import { getDateRangeFromPeriod } from '@/lib/periodUtils';

export type AccountPayableItem = AccountsPayable;

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
  load: (reset?: boolean) => Promise<void>;
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

export function useAccountsPayable(dateStart?: string, dateEnd?: string) {
  const [state, setState] = useState<State>({ items: [], loading: false, page: 1, hasMore: true });
  const { activeSegmentId } = useAppData();

  const fetchPage = useCallback(
    async (page: number) => {
      const range = dateStart && dateEnd ? { dateStart, dateEnd } : getDateRangeFromPeriod('current_month');
      const params: Record<string, string> = {
        page: String(page),
        pageSize: String(PAGE_SIZE),
        dateStart: range.dateStart,
        dateEnd: range.dateEnd,
      };
      if (activeSegmentId && activeSegmentId !== '0') params.segment_id = activeSegmentId;
      try {
        const response = await listAccountsPayable(params);
        const list = response.data?.accounts_payable || [];
        if (list.length === 0) {
          try {
            const queryString = new URLSearchParams(params).toString();
            const directResponse = await fetch(`/api/accounts-payable?${queryString}`);
            const directData = await directResponse.json();
            if (directData.accounts_payable?.length > 0) {
              return directData.accounts_payable;
            }
          } catch {
            // ignore
          }
        }
        return list;
      } catch (error) {
        console.error('Erro ao buscar contas a pagar:', error);
        return [];
      }
    },
    [activeSegmentId, dateStart, dateEnd]
  );

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
      if (!data.descricao) {
        toast({ title: 'Erro ao criar conta a pagar', description: 'A descrição é obrigatória.', variant: 'destructive' });
        return null;
      }
      
      if (!data.valor && data.valor !== 0) {
        toast({ title: 'Erro ao criar conta a pagar', description: 'O valor é obrigatório.', variant: 'destructive' });
        return null;
      }
      
      // Criar payload com campos obrigatórios
      const payload: AccountsPayablePayload = {
        descricao: data.descricao || '',
        valor: typeof data.valor === 'string' ? parseFloat(data.valor) : data.valor || 0,
        data_vencimento: data.data_vencimento || new Date().toISOString().split('T')[0],
        supplier_id: data.supplier_id,
        categoria_id: data.categoria_id,
        status: data.status,
        segment_id: data.segment_id,
        observacoes: data.observacoes,
        data_pagamento: data.data_pagamento,
        forma_pagamento: data.forma_pagamento
      };
      
      const response = await createAccountPayable(payload);
      const item = response.data?.account_payable;
      
      if (item) {
        setState((s) => ({ ...s, items: [item, ...s.items] }));
        toast({ title: 'Conta a pagar criada', description: item.descricao || 'Registro criado.' });
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
    console.log('🔧 useAccountsPayable.update chamado com:', { id, data });
    
    try {
      // Validar campos obrigatórios se estiverem presentes no payload
      if (data.descricao === '') {
        console.error('❌ Descrição vazia');
        toast({ title: 'Erro ao atualizar conta a pagar', description: 'A descrição não pode ser vazia.', variant: 'destructive' });
        return null;
      }
      
      // Criar payload com os campos fornecidos
      const payload: Partial<AccountsPayablePayload> = {};
      
      if (data.descricao !== undefined) payload.descricao = data.descricao;
      if (data.valor !== undefined) payload.valor = typeof data.valor === 'string' ? parseFloat(data.valor) : data.valor;
      if (data.data_vencimento !== undefined) payload.data_vencimento = data.data_vencimento;
      if (data.supplier_id !== undefined) payload.supplier_id = data.supplier_id;
      if (data.categoria_id !== undefined) payload.categoria_id = data.categoria_id;
      if (data.status !== undefined) payload.status = data.status;
      if (data.segment_id !== undefined) payload.segment_id = data.segment_id;
      if (data.observacoes !== undefined) payload.observacoes = data.observacoes;
      if (data.data_pagamento !== undefined) payload.data_pagamento = data.data_pagamento;
      if (data.forma_pagamento !== undefined) payload.forma_pagamento = data.forma_pagamento;
      
      console.log('📦 Payload criado:', payload);
      console.log('🌐 Chamando API updateAccountPayable...');
      
      const response = await updateAccountPayable(id, payload);
      console.log('📥 Resposta da API:', response);
      
      const item = response.data?.account_payable;
      
      if (item) {
        console.log('✅ Item atualizado recebido:', item);
        setState((s) => ({
          ...s,
          items: s.items.map((it) => (it.id === id ? item : it)),
        }));
        toast({ title: 'Conta a pagar atualizada', description: item.descricao || 'Registro atualizado.' });
        return item;
      }
      
      console.warn('⚠️ Item não encontrado na resposta');
      toast({ title: 'Aviso', description: 'Conta a pagar atualizada, mas não foi possível atualizar a lista' });
      return null;
    } catch (e) {
      console.error('❌ Erro no useAccountsPayable.update:', e);
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
  }, [dateStart, dateEnd]);

  const api: Api = useMemo(() => ({ load, loadMore, create, update, remove }), [load, loadMore, create, update, remove]);

  return { ...state, ...api };
}
