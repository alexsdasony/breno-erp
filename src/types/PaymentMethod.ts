import type { ID, Timestamped } from './common'

export interface PaymentMethod extends Timestamped {
  id: ID
  name: string
  nfe_code?: string | null
}

export interface PaymentMethodPayload {
  name?: string
  nfe_code?: string | null
}
