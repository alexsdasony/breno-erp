import type { ID, Timestamped } from './common'
import type { AccountsPayableStatus, PaymentMethod } from './enums'

export interface AccountsPayable extends Timestamped {
  id: ID
  supplier_id?: ID | null
  numero_nota_fiscal?: string | null
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento?: string | null
  status: AccountsPayableStatus
  categoria_id?: ID | null
  forma_pagamento?: PaymentMethod | null
  observacoes?: string | null
  responsavel_pagamento?: string | null
  numero_parcela?: number
  total_parcelas?: number
  segment_id?: ID | null
  deleted_at?: string | null
  is_deleted?: boolean
  // Campos adicionais para compatibilidade
  partner_name?: string | null
  payment_method?: string | null
}

export interface AccountsPayablePayload {
  supplier_id?: ID | null
  numero_nota_fiscal?: string | null
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento?: string | null
  status?: AccountsPayableStatus
  categoria_id?: ID | null
  forma_pagamento?: PaymentMethod | null
  observacoes?: string | null
  responsavel_pagamento?: string | null
  numero_parcela?: number
  total_parcelas?: number
  segment_id?: ID | null
}

// Legacy compatibility - manter para compatibilidade com código existente
export interface AccountPayable {
  id: string
  description: string
  amount: number
  due_date?: string | null
  supplier_id?: string | null
  supplier_name?: string | null
  category?: string | null
  status?: AccountsPayableStatus
  segment_id?: string | null
  notes?: string | null
  payment_date?: string | null
  payment_method?: PaymentMethod | null
}

export interface AccountPayablePayload {
  description: string
  amount: number
  due_date?: string | null
  supplier_id?: string | null
  category?: string | null
  status?: AccountsPayableStatus
  segment_id?: string | null
  notes?: string | null
  payment_date?: string | null
  payment_method?: PaymentMethod | null
}