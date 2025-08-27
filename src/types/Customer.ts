import type { ID, Timestamped } from './common'

export interface Customer extends Timestamped {
  id: ID
  name: string
  document?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  segment_id?: ID | null
}

export interface CustomerPayload {
  name?: string
  document?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  segment_id?: ID | null
}
