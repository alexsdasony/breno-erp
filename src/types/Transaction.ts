import type { ID, Timestamped } from './common'

export interface Transaction extends Timestamped {
  id: ID
  type: string
  description?: string | null
  amount: number
  date: string
  category?: string | null
  cost_center?: string | null
  segment_id?: ID | null
  deleted_at?: string | null
  is_deleted?: boolean | null
}

export interface TransactionPayload {
  type?: string
  description?: string | null
  amount?: number
  date?: string
  category?: string | null
  cost_center?: string | null
  segment_id?: ID | null
}