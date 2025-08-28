import type { ID, Timestamped } from './common'
import type { CustomerStatus, PersonType } from './enums'

export interface Partner extends Timestamped {
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
  status?: CustomerStatus | null
  segment_id?: ID | null
  tipo_pessoa?: PersonType | null
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
  document?: string | null
}

export interface PartnerPayload {
  name?: string
  tax_id?: string
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zip_code?: string | null
  notes?: string | null
  status?: CustomerStatus | null
  segment_id?: ID | null
  tipo_pessoa?: PersonType | null
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
  
  // Campos de compatibilidade legada
  document?: string | null
}
