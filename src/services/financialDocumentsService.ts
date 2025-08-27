import apiService from '@/services/api';
import type { ApiResponse } from '@/services/api';
import { ID } from '@/types/common';

export interface FinancialDocument {
  id: string;
  type?: string | null; // invoice, receipt, payment, etc.
  description?: string | null;
  amount?: number | null;
  date?: string | null;
  due_date?: string | null;
  status?: string | null; // pending, paid, canceled
  partner_id?: string | null;
  partner_name?: string | null;
  segment_id?: string | null;
  payment_method_id?: string | null;
}

export interface FinancialDocumentPayload {
  type?: string | null;
  description?: string | null;
  amount?: number | null;
  date?: string | null;
  due_date?: string | null;
  status?: string | null;
  partner_id?: string | null;
  segment_id?: string | null;
  payment_method_id?: string | null;
}

/**
 * Normaliza um documento financeiro do formato do backend para o formato esperado pelo frontend
 */
export function normalizeFinancialDocument(row: any): FinancialDocument {
  const direction: string | undefined = row?.direction;
  const mappedType =
    row?.type ?? (direction === 'payable' ? 'expense' : direction === 'receivable' ? 'income' : null);
  const partnerName =
    (row.partner && typeof row.partner === 'object' ? row.partner.name : undefined)
    ?? row.partner_name
    ?? (typeof row.partner === 'string' ? row.partner : undefined)
    ?? null;
  return {
    id: row.id,
    type: mappedType,
    description: row.description ?? null,
    amount: row.amount != null ? Number(row.amount) : null,
    date: row.date ?? row.issue_date ?? null,
    due_date: row.due_date ?? null,
    status: row.status === 'open' ? 'pending' : row.status ?? null,
    partner_id: row.partner_id ?? null,
    partner_name: partnerName,
    segment_id: row.segment_id ?? null,
    payment_method_id: row.payment_method_id ?? null,
  };
}

/**
 * Obtém a lista de documentos financeiros com paginação
 */
export async function getFinancialDocuments(params: Record<string, any> = {}): Promise<ApiResponse<{ financialDocuments: FinancialDocument[] }>> {
  const response = await apiService.get<{ financialDocuments: FinancialDocument[] }>('/financial-documents', params);
  return response as ApiResponse<{ financialDocuments: FinancialDocument[] }>;
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
  const response = await apiService.delete<ApiResponse<void>>(`/financial-documents/${id}`);
  return response;
}

export default {
  getFinancialDocuments,
  getFinancialDocumentById,
  createFinancialDocument,
  updateFinancialDocument,
  deleteFinancialDocument,
  normalizeFinancialDocument
}