import type { ID, Timestamped } from './common'

export interface Customer extends Timestamped {
  id: ID
  name: string
  tax_id: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  notes?: string | null
  status?: 'active' | 'inactive' | 'suspended' | null
  segment_id?: ID | null
  tipo_pessoa?: 'pf' | 'pj' | null
  rg?: string | null
  data_nascimento?: string | null
  estado_civil?: string | null
  profissao?: string | null
  empresa?: string | null
  cargo?: string | null
  data_admissao?: string | null
  telefone_comercial?: string | null
  celular?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  tipo_imovel?: string | null
  possui_patrimonio?: boolean | null
  valor_patrimonio?: number | null
  descricao_patrimonio?: string | null
  responsavel_cadastro?: string | null
  data_cadastro?: string | null
  observacoes?: string | null
  deleted_at?: string | null
  is_deleted?: boolean | null
  
  // Campos de compatibilidade legada
  cpf?: string | null
  cnpj?: string | null
  total_purchases?: number | null
  last_purchase_date?: string | null
}

export interface CustomerPayload {
  name?: string
  tax_id?: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  notes?: string | null
  status?: 'active' | 'inactive' | 'suspended' | null
  segment_id?: ID | null
  tipo_pessoa?: 'pf' | 'pj' | null
  rg?: string | null
  data_nascimento?: string | null
  estado_civil?: string | null
  profissao?: string | null
  empresa?: string | null
  cargo?: string | null
  data_admissao?: string | null
  telefone_comercial?: string | null
  celular?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  tipo_imovel?: string | null
  possui_patrimonio?: boolean | null
  valor_patrimonio?: number | null
  descricao_patrimonio?: string | null
  responsavel_cadastro?: string | null
  data_cadastro?: string | null
  observacoes?: string | null
}
