import type { ID, Timestamped } from './common'

export type Product = Timestamped & {
  id: ID
  name: string
  sku?: string | null
  price: number
  costPrice?: number | null
  stockQuantity?: number | null
  minimumStock?: number | null
  segmentId?: ID | null
}

export type ProductPayload = {
  name?: string
  sku?: string | null
  price?: number
  cost_price?: number | null
  stock_quantity?: number | null
  minimum_stock?: number | null
  segment_id?: ID | null
}
