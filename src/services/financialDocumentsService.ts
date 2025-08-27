import apiService from '@/services/api';
import type { ApiResponse } from '@/services/api';
import { ID } from '@/types/common';
import type { FinancialDocument, FinancialDocumentPayload } from '@/types/FinancialDocument';

/**
 * Normaliza um documento financeiro do formato do backend para o formato esperado pelo frontend
 */
export function normalizeFinancialDocument(row: any): FinancialDocument {
  return {
    id: row.id,
    partner_id: row.partner_id,
    direction: row.direction,
    doc_no: row.doc_no,
    issue_date: row.issue_date,
    due_date: row.due_date,
    amount: row.amount || 0,
    balance: row.balance || row.amount || 0,
    status: row.status,
    category_id: row.category_id,
    segment_id: row.segment_id,
    description: row.description,
    payment_method: row.payment_method,
    payment_method_id: row.payment_method_id,
    notes: row.notes,
    deleted_at: row.deleted_at,
    is_deleted: row.is_deleted,
    partner: row.partner,
    // Campos mapeados para compatibilidade
    type: row.direction,
    date: row.issue_date,
    partner_name: row.partner?.name || row.partner_name,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/**
 * Obtém a lista de documentos financeiros com paginação
 */
export async function getFinancialDocuments(params: Record<string, any> = {}): Promise<ApiResponse<{ financialDocuments: FinancialDocument[] }>> {
  const response = await apiService.get<{ financialDocuments: FinancialDocument[] }>('/financial-documents', params);
  return {
    success: true,
    data: response
  } as ApiResponse<{ financialDocuments: FinancialDocument[] }>;
}

/**
 * Obtém um documento financeiro pelo ID
 */
export async function getFinancialDocumentById(id: ID): Promise<ApiResponse<{ financialDocument: FinancialDocument }>> {
  const response = await apiService.get<{ financialDocument: FinancialDocument }>(`/financial-documents/${id}`);
  return response as ApiResponse<{ financialDocument: FinancialDocument }>;
}

/**
 * Cria um novo documento financeiro
 */
export async function createFinancialDocument(data: FinancialDocumentPayload): Promise<ApiResponse<{ financialDocument: FinancialDocument }>> {
  const response = await apiService.post<{ financialDocument: FinancialDocument }>('/financial-documents', data);
  return response as ApiResponse<{ financialDocument: FinancialDocument }>;
}

/**
 * Atualiza um documento financeiro existente
 */
export async function updateFinancialDocument(id: ID, data: Partial<FinancialDocumentPayload>): Promise<ApiResponse<{ financialDocument: FinancialDocument }>> {
  const response = await apiService.put<{ financialDocument: FinancialDocument }>(`/financial-documents/${id}`, data);
  return response as ApiResponse<{ financialDocument: FinancialDocument }>;
}

/**
 * Remove um documento financeiro
 */
export async function deleteFinancialDocument(id: ID): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/financial-documents/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export default {
  getFinancialDocuments,
  getFinancialDocumentById,
  createFinancialDocument,
  updateFinancialDocument,
  deleteFinancialDocument,
  normalizeFinancialDocument
}