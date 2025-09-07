import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Sale, SalePayload } from '@/types'

export async function listSales(params: Record<string, any> = {}): Promise<ApiResponse<{ sales: Sale[] }>> {
  const response = await apiService.get<{ success: boolean; sales: Sale[] }>('/sales', params)
  return {
    data: {
      sales: response.sales || []
    },
    success: response.success || false
  } as ApiResponse<{ sales: Sale[] }>
}

export async function createSale(payload: SalePayload): Promise<ApiResponse<{ sale: Sale }>> {
  const response = await apiService.post<{ success: boolean; sale: Sale }>('/sales', payload)
  return {
    data: {
      sale: response.sale
    },
    success: response.success || false
  } as ApiResponse<{ sale: Sale }>
}

export async function updateSale(id: string, payload: SalePayload): Promise<ApiResponse<{ sale: Sale }>> {
  const response = await apiService.put<{ success: boolean; sale: Sale }>(`/sales/${id}`, payload)
  return {
    data: {
      sale: response.sale
    },
    success: response.success || false
  } as ApiResponse<{ sale: Sale }>
}

export async function deleteSale(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/sales/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getSaleById(id: string): Promise<ApiResponse<{ sale: Sale }>> {
  const response = await apiService.get<{ success: boolean; sale: Sale }>(`/sales/${id}`)
  return {
    data: {
      sale: response.sale
    },
    success: response.success || false
  } as ApiResponse<{ sale: Sale }>
}
