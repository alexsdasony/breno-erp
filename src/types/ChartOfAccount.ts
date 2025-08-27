import { ID, Timestamped } from './common'

export interface ChartOfAccount extends Timestamped {
  id: ID
  code: string
  name: string
  type: string
  parent_id?: ID
  description?: string
  is_active?: boolean
}

export interface ChartOfAccountPayload {
  code?: string
  name?: string
  type?: string
  parent_id?: ID
  description?: string
  is_active?: boolean
}