import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Sale, SalePayload } from '@/types'

export async function listSales(params: Record<string, any> = {}): Promise<ApiResponse<{ sales: Sale[] }>> {
  const response = await apiService.get<{ sales: Sale[] }>('/sales', params)
  return response as ApiResponse<{ sales: Sale[] }>
}

export async function createSale(payload: SalePayload): Promise<ApiResponse<{ sale: Sale }>> {
  const response = await apiService.post<{ sale: Sale }>('/sales', payload)
  return response as ApiResponse<{ sale: Sale }>
}

export async function updateSale(id: string, payload: SalePayload): Promise<ApiResponse<{ sale: Sale }>> {
  const response = await apiService.put<{ sale: Sale }>(`/sales/${id}`, payload)
  return response as ApiResponse<{ sale: Sale }>
}

export async function deleteSale(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/sales/${id}`)
  return response
}

export async function getSaleById(id: string): Promise<ApiResponse<{ sale: Sale }>> {
  const response = await apiService.get<{ sale: Sale }>(`/sales/${id}`)
  return response as ApiResponse<{ sale: Sale }>
}
