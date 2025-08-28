import type { ID, Timestamped } from './common'
import type { NFeStatus } from './enums'

export interface NFe extends Timestamped {
  id: ID
  customer_id: ID | null
  customer_name: string
  invoice_number: string
  issue_date: string
  total_amount: number
  tax_amount: number
  status: NFeStatus
  xml_content?: string | null
  access_key?: string | null
  segment_id?: ID | null
  notes?: string | null
}

export interface NFePayload {
  customer_id?: ID | null
  customer_name?: string
  invoice_number?: string
  issue_date?: string
  total_amount?: number
  tax_amount?: number
  status?: NFeStatus
  xml_content?: string | null
  access_key?: string | null
  segment_id?: ID | null
  notes?: string | null
}
