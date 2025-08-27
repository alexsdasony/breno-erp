import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { AccountPayable, AccountPayablePayload } from '@/types'

export async function listAccountsPayable(params: Record<string, any> = {}): Promise<ApiResponse<{ accounts_payable: AccountPayable[] }>> {
  const response = await apiService.get<{ accounts_payable: AccountPayable[] }>('/accounts-payable', params)
  return response as ApiResponse<{ accounts_payable: AccountPayable[] }>
}

export async function createAccountPayable(payload: AccountPayablePayload): Promise<ApiResponse<{ account_payable: AccountPayable }>> {
  const response = await apiService.post<{ account_payable: AccountPayable }>('/accounts-payable', payload)
  return response as ApiResponse<{ account_payable: AccountPayable }>
}

export async function updateAccountPayable(id: string, payload: Partial<AccountPayablePayload>): Promise<ApiResponse<{ account_payable: AccountPayable }>> {
  const response = await apiService.put<{ account_payable: AccountPayable }>(`/accounts-payable/${id}`, payload)
  return response as ApiResponse<{ account_payable: AccountPayable }>
}

export async function deleteAccountPayable(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/accounts-payable/${id}`)
  return response
}

export async function getAccountPayableById(id: string): Promise<ApiResponse<{ account_payable: AccountPayable }>> {
  const response = await apiService.get<{ account_payable: AccountPayable }>(`/accounts-payable/${id}`)
  return response as ApiResponse<{ account_payable: AccountPayable }>
}