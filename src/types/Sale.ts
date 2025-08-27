import { ID, Timestamped } from './common'
import { Customer } from './Customer'
import { Product } from './Product'

export interface SaleItem {
  id: ID
  sale_id: ID
  product_id: ID
  product?: Product
  quantity: number
  unit_price: number
  total: number
}

export interface Sale extends Timestamped {
  id: ID
  customer_id?: ID | null
  customer_name?: string | null
  customer?: Customer
  product?: string | null
  quantity: number
  date: string
  sale_date?: string | null
  total: number
  total_amount?: number | null
  status: string
  payment_method: string
  notes?: string | null
  segment_id?: ID | null
  deleted_at?: string | null
  is_deleted?: boolean | null
  items?: SaleItem[]
}

export interface SalePayload {
  customer_id?: ID | null
  customer_name?: string | null
  product?: string | null
  quantity?: number
  date: string
  sale_date?: string | null
  total?: number
  total_amount?: number | null
  status?: string
  payment_method?: string
  notes?: string | null
  segment_id?: ID | null
  items?: Omit<SaleItem, 'id' | 'sale_id'>[] 
}