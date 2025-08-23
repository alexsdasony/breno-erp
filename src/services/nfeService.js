import apiService from '@/services/api'

export async function listNFes(params = {}) {
  const res = await apiService.getNFes(params)
  return res.nfes || res.data || []
}

export async function createNFe(payload) {
  const res = await apiService.createNFe(payload)
  return res.nfe || res
}

export async function updateNFe(id, payload) {
  const res = await apiService.updateNFe(id, payload)
  return res.nfe || res
}

export async function deleteNFe(id) {
  return apiService.deleteNFe(id)
}

export async function getNFeById(id) {
  const res = await apiService.getNFes({ id })
  return res.nfes?.[0] || res.nfe || res
}
