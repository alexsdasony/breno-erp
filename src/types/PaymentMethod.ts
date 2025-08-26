export type PaymentMethod = {
  id: string
  name: string
  nfe_code?: string | null
  created_at?: string
  updated_at?: string
}

export type PaymentMethodPayload = {
  name: string
  nfe_code?: string | null
}
