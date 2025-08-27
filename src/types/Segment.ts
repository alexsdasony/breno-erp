import type { ID, Timestamped } from './common'

export interface Segment extends Timestamped {
  id: ID
  name: string
  description?: string | null
}

export interface SegmentPayload {
  name?: string
  description?: string | null
}
