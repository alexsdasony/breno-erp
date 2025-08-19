import apiService from '@/services/api'

export async function listPartners(params = {}) {
  const res = await apiService.getPartners(params)
  return res.partners || res.data || []
}

export async function createPartner(payload) {
  const res = await apiService.createPartner(payload)
  return res.partner || res
}

export async function updatePartner(id, payload) {
  const res = await apiService.updatePartner(id, payload)
  return res.partner || res
}

export async function deletePartner(id) {
  return apiService.deletePartner(id)
}

export async function getPartnerById(id) {
  const res = await apiService.getPartners({ id })
  return res.partners?.[0] || res.partner || res
}
