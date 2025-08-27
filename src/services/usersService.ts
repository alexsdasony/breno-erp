import apiService from './api';
import { ApiResponse } from './api';
import type { User, UserPayload } from '@/types';

// Interface estendida para compatibilidade com dados existentes
export interface UserExtended extends User {
  status?: 'ativo' | 'inativo';
}

/**
 * Obtém a lista de usuários
 * @param params Parâmetros de filtro e paginação
 * @returns Lista de usuários
 */
export async function getUsers(params: Record<string, any> = {}): Promise<ApiResponse<{ users: UserExtended[] }>> {
  const response = await apiService.get<{ users: UserExtended[] }>('/users', params);
  return response as ApiResponse<{ users: UserExtended[] }>;
}

/**
 * Obtém um usuário pelo ID
 * @param id ID do usuário
 * @returns Dados do usuário
 */
export async function getUser(id: string): Promise<ApiResponse<{ user: UserExtended }>> {
  const response = await apiService.get<{ user: UserExtended }>(`/users/${id}`);
  return response as ApiResponse<{ user: UserExtended }>;
}

/**
 * Cria um novo usuário
 * @param userData Dados do usuário
 * @returns Usuário criado
 */
export async function createUser(userData: UserPayload): Promise<ApiResponse<{ user: UserExtended }>> {
  const response = await apiService.post<{ user: UserExtended }>('/users', userData);
  return response as ApiResponse<{ user: UserExtended }>;
}

/**
 * Atualiza um usuário existente
 * @param id ID do usuário
 * @param userData Dados do usuário
 * @returns Usuário atualizado
 */
export async function updateUser(id: string, userData: UserPayload): Promise<ApiResponse<{ user: UserExtended }>> {
  const response = await apiService.put<{ user: UserExtended }>(`/users/${id}`, userData);
  return response as ApiResponse<{ user: UserExtended }>;
}

/**
 * Remove um usuário
 * @param id ID do usuário
 * @returns Resposta da API
 */
export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/users/${id}`);
  return response;
}

/**
 * Reseta a senha de um usuário para a senha padrão
 * @param id ID do usuário
 * @returns Resposta da API
 */
export async function resetPassword(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.put<ApiResponse<void>>(`/users/${id}`, { password: 'senha123' });
  return response;
}