import type { ID, Timestamped } from './common'

export type Partner = Timestamped & {
  id: ID
  name: string
  document?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  segmentId?: ID | null
}

export type PartnerPayload = {
  name?: string
  document?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  segment_id?: ID | null
}
