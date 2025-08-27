import type { ID, Timestamped } from './common'

export interface Billing extends Timestamped {
  id: ID
  customer_id: ID | null
  customer_name: string
  invoice_number: string
  issue_date: string
  due_date: string
  amount: number
  tax_amount: number
  total_amount: number
  payment_method?: string | null
  status: string
  notes?: string | null
  segment_id?: ID | null
}

export interface BillingPayload {
  customer_id?: ID | null
  customer_name?: string
  invoice_number?: string
  issue_date?: string
  due_date?: string
  amount?: number
  tax_amount?: number
  total_amount?: number
  payment_method?: string | null
  status?: string
  notes?: string | null
  segment_id?: ID | null
}
