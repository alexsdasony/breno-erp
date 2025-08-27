import type { ID, Timestamped } from './common'

export interface Billing extends Timestamped {
  id: ID
  customer_id: ID | null
  customer_name?: string | null
  amount: number
  due_date: string
  status: string
  payment_date?: string | null
  segment_id?: ID | null
  deleted_at?: string | null
  is_deleted?: boolean
}

export interface BillingPayload {
  customer_id?: ID | null
  customer_name?: string | null
  amount: number
  due_date: string
  status?: string
  payment_date?: string | null
  segment_id?: ID | null
}
