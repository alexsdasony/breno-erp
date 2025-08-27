import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { NFe, NFePayload } from '@/types'

// Map API response (snake_case) to frontend type (camelCase)
function mapNFeFromApi(input: any): NFe {
  return {
    id: input.id,
    customer_id: input.customer_id ?? input.customerId ?? null,
    customer_name: input.customer_name ?? input.customerName ?? '',
    invoice_number: input.invoice_number ?? input.invoiceNumber ?? '',
    issue_date: input.issue_date ?? input.issueDate ?? '',
    total_amount: typeof input.total_amount !== 'undefined' ? Number(input.total_amount) : Number(input.totalAmount ?? 0),
    tax_amount: typeof input.tax_amount !== 'undefined' ? Number(input.tax_amount) : Number(input.taxAmount ?? 0),
    status: input.status ?? 'pending',
    xml_content: input.xml_content ?? input.xmlContent ?? null,
    access_key: input.access_key ?? input.accessKey ?? null,
    segment_id: input.segment_id ?? input.segmentId ?? null,
    notes: input.notes ?? null,
    created_at: input.created_at ?? input.createdAt,
    updated_at: input.updated_at ?? input.updatedAt,
  }
}

// Accept either camelCase or snake_case and normalize to API payload (snake_case)
function toApiPayload(data: Partial<NFe> | NFePayload): NFePayload {
  const anyData: any = data as any;
  return {
    customer_id: anyData.customer_id ?? anyData.customerId ?? null,
    customer_name: anyData.customer_name ?? anyData.customerName ?? undefined,
    invoice_number: anyData.invoice_number ?? anyData.invoiceNumber ?? undefined,
    issue_date: anyData.issue_date ?? anyData.issueDate ?? undefined,
    total_amount: typeof anyData.total_amount !== 'undefined' ? Number(anyData.total_amount) : (typeof anyData.totalAmount !== 'undefined' ? Number(anyData.totalAmount) : undefined),
    tax_amount: typeof anyData.tax_amount !== 'undefined' ? Number(anyData.tax_amount) : (typeof anyData.taxAmount !== 'undefined' ? Number(anyData.taxAmount) : undefined),
    status: anyData.status ?? undefined,
    xml_content: anyData.xml_content ?? anyData.xmlContent ?? null,
    access_key: anyData.access_key ?? anyData.accessKey ?? null,
    segment_id: anyData.segment_id ?? anyData.segmentId ?? null,
    notes: anyData.notes ?? null,
  }
}

export async function listNFes(params: Record<string, any> = {}): Promise<ApiResponse<{ nfes: NFe[] }>> {
  const response = await apiService.get<ApiResponse<{ nfes: any[] }>>('/nfes', params)
  if (response.data && response.data.nfes) {
    response.data.nfes = response.data.nfes.map(mapNFeFromApi)
  }
  return response as ApiResponse<{ nfes: NFe[] }>
}

export async function createNFe(payload: Partial<NFe> | NFePayload): Promise<ApiResponse<{ nfe: NFe }>> {
  const apiPayload = toApiPayload(payload)
  const response = await apiService.post<ApiResponse<{ nfe: any }>>('/nfes', apiPayload)
  if (response.data && response.data.nfe) {
    response.data.nfe = mapNFeFromApi(response.data.nfe)
  }
  return response as ApiResponse<{ nfe: NFe }>
}

export async function updateNFe(id: string, payload: Partial<NFe> | NFePayload): Promise<ApiResponse<{ nfe: NFe }>> {
  const apiPayload = toApiPayload(payload)
  const response = await apiService.put<ApiResponse<{ nfe: any }>>(`/nfes/${id}`, apiPayload)
  if (response.data && response.data.nfe) {
    response.data.nfe = mapNFeFromApi(response.data.nfe)
  }
  return response as ApiResponse<{ nfe: NFe }>
}

export async function deleteNFe(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/nfes/${id}`)
  return response
}

export async function getNFeById(id: string): Promise<ApiResponse<{ nfe: NFe }>> {
  const response = await apiService.get<ApiResponse<any>>(`/nfes/${id}`)
  
  // Criar uma resposta padronizada
  let transformedResponse: ApiResponse<{ nfe: NFe }>
  
  if (response.data && 'nfe' in response.data) {
    // Caso 1: A resposta já tem o formato { nfe: ... }
    transformedResponse = {
      ...response,
      data: {
        nfe: mapNFeFromApi(response.data.nfe)
      }
    }
  } else if (response.data && 'nfes' in response.data && Array.isArray(response.data.nfes) && response.data.nfes.length > 0) {
    // Caso 2: A resposta tem o formato { nfes: [...] }
    transformedResponse = {
      ...response,
      data: {
        nfe: mapNFeFromApi(response.data.nfes[0])
      }
    }
  } else {
    // Caso 3: Formato desconhecido ou vazio
    transformedResponse = {
      ...response,
      data: { nfe: {} as NFe }
    }
  }
  
  return transformedResponse
}
