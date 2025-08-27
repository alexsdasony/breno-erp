import type { ID, Timestamped } from './common'

export interface Supplier extends Timestamped {
  id: ID
  name: string
  cnpj?: string | null
  cpf?: string | null
  email?: string | null
  telefone?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  observacoes?: string | null
  status?: 'ativo' | 'inativo' | 'suspenso'
  segment_id?: ID | null
  
  // Campos depreciados para compatibilidade
  /** @deprecated Use cnpj or cpf instead */
  document?: string | null
  /** @deprecated Use telefone instead */
  phone?: string | null
  /** @deprecated Use endereco instead */
  address?: string | null
  /** @deprecated Use observacoes instead */
  contact_person?: string | null
  /** @deprecated Use observacoes instead */
  payment_terms?: string | null
  /** @deprecated Use status instead */
  is_active?: boolean
}

export interface SupplierPayload {
  name?: string
  cnpj?: string | null
  cpf?: string | null
  email?: string | null
  telefone?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  cep?: string | null
  observacoes?: string | null
  status?: 'ativo' | 'inativo' | 'suspenso'
  segment_id?: ID | null
  
  // Campos depreciados para compatibilidade
  /** @deprecated Use cnpj or cpf instead */
  document?: string | null
  /** @deprecated Use telefone instead */
  phone?: string | null
  /** @deprecated Use endereco instead */
  address?: string | null
  /** @deprecated Use observacoes instead */
  contact_person?: string | null
  /** @deprecated Use observacoes instead */
  payment_terms?: string | null
  /** @deprecated Use status instead */
  is_active?: boolean
}