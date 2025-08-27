import type { ID, Timestamped } from './common'

export interface Product extends Timestamped {
  id: ID
  name: string
  sku?: string | null
  price: number
  cost_price?: number | null
  stock_quantity?: number | null
  minimum_stock?: number | null
  segment_id?: ID | null
  category?: string | null
  description?: string | null
}

export interface ProductPayload {
  name?: string
  sku?: string | null
  price?: number
  cost_price?: number | null
  stock_quantity?: number | null
  minimum_stock?: number | null
  segment_id?: ID | null
  category?: string | null
  description?: string | null
}
