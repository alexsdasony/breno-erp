import type { ID, Timestamped } from './common'

export interface Supplier extends Timestamped {
  id: ID
  name: string
  document?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  contact_person?: string | null
  payment_terms?: string | null
  is_active?: boolean
  segment_id?: ID | null
}

export interface SupplierPayload {
  name?: string
  document?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  contact_person?: string | null
  payment_terms?: string | null
  is_active?: boolean
  segment_id?: ID | null
}