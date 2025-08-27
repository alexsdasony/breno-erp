import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Transaction, TransactionPayload } from '@/types'

export async function listTransactions(params: Record<string, any> = {}): Promise<ApiResponse<{ transactions: Transaction[] }>> {
  const response = await apiService.get<{ transactions: Transaction[] }>('/transactions', params);
  return response as ApiResponse<{ transactions: Transaction[] }>;
}

export async function createTransaction(payload: TransactionPayload): Promise<ApiResponse<{ transaction: Transaction }>> {
  const response = await apiService.post<{ transaction: Transaction }>('/transactions', payload);
  return response as ApiResponse<{ transaction: Transaction }>;
}

export async function updateTransaction(id: string, payload: TransactionPayload): Promise<ApiResponse<{ transaction: Transaction }>> {
  const response = await apiService.put<{ transaction: Transaction }>(`/transactions/${id}`, payload);
  return response as ApiResponse<{ transaction: Transaction }>;
}

export async function deleteTransaction(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/transactions/${id}`);
  return response;
}

export async function getTransactionById(id: string): Promise<ApiResponse<{ transaction: Transaction }>> {
  const response = await apiService.get<{ transaction: Transaction }>(`/transactions/${id}`);
  return response as ApiResponse<{ transaction: Transaction }>;
}

export default {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionById
}