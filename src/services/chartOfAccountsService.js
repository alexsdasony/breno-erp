import apiService from '@/services/api'

export async function listChartOfAccounts(params = {}) {
  const res = await apiService.getChartOfAccounts(params)
  return res.chartOfAccounts || res.data || []
}

export async function createChartOfAccount(payload) {
  const res = await apiService.createChartOfAccount(payload)
  return res.chartOfAccount || res
}

export async function updateChartOfAccount(id, payload) {
  const res = await apiService.updateChartOfAccount(id, payload)
  return res.chartOfAccount || res
}

export async function deleteChartOfAccount(id) {
  return apiService.deleteChartOfAccount(id)
}

export async function getChartOfAccountById(id) {
  const res = await apiService.getChartOfAccounts({ id })
  return res.chartOfAccounts?.[0] || res.chartOfAccount || res
}
