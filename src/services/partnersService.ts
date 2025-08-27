import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Partner, PartnerPayload } from '@/types'

export async function listPartners(params: Record<string, any> = {}): Promise<ApiResponse<{ partners: Partner[] }>> {
  const response = await apiService.get<{ success: boolean; partners: Partner[] }>('/partners', params)
  return {
    data: {
      partners: response.partners || []
    },
    success: response.success || false
  } as ApiResponse<{ partners: Partner[] }>
}

export async function createPartner(payload: PartnerPayload): Promise<ApiResponse<{ partner: Partner }>> {
  const response = await apiService.post<{ success: boolean; partners: Partner }>('/partners', payload)
  return {
    data: {
      partner: response.partners
    },
    success: response.success || false
  } as ApiResponse<{ partner: Partner }>
}

export async function updatePartner(id: string, payload: PartnerPayload): Promise<ApiResponse<{ partner: Partner }>> {
  const response = await apiService.put<{ success: boolean; partners: Partner }>(`/partners/${id}`, payload)
  return {
    data: {
      partner: response.partners
    },
    success: response.success || false
  } as ApiResponse<{ partner: Partner }>
}

export async function deletePartner(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/partners/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getPartnerById(id: string): Promise<ApiResponse<{ partner: Partner }>> {
  const response = await apiService.get<{ success: boolean; partners: Partner }>(`/partners/${id}`)
  return {
    data: {
      partner: response.partners
    },
    success: response.success || false
  } as ApiResponse<{ partner: Partner }>
}
