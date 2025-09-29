import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Billing, BillingPayload } from '@/types'

export async function listBillings(params: Record<string, any> = {}): Promise<ApiResponse<{ billings: Billing[] }>> {
  const response = await apiService.get<{ success: boolean; billings: Billing[] }>('/billings', params)
  return {
    success: response.success,
    data: { billings: response.billings || [] }
  }
}

export async function createBilling(payload: BillingPayload): Promise<ApiResponse<{ billing: Billing }>> {
  const response = await apiService.post<{ success: boolean; billing: Billing }>('/billings', payload)
  return {
    success: response.success,
    data: { billing: response.billing }
  }
}

export async function updateBilling(id: string, payload: BillingPayload): Promise<ApiResponse<{ billing: Billing }>> {
  try {
    const response = await apiService.put<{ success: boolean; billing: Billing }>(`/billings/${id}`, payload)
    return {
      success: response.success,
      data: { billing: response.billing }
    }
  } catch (error) {
    console.error('Erro ao atualizar cobrança:', error);
    return {
      success: false,
      error: 'Erro ao atualizar cobrança'
    }
  }
}

export async function deleteBilling(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await apiService.delete<{ success: boolean; message?: string }>(`/billings/${id}`);
    return {
      success: response.success,
      data: undefined
    };
  } catch (error) {
    console.error('Erro ao excluir cobrança:', error);
    return {
      success: false,
      error: 'Erro ao excluir cobrança'
    }
  }
}

export async function getBillingById(id: string): Promise<ApiResponse<{ billing: Billing }>> {
  const response = await apiService.get<{ success: boolean; billing: Billing }>(`/billings/${id}`)
  return {
    success: response.success,
    data: { billing: response.billing }
  }
}

export default {
  listBillings,
  createBilling,
  updateBilling,
  deleteBilling,
  getBillingById
}
