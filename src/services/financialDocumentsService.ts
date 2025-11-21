import apiService from '@/services/api';
import type { ApiResponse } from '@/services/api';
import { ID } from '@/types/common';
import type { FinancialDocument, FinancialDocumentPayload } from '@/types/FinancialDocument';

/**
 * Normaliza um documento financeiro do formato do backend para o formato esperado pelo frontend
 */
export function normalizeFinancialDocument(row: any): FinancialDocument & { _source?: string; pluggy_id?: string } {
  // Garantir que partner_name seja extraído corretamente
  const partnerName = row.partner?.name || row.partner_name || null;
  
  // Garantir que payment_method seja extraído corretamente
  const paymentMethod = row.payment_method_data?.name || row.payment_method || null;
  
  // Determinar origem: Pluggy ou Manual
  // Critério 1: Se tem _source='pluggy' ou pluggy_id, é Pluggy
  // Critério 2: Se a data é >= 31/10/2025 e não tem _source='manual', é Pluggy
  // Critério 3: Se a data é <= 29/10/2025, é Manual
  const issueDate = row.issue_date || row.date;
  const isPluggyByDate = issueDate && issueDate >= '2025-10-31';
  const isPluggyBySource = row._source === 'pluggy' || row.pluggy_id;
  const isManualByDate = issueDate && issueDate <= '2025-10-29';
  
  const source = isPluggyBySource || (isPluggyByDate && row._source !== 'manual') 
    ? 'pluggy' 
    : isManualByDate || row._source === 'manual' 
      ? 'manual' 
      : row._source || (isPluggyByDate ? 'pluggy' : 'manual');
  
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
    payment_method: paymentMethod,
    payment_method_id: row.payment_method_id,
    notes: row.notes,
    deleted_at: row.deleted_at,
    is_deleted: row.is_deleted,
    partner: row.partner,
    // Campos mapeados para compatibilidade
    type: row.direction,
    date: row.issue_date,
    partner_name: partnerName,
    created_at: row.created_at,
    updated_at: row.updated_at,
    // Preservar campos extras para identificação Pluggy
    _source: source,
    pluggy_id: row.pluggy_id,
  } as FinancialDocument & { _source?: string; pluggy_id?: string };
}

/**
 * Obtém a lista de documentos financeiros com paginação
 */
export async function getFinancialDocuments(params: Record<string, any> = {}): Promise<ApiResponse<{ financialDocuments: FinancialDocument[] }>> {
  try {
    // Usar fetch direto em vez do apiService.get
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/financial-documents?${queryString}` : '/api/financial-documents';
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // A resposta já vem com a estrutura correta da API
    const result = {
      success: true,
      data: {
        financialDocuments: data.financialDocuments || []
      }
    } as ApiResponse<{ financialDocuments: FinancialDocument[] }>;
    
    return result;
  } catch (error) {
    console.error('Erro ao buscar documentos financeiros:', error);
    return {
      success: false,
      data: {
        financialDocuments: []
      }
    } as ApiResponse<{ financialDocuments: FinancialDocument[] }>;
  }
}

/**
 * Obtém um documento financeiro pelo ID
 */
export async function getFinancialDocumentById(id: ID): Promise<ApiResponse<{ financialDocument: FinancialDocument }>> {
  try {
    const response = await fetch(`/api/financial-documents/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    return {
      success: true,
      data: {
        financialDocument: data.financialDocument
      }
    } as ApiResponse<{ financialDocument: FinancialDocument }>;
  } catch (error) {
    console.error('Erro ao buscar documento financeiro:', error);
    return {
      success: false,
      data: {
        financialDocument: {} as FinancialDocument
      }
    } as ApiResponse<{ financialDocument: FinancialDocument }>;
  }
}

/**
 * Cria um novo documento financeiro
 */
export async function createFinancialDocument(data: FinancialDocumentPayload): Promise<ApiResponse<{ financialDocument: FinancialDocument }>> {
  try {
    const response = await fetch('/api/financial-documents', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    return {
      success: true,
      data: {
        financialDocument: result.document
      }
    } as ApiResponse<{ financialDocument: FinancialDocument }>;
  } catch (error) {
    console.error('Erro ao criar documento financeiro:', error);
    return {
      success: false,
      data: {
        financialDocument: {} as FinancialDocument
      }
    } as ApiResponse<{ financialDocument: FinancialDocument }>;
  }
}

/**
 * Atualiza um documento financeiro existente
 */
export async function updateFinancialDocument(id: ID, data: Partial<FinancialDocumentPayload>): Promise<ApiResponse<{ financialDocument: FinancialDocument }>> {
  try {
    const response = await fetch(`/api/financial-documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    return {
      success: true,
      data: {
        financialDocument: result.document
      }
    } as ApiResponse<{ financialDocument: FinancialDocument }>;
  } catch (error) {
    console.error('Erro ao atualizar documento financeiro:', error);
    return {
      success: false,
      data: {
        financialDocument: {} as FinancialDocument
      }
    } as ApiResponse<{ financialDocument: FinancialDocument }>;
  }
}

/**
 * Remove um documento financeiro
 */
export async function deleteFinancialDocument(id: ID): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/financial-documents/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const result = await response.json();
    
    return {
      success: result.success,
      data: undefined
    } as ApiResponse<void>;
  } catch (error) {
    console.error('Erro ao deletar documento financeiro:', error);
    return {
      success: false,
      data: undefined
    } as ApiResponse<void>;
  }
}

export default {
  getFinancialDocuments,
  getFinancialDocumentById,
  createFinancialDocument,
  updateFinancialDocument,
  deleteFinancialDocument,
  normalizeFinancialDocument
}