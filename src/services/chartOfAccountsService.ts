import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { ChartOfAccount, ChartOfAccountPayload } from '@/types'

export async function listChartOfAccounts(params: Record<string, any> = {}): Promise<ApiResponse<{ chartOfAccounts: ChartOfAccount[] }>> {
  const response = await apiService.get<{ success: boolean; chartOfAccounts: ChartOfAccount[] }>('/chart-of-accounts', params);
  return {
    success: response.success,
    data: { chartOfAccounts: response.chartOfAccounts || [] }
  };
}

export async function createChartOfAccount(payload: ChartOfAccountPayload): Promise<ApiResponse<{ chartOfAccount: ChartOfAccount }>> {
  const response = await apiService.post<{ success: boolean; chartOfAccount: ChartOfAccount }>('/chart-of-accounts', payload);
  return {
    success: response.success,
    data: { chartOfAccount: response.chartOfAccount }
  };
}

export async function updateChartOfAccount(id: string, payload: ChartOfAccountPayload): Promise<ApiResponse<{ chartOfAccount: ChartOfAccount }>> {
  const response = await apiService.put<{ success: boolean; chartOfAccount: ChartOfAccount }>(`/chart-of-accounts/${id}`, payload);
  return {
    success: response.success,
    data: { chartOfAccount: response.chartOfAccount }
  };
}

export async function deleteChartOfAccount(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/chart-of-accounts/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getChartOfAccountById(id: string): Promise<ApiResponse<{ chartOfAccount: ChartOfAccount }>> {
  const response = await apiService.get<{ success: boolean; chartOfAccount: ChartOfAccount }>(`/chart-of-accounts/${id}`);
  return {
    success: response.success,
    data: { chartOfAccount: response.chartOfAccount }
  };
}

export default {
  listChartOfAccounts,
  createChartOfAccount,
  updateChartOfAccount,
  deleteChartOfAccount,
  getChartOfAccountById
}
