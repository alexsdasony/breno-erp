import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { AccountsPayable, AccountsPayablePayload } from '@/types'

/**
 * Normaliza um documento de conta a pagar do formato do backend para o formato esperado pelo frontend
 */
export function normalizeAccountsPayable(row: any): AccountsPayable {
  // Garantir que partner_name seja extraído corretamente
  const partnerName = row.partner?.name || row.partner_name || null;
  
  // Garantir que payment_method seja extraído corretamente
  const paymentMethod = row.payment_method_data?.name || row.payment_method || null;
  
  return {
    id: row.id,
    supplier_id: row.partner_id,
    descricao: row.description,
    valor: row.amount || 0,
    data_vencimento: row.due_date,
    data_pagamento: row.payment_date,
    status: row.status,
    categoria_id: row.category_id,
    segment_id: row.segment_id,
    forma_pagamento: paymentMethod,
    observacoes: row.notes,
    numero_nota_fiscal: row.doc_no,
    created_at: row.created_at,
    updated_at: row.updated_at,
    // Campos adicionais para compatibilidade
    partner_name: partnerName,
    payment_method: paymentMethod
  };
}

export async function listAccountsPayable(params: Record<string, any> = {}): Promise<ApiResponse<{ accounts_payable: AccountsPayable[] }>> {
  try {
    // Usar fetch direto em vez do apiService.get
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/api/accounts-payable?${queryString}` : '/api/accounts-payable';
    
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
        accounts_payable: data.accounts_payable || []
      }
    } as ApiResponse<{ accounts_payable: AccountsPayable[] }>;
    
    return result;
  } catch (error) {
    console.error('Erro ao buscar contas a pagar:', error);
    return {
      success: false,
      data: {
        accounts_payable: []
      }
    } as ApiResponse<{ accounts_payable: AccountsPayable[] }>;
  }
}

export async function createAccountPayable(payload: AccountsPayablePayload): Promise<ApiResponse<{ account_payable: AccountsPayable }>> {
  const response = await apiService.post<{ success: boolean; account_payable: AccountsPayable }>('/accounts-payable', payload)
  return {
    success: response.success,
    data: { account_payable: response.account_payable }
  }
}

export async function updateAccountPayable(id: string, payload: Partial<AccountsPayablePayload>): Promise<ApiResponse<{ account_payable: AccountsPayable }>> {
  console.log('🌐 accountsPayableService.updateAccountPayable chamado com:', { id, payload });
  
  const response = await apiService.put<{ success: boolean; account_payable: AccountsPayable }>(`/accounts-payable/${id}`, payload)
  
  console.log('📥 Resposta bruta da API:', response);
  
  const result = {
    success: response.success,
    data: { account_payable: response.account_payable }
  };
  
  console.log('📦 Resultado processado:', result);
  
  return result;
}

export async function deleteAccountPayable(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/accounts-payable/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getAccountPayableById(id: string): Promise<ApiResponse<{ account_payable: AccountsPayable }>> {
  const response = await apiService.get<{ success: boolean; account_payable: AccountsPayable }>(`/accounts-payable/${id}`)
  return {
    success: response.success,
    data: { account_payable: response.account_payable }
  }
}

export default {
  listAccountsPayable,
  createAccountPayable,
  updateAccountPayable,
  deleteAccountPayable,
  getAccountPayableById
}