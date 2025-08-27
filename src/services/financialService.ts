import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { FinancialDocument, FinancialDocumentPayload } from '@/types'

export async function listFinancialDocuments(params: Record<string, any> = {}): Promise<ApiResponse<{ financialDocuments: FinancialDocument[] }>> {
  const response = await apiService.get<{ financialDocuments: FinancialDocument[] }>('/financial-documents', params);
  return response as ApiResponse<{ financialDocuments: FinancialDocument[] }>;
}

export async function createFinancialDocument(payload: FinancialDocumentPayload): Promise<ApiResponse<{ financialDocument: FinancialDocument }>> {
  const response = await apiService.post<{ financialDocument: FinancialDocument }>('/financial-documents', payload);
  return response as ApiResponse<{ financialDocument: FinancialDocument }>;
}

export async function updateFinancialDocument(id: string, payload: FinancialDocumentPayload): Promise<ApiResponse<{ financialDocument: FinancialDocument }>> {
  const response = await apiService.put<{ financialDocument: FinancialDocument }>(`/financial-documents/${id}`, payload);
  return response as ApiResponse<{ financialDocument: FinancialDocument }>;
}

export async function deleteTransaction(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/financial/transactions/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getFinancialDocumentById(id: string): Promise<ApiResponse<{ financialDocument: FinancialDocument }>> {
  const response = await apiService.get<{ financialDocument: FinancialDocument }>(`/financial-documents/${id}`);
  return response as ApiResponse<{ financialDocument: FinancialDocument }>;
}
