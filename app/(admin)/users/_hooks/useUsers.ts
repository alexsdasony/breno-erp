import { useCallback, useEffect, useState } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  segment_id: string | null;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface UseUsersState {
  items: User[];
  loading: boolean;
  page: number;
  hasMore: boolean;
}

export interface UseUsersApi {
  load: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  create: (data: Partial<User>) => Promise<User | null>;
  update: (id: string, data: Partial<User>) => Promise<User | null>;
  remove: (id: string) => Promise<boolean>;
  resetPassword: (id: string) => Promise<boolean>;
}

const PAGE_SIZE = 20;

export function useUsers(): UseUsersState & UseUsersApi {
  const [state, setState] = useState<UseUsersState>({
    items: [],
    loading: false,
    page: 1,
    hasMore: true
  });

  const load = useCallback(async (reset: boolean = false) => {
    setState((s) => ({ ...s, loading: true, ...(reset ? { page: 1 } : {}) }));
    try {
      const page = reset ? 1 : state.page;
      const response = await apiService.getUsers({ page, pageSize: PAGE_SIZE });
      const users = response.data?.users || [];
      setState((s) => ({
        items: reset ? users : [...s.items, ...users],
        loading: false,
        page,
        hasMore: users.length === PAGE_SIZE,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Falha ao carregar usuários',
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
      const response = await apiService.getUsers({ page: nextPage, pageSize: PAGE_SIZE });
      const users = response.data?.users || [];
      setState((s) => ({
        ...s,
        items: [...s.items, ...users],
        hasMore: users.length === PAGE_SIZE,
        loading: false,
      }));
    } catch (e) {
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Erro ao carregar mais usuários',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
    }
  }, [state.loading, state.hasMore, state.page]);

  const create = useCallback(async (data: Partial<User>) => {
    try {
      const response = await apiService.createUser(data);
      const user = response.data?.user || response.data;
      setState((s) => ({ ...s, items: [user, ...s.items] }));
      toast({
        title: 'Usuário criado',
        description: user?.name || 'Registro criado com sucesso.'
      });
      return user as User;
    } catch (e) {
      toast({
        title: 'Erro ao criar usuário',
        description: 'Verifique os dados informados.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const update = useCallback(async (id: string, data: Partial<User>) => {
    try {
      const response = await apiService.updateUser(id, data);
      const user = response.data?.user || response.data;
      setState((s) => ({
        ...s,
        items: s.items.map((item) => (item.id === id ? user : item)),
      }));
      toast({
        title: 'Usuário atualizado',
        description: user?.name || 'Registro atualizado com sucesso.'
      });
      return user as User;
    } catch (e) {
      toast({
        title: 'Erro ao atualizar usuário',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    try {
      await apiService.deleteUser(id);
      setState((s) => ({
        ...s,
        items: s.items.filter((item) => item.id !== id),
      }));
      toast({
        title: 'Usuário removido',
        description: 'Registro removido com sucesso.'
      });
      return true;
    } catch (e) {
      toast({
        title: 'Erro ao remover usuário',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return false;
    }
  }, []);

  const resetPassword = useCallback(async (id: string) => {
    try {
      // Implementar reset de senha para senha padrão
      await apiService.updateUser(id, { password: 'senha123' });
      toast({
        title: 'Senha resetada',
        description: 'A senha foi resetada para "senha123".'
      });
      return true;
    } catch (e) {
      toast({
        title: 'Erro ao resetar senha',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
      return false;
    }
  }, []);

  useEffect(() => {
    load(true);
  }, []);

  return {
    ...state,
    load,
    loadMore,
    create,
    update,
    remove,
    resetPassword
  };
}