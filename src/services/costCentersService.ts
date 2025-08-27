import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { CostCenter, CostCenterPayload } from '@/types'

export async function listCostCenters(params: Record<string, any> = {}): Promise<ApiResponse<{ costCenters: CostCenter[] }>> {
  const response = await apiService.get<{ success: boolean; costCenters: CostCenter[] }>('/cost-centers', params);
  return {
    success: response.success,
    data: { costCenters: response.costCenters || [] }
  };
}

export async function createCostCenter(payload: CostCenterPayload): Promise<ApiResponse<{ costCenter: CostCenter }>> {
  const response = await apiService.post<{ success: boolean; costCenter: CostCenter }>('/cost-centers', payload);
  return {
    success: response.success,
    data: { costCenter: response.costCenter }
  };
}

export async function updateCostCenter(id: string, payload: CostCenterPayload): Promise<ApiResponse<{ costCenter: CostCenter }>> {
  const response = await apiService.put<{ success: boolean; costCenter: CostCenter }>(`/cost-centers/${id}`, payload);
  return {
    success: response.success,
    data: { costCenter: response.costCenter }
  };
}

export async function deleteCostCenter(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/cost-centers/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getCostCenterById(id: string): Promise<ApiResponse<{ costCenter: CostCenter }>> {
  const response = await apiService.get<{ success: boolean; costCenter: CostCenter }>(`/cost-centers/${id}`);
  return {
    success: response.success,
    data: { costCenter: response.costCenter }
  };
}

export default {
  listCostCenters,
  createCostCenter,
  updateCostCenter,
  deleteCostCenter,
  getCostCenterById
}
