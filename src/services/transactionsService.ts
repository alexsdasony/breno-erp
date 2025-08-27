import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Transaction, TransactionPayload } from '@/types'

export async function listTransactions(params: Record<string, any> = {}): Promise<ApiResponse<{ transactions: Transaction[] }>> {
  const response = await apiService.get<{ success: boolean; transactions: Transaction[] }>('/transactions', params);
  return {
    data: {
      transactions: response.transactions || []
    },
    success: response.success || false
  } as ApiResponse<{ transactions: Transaction[] }>;
}

export async function createTransaction(payload: TransactionPayload): Promise<ApiResponse<{ transaction: Transaction }>> {
  const response = await apiService.post<{ success: boolean; transactions: Transaction }>('/transactions', payload);
  return {
    data: {
      transaction: response.transactions
    },
    success: response.success || false
  } as ApiResponse<{ transaction: Transaction }>;
}

export async function updateTransaction(id: string, payload: TransactionPayload): Promise<ApiResponse<{ transaction: Transaction }>> {
  const response = await apiService.put<{ success: boolean; transactions: Transaction }>(`/transactions/${id}`, payload);
  return {
    data: {
      transaction: response.transactions
    },
    success: response.success || false
  } as ApiResponse<{ transaction: Transaction }>;
}

export async function deleteTransaction(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/transactions/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getTransactionById(id: string): Promise<ApiResponse<{ transaction: Transaction }>> {
  const response = await apiService.get<{ success: boolean; transactions: Transaction }>(`/transactions/${id}`);
  return {
    data: {
      transaction: response.transactions
    },
    success: response.success || false
  } as ApiResponse<{ transaction: Transaction }>;
}

export default {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionById
}