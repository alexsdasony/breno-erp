import type { ID, Timestamped } from './common'

export interface Transaction extends Timestamped {
  id: ID
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  category?: string | null
  account_id?: ID | null
  reference_id?: ID | null
  reference_type?: string | null
  status: 'pending' | 'completed' | 'cancelled'
  payment_method?: string | null
  notes?: string | null
  segment_id?: ID | null
}

export interface TransactionPayload {
  type?: 'income' | 'expense'
  amount?: number
  description?: string
  date?: string
  category?: string | null
  account_id?: ID | null
  reference_id?: ID | null
  reference_type?: string | null
  status?: 'pending' | 'completed' | 'cancelled'
  payment_method?: string | null
  notes?: string | null
  segment_id?: ID | null
}