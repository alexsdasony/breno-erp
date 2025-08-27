import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Partner, PartnerPayload } from '@/types'

export async function listPartners(params: Record<string, any> = {}): Promise<ApiResponse<{ partners: Partner[] }>> {
  const response = await apiService.get<{ partners: Partner[] }>('/partners', params)
  return response as ApiResponse<{ partners: Partner[] }>
}

export async function createPartner(payload: PartnerPayload): Promise<ApiResponse<{ partner: Partner }>> {
  const response = await apiService.post<{ partner: Partner }>('/partners', payload)
  return response as ApiResponse<{ partner: Partner }>
}

export async function updatePartner(id: string, payload: PartnerPayload): Promise<ApiResponse<{ partner: Partner }>> {
  const response = await apiService.put<{ partner: Partner }>(`/partners/${id}`, payload)
  return response as ApiResponse<{ partner: Partner }>
}

export async function deletePartner(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/partners/${id}`)
  return response
}

export async function getPartnerById(id: string): Promise<ApiResponse<{ partner: Partner }>> {
  const response = await apiService.get<{ partner: Partner }>(`/partners/${id}`)
  return response as ApiResponse<{ partner: Partner }>
}
