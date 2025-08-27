import type { ID, Timestamped } from './common'

export interface CostCenter extends Timestamped {
  id: ID
  name: string
  description?: string | null
  is_active?: boolean
  segment_id?: ID | null
}

export interface CostCenterPayload {
  name?: string
  description?: string | null
  is_active?: boolean
  segment_id?: ID | null
}