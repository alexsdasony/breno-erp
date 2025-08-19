import apiService from '@/services/api'

export async function listBillings(params = {}) {
  const res = await apiService.getBillings(params)
  return res.billings || res.data || []
}

export async function createBilling(payload) {
  const res = await apiService.createBilling(payload)
  return res.billing || res
}

export async function updateBilling(id, payload) {
  const res = await apiService.updateBilling(id, payload)
  return res.billing || res
}

export async function deleteBilling(id) {
  return apiService.deleteBilling(id)
}

export async function getBillingById(id) {
  const res = await apiService.getBillings({ id })
  return res.billings?.[0] || res.billing || res
}
