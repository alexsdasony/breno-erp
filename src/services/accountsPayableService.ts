import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { AccountPayable, AccountPayablePayload } from '@/types'

export async function listAccountsPayable(params: Record<string, any> = {}): Promise<ApiResponse<{ accounts_payable: AccountPayable[] }>> {
  const response = await apiService.get<{ success: boolean; accounts_payable: AccountPayable[] }>('/accounts-payable', params)
  return {
    success: response.success,
    data: { accounts_payable: response.accounts_payable || [] }
  }
}

export async function createAccountPayable(payload: AccountPayablePayload): Promise<ApiResponse<{ account_payable: AccountPayable }>> {
  const response = await apiService.post<{ success: boolean; account_payable: AccountPayable }>('/accounts-payable', payload)
  return {
    success: response.success,
    data: { account_payable: response.account_payable }
  }
}

export async function updateAccountPayable(id: string, payload: Partial<AccountPayablePayload>): Promise<ApiResponse<{ account_payable: AccountPayable }>> {
  const response = await apiService.put<{ success: boolean; account_payable: AccountPayable }>(`/accounts-payable/${id}`, payload)
  return {
    success: response.success,
    data: { account_payable: response.account_payable }
  }
}

export async function deleteAccountPayable(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/accounts-payable/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getAccountPayableById(id: string): Promise<ApiResponse<{ account_payable: AccountPayable }>> {
  const response = await apiService.get<{ success: boolean; account_payable: AccountPayable }>(`/accounts-payable/${id}`)
  return {
    success: response.success,
    data: { account_payable: response.account_payable }
  }
}

export default {
  listAccountsPayable,
  createAccountPayable,
  updateAccountPayable,
  deleteAccountPayable,
  getAccountPayableById
}