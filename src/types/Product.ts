import type { ID, Timestamped } from './common'
import type { ProductStatus } from './enums'

export interface Product extends Timestamped {
  id: ID
  name: string
  code?: string | null
  price: number
  cost_price?: number | null
  stock?: number | null
  stock_quantity?: number | null
  min_stock?: number | null
  minimum_stock?: number | null
  segment_id?: ID | null
  category?: string | null
  description?: string | null
  supplier?: string | null
  status?: ProductStatus | null
  deleted_at?: string | null
  is_deleted?: boolean | null
}

export interface ProductPayload {
  name?: string
  code?: string | null
  price?: number
  cost_price?: number | null
  stock?: number | null
  stock_quantity?: number | null
  min_stock?: number | null
  minimum_stock?: number | null
  segment_id?: ID | null
  category?: string | null
  description?: string | null
  supplier?: string | null
}
