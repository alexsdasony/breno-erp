import apiService from '@/services/api'

export async function listProducts(params = {}) {
  const res = await apiService.getProducts(params)
  return res.products || res.data || []
}

export async function createProduct(payload) {
  const res = await apiService.createProduct(payload)
  return res.product || res
}

export async function updateProduct(id, payload) {
  const res = await apiService.updateProduct(id, payload)
  return res.product || res
}

export async function deleteProduct(id) {
  return apiService.deleteProduct(id)
}

export async function getProductById(id) {
  const res = await apiService.getProducts({ id })
  return res.products?.[0] || res.product || res
}

export async function getLowStockProducts(params = {}) {
  const res = await apiService.getLowStockProducts(params)
  return res.products || res.data || []
}
