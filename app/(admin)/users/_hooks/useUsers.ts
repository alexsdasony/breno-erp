import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { getUsers, createUser, updateUser, deleteUser, resetPassword as resetUserPassword, UserExtended as User } from '@/services/usersService';

// Usando a interface User importada do serviço

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
    setState((s) => {
      const page = reset ? 1 : s.page;
      return { ...s, loading: true, ...(reset ? { page: 1 } : {}) };
    });
    
    try {
      // Usar o estado atual da página
      const currentPage = reset ? 1 : state.page;
      console.log('Carregando usuários, página:', currentPage);
      const response = await getUsers({ page: currentPage, pageSize: PAGE_SIZE });
      console.log('Resposta da API getUsers:', response);
      const users = response.data?.users || [];
      console.log('Usuários carregados:', users);
      
      // Log detalhado de cada usuário
      users.forEach((user, index) => {
        console.log(`Usuário ${index + 1}:`, {
          name: user.name,
          email: user.email,
          status: user.status,
          is_active: user.is_active,
          hasStatus: 'status' in user,
          hasIsActive: 'is_active' in user
        });
      });
      
      // Garantir que o campo status esteja presente
      const usersWithStatus = users.map(user => ({
        ...user,
        status: user.status || (user.is_active ? 'ativo' : 'inativo')
      }));
      
      console.log('Usuários com status processado:', usersWithStatus);
      
      setState((s) => ({
        items: reset ? usersWithStatus : [...s.items, ...usersWithStatus],
        loading: false,
        page: currentPage,
        hasMore: users.length === PAGE_SIZE,
      }));
    } catch (e) {
      console.error('Erro ao carregar usuários:', e);
      setState((s) => ({ ...s, loading: false }));
      toast({
        title: 'Falha ao carregar usuários',
        description: 'Tente novamente em instantes.',
        variant: 'destructive'
      });
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (state.loading || !state.hasMore) return;
    const nextPage = state.page + 1;
    setState((s) => ({ ...s, page: nextPage }));
    try {
      const response = await getUsers({ page: nextPage, pageSize: PAGE_SIZE });
      const users = response.data?.users || [];
      // Garantir que o campo status esteja presente
      const usersWithStatus = users.map(user => ({
        ...user,
        status: user.status || (user.is_active ? 'ativo' : 'inativo')
      }));
      
      setState((s) => ({
        ...s,
        items: [...s.items, ...usersWithStatus],
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
      console.log('Tentando criar usuário:', data);
      
      // Manter o status como está, o backend já espera 'status'
      const payload = {
        ...data,
        status: (data as any).status || 'ativo'
      };
      
      const response = await createUser(payload);
      console.log('Resposta da API:', response);
      const user = response.data?.user;
      if (user) {
        console.log('Usuário criado com sucesso:', user);
        setState((s) => ({ ...s, items: [user, ...s.items] }));
      } else {
        console.warn('Resposta da API não contém usuário:', response);
      }
      toast({
        title: 'Usuário criado',
        description: user?.name || 'Registro criado com sucesso.'
      });
      return user as User;
    } catch (e) {
      console.error('Erro ao criar usuário:', e);
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
      // Preparar payload com todos os campos necessários
      let payload = { ...data };
      
      // Garantir que o status esteja presente
      if ('status' in data) {
        payload.status = (data as any).status;
      } else if ('is_active' in data) {
        payload.status = (data as any).is_active ? 'ativo' : 'inativo';
      }
      
      console.log('Payload para atualização:', payload);
      
      const response = await updateUser(id, payload);
      const user = response.data?.user;
      if (user) {
        console.log('Usuário atualizado recebido:', user);
        setState((s) => ({
          ...s,
          items: s.items.map((item) => (item.id === id ? user : item)),
        }));
        console.log('Estado atualizado com sucesso');
      } else {
        console.warn('Resposta não contém usuário:', response);
      }
      toast({
        title: 'Usuário atualizado',
        description: user?.name || 'Registro atualizado com sucesso.'
      });
      return user as User;
    } catch (e) {
      console.error('Erro ao atualizar usuário:', e);
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
      await deleteUser(id);
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
      await resetUserPassword(id);
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
  }, [load]);

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