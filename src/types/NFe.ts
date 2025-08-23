import type { ID, Timestamped } from './common'

export type NFe = Timestamped & {
  id: ID
  customerId: ID | null
  customerName: string
  invoiceNumber: string
  issueDate: string
  totalAmount: number
  taxAmount: number
  status: string
  xmlContent?: string | null
  accessKey?: string | null
  segmentId?: ID | null
  notes?: string | null
}

export type NFePayload = {
  customer_id?: ID | null
  customer_name?: string
  invoice_number?: string
  issue_date?: string
  total_amount?: number
  tax_amount?: number
  status?: string
  xml_content?: string | null
  access_key?: string | null
  segment_id?: ID | null
  notes?: string | null
}
