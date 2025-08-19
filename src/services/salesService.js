import apiService from '@/services/api'

export async function listSales(params = {}) {
  const res = await apiService.getSales(params)
  return res.sales || res.data || []
}

export async function createSale(payload) {
  const res = await apiService.createSale(payload)
  return res.sale || res
}

export async function updateSale(id, payload) {
  const res = await apiService.updateSale(id, payload)
  return res.sale || res
}

export async function deleteSale(id) {
  return apiService.deleteSale(id)
}

export async function getSaleById(id) {
  const res = await apiService.getSales({ id })
  return res.sales?.[0] || res.sale || res
}
