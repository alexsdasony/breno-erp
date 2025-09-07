import apiService from '@/services/api';
import type { ApiResponse } from '@/services/api';

export interface AccountReceivable {
  id: string;
  customer_id?: string;
  numero_nota_fiscal?: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'paga' | 'vencida' | 'pending' | 'paid' | 'overdue';
  categoria_id?: string;
  forma_pagamento?: string;
  observacoes?: string;
  responsavel_pagamento?: string;
  numero_parcela?: number;
  total_parcelas?: number;
  segment_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AccountReceivablePayload {
  customer_id?: string;
  numero_nota_fiscal?: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'paga' | 'vencida' | 'pending' | 'paid' | 'overdue';
  categoria_id?: string;
  forma_pagamento?: string;
  observacoes?: string;
  responsavel_pagamento?: string;
  numero_parcela?: number;
  total_parcelas?: number;
  segment_id?: string;
}

export async function listAccountsReceivable(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<{ accounts_receivable: AccountReceivable[] }>> {
  const queryParams = params ? `?page=${params.page || 1}&limit=${params.pageSize || 100}` : '';
  const response = await apiService.get<{ success: boolean; accounts_receivable: AccountReceivable[] }>(`/accounts-receivable${queryParams}`);

  return {
    data: {
      accounts_receivable: response.accounts_receivable || []
    },
    success: response.success || false
  } as ApiResponse<{ accounts_receivable: AccountReceivable[] }>;
}

export async function getAccountReceivable(id: string): Promise<ApiResponse<{ account_receivable: AccountReceivable }>> {
  const response = await apiService.get<{ success: boolean; account_receivable: AccountReceivable }>(`/accounts-receivable/${id}`);

  return {
    data: {
      account_receivable: response.account_receivable
    },
    success: response.success || false
  } as ApiResponse<{ account_receivable: AccountReceivable }>;
}

export async function createAccountReceivable(data: AccountReceivablePayload): Promise<ApiResponse<{ account_receivable: AccountReceivable }>> {
  const response = await apiService.post<{ success: boolean; account_receivable: AccountReceivable }>('/accounts-receivable', data);

  return {
    data: {
      account_receivable: response.account_receivable
    },
    success: response.success || false
  } as ApiResponse<{ account_receivable: AccountReceivable }>;
}

export async function updateAccountReceivable(id: string, data: Partial<AccountReceivablePayload>): Promise<ApiResponse<{ account_receivable: AccountReceivable }>> {
  const response = await apiService.put<{ success: boolean; account_receivable: AccountReceivable }>(`/accounts-receivable/${id}`, data);

  return {
    data: {
      account_receivable: response.account_receivable
    },
    success: response.success || false
  } as ApiResponse<{ account_receivable: AccountReceivable }>;
}

export async function deleteAccountReceivable(id: string): Promise<ApiResponse<{ success: boolean }>> {
  const response = await apiService.delete<{ success: boolean }>(`/accounts-receivable/${id}`);

  return {
    data: {
      success: response.success || false
    },
    success: response.success || false
  } as ApiResponse<{ success: boolean }>;
}

export default {
  listAccountsReceivable,
  getAccountReceivable,
  createAccountReceivable,
  updateAccountReceivable,
  deleteAccountReceivable
};
