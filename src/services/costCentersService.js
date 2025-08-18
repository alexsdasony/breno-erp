import apiService from '@/services/api'

export async function listCostCenters(params = {}) {
  const res = await apiService.getCostCenters(params)
  return res.costCenters || res.data || []
}

export async function createCostCenter(payload) {
  const res = await apiService.createCostCenter(payload)
  return res.costCenter || res
}

export async function updateCostCenter(id, payload) {
  const res = await apiService.updateCostCenter(id, payload)
  return res.costCenter || res
}

export async function deleteCostCenter(id) {
  return apiService.deleteCostCenter(id)
}

export async function getCostCenterById(id) {
  const res = await apiService.getCostCenters({ id })
  return res.costCenters?.[0] || res.costCenter || res
}
