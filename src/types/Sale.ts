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
  customer_id: ID
  customer?: Customer
  date: string
  total: number
  status: string
  payment_method: string
  notes?: string
  items?: SaleItem[]
}

export interface SalePayload {
  customer_id: ID
  date: string
  total?: number
  status: string
  payment_method: string
  notes?: string
  items?: Omit<SaleItem, 'id' | 'sale_id'>[] 
}