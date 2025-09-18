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
  // Se não há payment_method_id, usar valor padrão baseado no status
  let paymentMethod = row.payment_method_data?.name || row.payment_method;
  
  // Se não há forma de pagamento associada, usar valor padrão
  if (!paymentMethod) {
    // Se o status é 'paid', usar 'boleto' como padrão
    // Se o status é 'pending', usar 'boleto' como padrão
    paymentMethod = 'boleto';
  }
  
  // Se ainda não há forma de pagamento, usar 'boleto' como fallback
  if (!paymentMethod) {
    paymentMethod = 'boleto';
  }
  
  // Se não há fornecedor, usar a descrição como fallback
  const displayName = partnerName || row.description || 'Sem fornecedor';
  
  // Mapear status para valores aceitos pelo frontend
  const statusMap: Record<string, string> = {
    'paid': 'paid',
    'pending': 'pending', 
    'overdue': 'overdue',
    'cancelled': 'cancelled',
    'pendente': 'pending',
    'pago': 'paid',
    'vencido': 'overdue',
    'cancelado': 'cancelled'
  };
  
  // Mapear forma de pagamento para valores aceitos pelo frontend
  const paymentMethodMap: Record<string, string> = {
    'boleto': 'boleto',
    'pix': 'pix',
    'transferencia': 'transferencia',
    'dinheiro': 'dinheiro',
    'cartao': 'cartao',
    'cheque': 'cheque',
    'cartão de crédito': 'cartao',
    'cartão de débito': 'cartao',
    'transferência bancária': 'transferencia',
    'Boleto': 'boleto',
    'PIX': 'pix',
    'Transferência': 'transferencia',
    'Dinheiro': 'dinheiro',
    'Cartão de Crédito': 'cartao',
    'Cartão de Débito': 'cartao',
    'Cheque': 'cheque'
  };
  
  const normalizedStatus = statusMap[row.status] || row.status || 'pending';
  const normalizedPaymentMethod = paymentMethodMap[paymentMethod] || paymentMethod || 'boleto';
  
  // Garantir que sempre temos um valor válido
  const finalPaymentMethod = normalizedPaymentMethod || 'boleto';
  
  console.log('🔍 Normalizando conta a pagar:', {
    id: row.id,
    statusOriginal: row.status,
    statusNormalizado: normalizedStatus,
    formaPagamentoOriginal: paymentMethod,
    formaPagamentoNormalizada: normalizedPaymentMethod,
    formaPagamentoFinal: finalPaymentMethod,
    partnerName: partnerName,
    displayName: displayName
  });
  
  return {
    id: row.id,
    supplier_id: row.partner_id,
    descricao: row.description,
    valor: row.amount || 0,
    data_vencimento: row.due_date,
    data_pagamento: row.payment_date,
    status: normalizedStatus,
    categoria_id: row.category_id,
    segment_id: row.segment_id,
    forma_pagamento: finalPaymentMethod,
    observacoes: row.notes,
    numero_nota_fiscal: row.doc_no,
    created_at: row.created_at,
    updated_at: row.updated_at,
    // Campos adicionais para compatibilidade
    partner_name: partnerName,
    payment_method: paymentMethod,
    // Campo para exibição quando não há fornecedor
    display_name: displayName
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
    
    // Normalizar os dados usando a função de normalização
    const normalizedData = (data.accounts_payable || []).map((row: any) => normalizeAccountsPayable(row));
    
    console.log('🔍 Dados normalizados:', normalizedData);
    
    const result = {
      success: true,
      data: {
        accounts_payable: normalizedData
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
  try {
    const response = await fetch('/api/accounts-payable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    return {
      success: true,
      data: {
        account_payable: result.account_payable
      }
    } as ApiResponse<{ account_payable: AccountsPayable }>;
  } catch (error) {
    console.error('Erro ao criar conta a pagar:', error);
    return {
      success: false,
      data: {
        account_payable: {} as AccountsPayable
      }
    } as ApiResponse<{ account_payable: AccountsPayable }>;
  }
}

export async function updateAccountPayable(id: string, payload: Partial<AccountsPayablePayload>): Promise<ApiResponse<{ account_payable: AccountsPayable }>> {
  try {
    const response = await fetch(`/api/accounts-payable/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    return {
      success: true,
      data: {
        account_payable: result.account_payable
      }
    } as ApiResponse<{ account_payable: AccountsPayable }>;
  } catch (error) {
    console.error('Erro ao atualizar conta a pagar:', error);
    return {
      success: false,
      data: {
        account_payable: {} as AccountsPayable
      }
    } as ApiResponse<{ account_payable: AccountsPayable }>;
  }
}

export async function deleteAccountPayable(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/accounts-payable/${id}`, {
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
    console.error('Erro ao deletar conta a pagar:', error);
    return {
      success: false,
      data: undefined
    } as ApiResponse<void>;
  }
}

export async function getAccountPayableById(id: string): Promise<ApiResponse<{ account_payable: AccountsPayable }>> {
  try {
    const response = await fetch(`/api/accounts-payable/${id}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    return {
      success: true,
      data: {
        account_payable: data.account_payable
      }
    } as ApiResponse<{ account_payable: AccountsPayable }>;
  } catch (error) {
    console.error('Erro ao buscar conta a pagar:', error);
    return {
      success: false,
      data: {
        account_payable: {} as AccountsPayable
      }
    } as ApiResponse<{ account_payable: AccountsPayable }>;
  }
}

export default {
  listAccountsPayable,
  createAccountPayable,
  updateAccountPayable,
  deleteAccountPayable,
  getAccountPayableById
}