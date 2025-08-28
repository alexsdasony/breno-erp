import type { ID, Timestamped } from './common'
import type { TransactionType } from './enums'

export interface Transaction extends Timestamped {
  id: ID
  type: TransactionType
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
  type?: TransactionType
  description?: string | null
  amount?: number
  date?: string
  category?: string | null
  cost_center?: string | null
  segment_id?: ID | null
}