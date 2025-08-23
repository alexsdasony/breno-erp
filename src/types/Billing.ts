import type { ID, Timestamped } from './common'

export type Billing = Timestamped & {
  id: ID
  customerId: ID | null
  customerName: string
  invoiceNumber: string
  issueDate: string
  dueDate: string
  amount: number
  taxAmount: number
  totalAmount: number
  paymentMethod?: string | null
  status: string
  notes?: string | null
  segmentId?: ID | null
}

export type BillingPayload = {
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
