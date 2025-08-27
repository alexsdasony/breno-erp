import { ID, Timestamped } from './common'

// Interface baseada no schema real do banco financial_documents
export interface FinancialDocument extends Timestamped {
  id: ID
  partner_id?: ID
  direction: 'receivable' | 'payable'
  doc_no?: string
  issue_date?: string
  due_date?: string
  amount: number
  balance: number
  status: 'draft' | 'open' | 'partially_paid' | 'paid' | 'canceled'
  category_id?: ID
  segment_id?: ID
  description?: string
  payment_method?: string
  payment_method_id?: ID
  notes?: string
  deleted_at?: string
  is_deleted?: boolean
  // Campos relacionais do backend
  partner?: {
    name: string
  }
  // Campos mapeados para compatibilidade com o frontend
  type?: string // mapeado de direction
  date?: string // mapeado de issue_date
  partner_name?: string // mapeado de partner.name
}

export interface FinancialDocumentPayload {
  partner_id?: ID
  direction?: 'receivable' | 'payable'
  doc_no?: string
  issue_date?: string
  due_date?: string
  amount?: number
  balance?: number
  status?: 'draft' | 'open' | 'partially_paid' | 'paid' | 'canceled'
  category_id?: ID
  segment_id?: ID
  description?: string
  payment_method?: string
  payment_method_id?: ID
  notes?: string
}