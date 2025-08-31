import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { CustomerDocument, DocumentType } from '@/types/CustomerForm'

export async function getCustomerDocuments(partnerId: string): Promise<ApiResponse> {
  const response = await apiService.get<{ documents: CustomerDocument[] }>(`/customers/${partnerId}/documents`)
  return {
    success: true,
    data: response
  }
}

export async function uploadCustomerDocument(
  partnerId: string,
  file: File,
  documentType: DocumentType,
  onProgress?: (progress: number) => void
): Promise<ApiResponse> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('document_type', documentType)
  formData.append('partner_id', partnerId)

  const response = await apiService.post<{ document: CustomerDocument }>(
    `/customers/${partnerId}/documents`,
    formData
  )

  // Simular progresso para compatibilidade
  if (onProgress) {
    onProgress(100)
  }

  return {
    success: true,
    data: response
  }
}

export async function deleteCustomerDocument(documentId: string): Promise<ApiResponse> {
  const response = await apiService.delete<{ success: boolean }>(`/customers/documents/${documentId}`)
  return {
    success: response.success,
    data: response
  }
}

export async function updateCustomerDocument(
  documentId: string,
  updates: Partial<CustomerDocument>
): Promise<ApiResponse> {
  const response = await apiService.put<{ document: CustomerDocument }>(
    `/customers/documents/${documentId}`,
    updates
  )
  return {
    success: true,
    data: response
  }
}