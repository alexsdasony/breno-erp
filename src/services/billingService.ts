import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Billing, BillingPayload } from '@/types'

export async function listBillings(params: Record<string, any> = {}): Promise<ApiResponse<{ billings: Billing[] }>> {
  const response = await apiService.get<{ billings: Billing[] }>('/billings', params)
  return response as ApiResponse<{ billings: Billing[] }>
}

export async function createBilling(payload: BillingPayload): Promise<ApiResponse<{ billing: Billing }>> {
  const response = await apiService.post<{ billing: Billing }>('/billings', payload)
  return response as ApiResponse<{ billing: Billing }>
}

export async function updateBilling(id: string, payload: BillingPayload): Promise<ApiResponse<{ billing: Billing }>> {
  const response = await apiService.put<{ billing: Billing }>(`/billings/${id}`, payload)
  return response as ApiResponse<{ billing: Billing }>
}

export async function deleteBilling(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/billings/${id}`)
  return response
}

export async function getBillingById(id: string): Promise<ApiResponse<{ billing: Billing }>> {
  const response = await apiService.get<{ billing: Billing }>(`/billings/${id}`)
  return response as ApiResponse<{ billing: Billing }>
}

export default {
  listBillings,
  createBilling,
  updateBilling,
  deleteBilling,
  getBillingById
}
