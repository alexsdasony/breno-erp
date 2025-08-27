import { ID, Timestamped } from './common'

export interface FinancialDocument extends Timestamped {
  id: ID
  document_number: string
  document_type: string
  issue_date: string
  due_date: string
  amount: number
  status: string
  entity_id?: ID
  entity_name?: string
  entity_type?: string
  notes?: string
  payment_method?: string
  category?: string
}

export interface FinancialDocumentPayload {
  document_number?: string
  document_type?: string
  issue_date?: string
  due_date?: string
  amount?: number
  status?: string
  entity_id?: ID
  entity_name?: string
  entity_type?: string
  notes?: string
  payment_method?: string
  category?: string
}