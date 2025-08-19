import apiService from '@/services/api'

export async function listFinancialDocuments(params = {}) {
  const res = await apiService.getFinancialDocuments(params)
  return res.financialDocuments || res.data || []
}

export async function createFinancialDocument(payload) {
  const res = await apiService.createFinancialDocument(payload)
  return res.document || res
}

export async function updateFinancialDocument(id, payload) {
  const res = await apiService.updateFinancialDocument(id, payload)
  return res.document || res
}

export async function deleteFinancialDocument(id) {
  return apiService.deleteFinancialDocument(id)
}

export async function getFinancialDocumentById(id) {
  const res = await apiService.getFinancialDocuments({ id })
  return res.financialDocuments?.[0] || res.document || res
}
