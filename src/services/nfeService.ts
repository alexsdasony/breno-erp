import apiService from '@/services/api'
import type { NFe, NFePayload } from '@/types'

// Map API response (snake_case) to frontend type (camelCase)
function mapNFeFromApi(input: any): NFe {
  return {
    id: input.id,
    customerId: input.customer_id ?? input.customerId ?? null,
    customerName: input.customer_name ?? input.customerName ?? '',
    invoiceNumber: input.invoice_number ?? input.invoiceNumber ?? '',
    issueDate: input.issue_date ?? input.issueDate ?? '',
    totalAmount: typeof input.total_amount !== 'undefined' ? Number(input.total_amount) : Number(input.totalAmount ?? 0),
    taxAmount: typeof input.tax_amount !== 'undefined' ? Number(input.tax_amount) : Number(input.taxAmount ?? 0),
    status: input.status ?? 'pending',
    xmlContent: input.xml_content ?? input.xmlContent ?? null,
    accessKey: input.access_key ?? input.accessKey ?? null,
    segmentId: input.segment_id ?? input.segmentId ?? null,
    notes: input.notes ?? null,
    createdAt: input.created_at ?? input.createdAt,
    updatedAt: input.updated_at ?? input.updatedAt,
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

export async function listNFes(params: Record<string, any> = {}): Promise<NFe[]> {
  const res: any = await apiService.getNFes(params)
  const list = (res.nfes || res.data || []) as any[]
  return list.map(mapNFeFromApi)
}

export async function createNFe(payload: Partial<NFe> | NFePayload): Promise<NFe> {
  const apiPayload = toApiPayload(payload)
  const res: any = await apiService.createNFe(apiPayload)
  const item = (res.nfe || res.data || res)
  return mapNFeFromApi(item)
}

export async function updateNFe(id: string, payload: Partial<NFe> | NFePayload): Promise<NFe> {
  const apiPayload = toApiPayload(payload)
  const res: any = await apiService.updateNFe(id, apiPayload)
  const item = (res.nfe || res.data || res)
  return mapNFeFromApi(item)
}

export async function deleteNFe(id: string): Promise<void> {
  await apiService.deleteNFe(id)
}

export async function getNFeById(id: string): Promise<NFe> {
  const res: any = await apiService.getNFes({ id })
  const item = (res.nfes?.[0] || res.nfe || res.data || res)
  return mapNFeFromApi(item)
}
