import type { ID, Timestamped } from './common'

export type Segment = Timestamped & {
  id: ID
  name: string
  description?: string | null
}

export type SegmentPayload = {
  name?: string
  description?: string | null
}
