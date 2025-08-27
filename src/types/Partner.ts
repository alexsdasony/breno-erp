import type { ID, Timestamped } from './common'

export interface Partner extends Timestamped {
  id: ID
  name: string
  document?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  segment_id?: ID | null
}

export interface PartnerPayload {
  name?: string
  document?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  segment_id?: ID | null
}
