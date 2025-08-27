import type { ID, Timestamped } from './common'

export interface AccountsPayable extends Timestamped {
  id: ID
  supplier_id?: ID | null
  numero_nota_fiscal?: string | null
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento?: string | null
  status: string
  categoria_id?: ID | null
  forma_pagamento?: string | null
  observacoes?: string | null
  responsavel_pagamento?: string | null
  numero_parcela?: number
  total_parcelas?: number
  segment_id?: ID | null
  deleted_at?: string | null
  is_deleted?: boolean
}

export interface AccountsPayablePayload {
  supplier_id?: ID | null
  numero_nota_fiscal?: string | null
  descricao: string
  valor: number
  data_vencimento: string
  data_pagamento?: string | null
  status?: string
  categoria_id?: ID | null
  forma_pagamento?: string | null
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
  status?: string
  segment_id?: string | null
  notes?: string | null
  payment_date?: string | null
  payment_method?: string | null
}

export interface AccountPayablePayload {
  description: string
  amount: number
  due_date?: string | null
  supplier_id?: string | null
  category?: string | null
  status?: string
  segment_id?: string | null
  notes?: string | null
  payment_date?: string | null
  payment_method?: string | null
}