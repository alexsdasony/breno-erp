import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'

// TODO: Criar tipos Integration em src/types quando necessário
export interface Integration {
  id: string;
  name: string;
  type?: string | null;
  status?: string | null;
  config?: Record<string, any> | null;
  segment_id?: string | null;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface IntegrationPayload {
  name: string;
  type?: string | null;
  status?: string | null;
  config?: Record<string, any> | null;
  segment_id?: string | null;
  [key: string]: any;
}

export async function listIntegrations(params: Record<string, any> = {}): Promise<ApiResponse<{ integrations: Integration[] }>> {
  const response = await apiService.get<{ integrations: Integration[] }>('/integrations', params)
  return response as ApiResponse<{ integrations: Integration[] }>
}

export async function createIntegration(payload: IntegrationPayload): Promise<ApiResponse<{ integration: Integration }>> {
  const response = await apiService.post<{ integration: Integration }>('/integrations', payload)
  return response as ApiResponse<{ integration: Integration }>
}

export async function updateIntegration(id: string, payload: IntegrationPayload): Promise<ApiResponse<{ integration: Integration }>> {
  const response = await apiService.put<{ integration: Integration }>(`/integrations/${id}`, payload)
  return response as ApiResponse<{ integration: Integration }>
}

export async function deleteIntegration(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/integrations/${id}`)
  return response
}

export async function getIntegrationById(id: string): Promise<ApiResponse<{ integration: Integration }>> {
  const response = await apiService.get<{ integration: Integration }>(`/integrations/${id}`)
  return response as ApiResponse<{ integration: Integration }>
}