import type { ID, Timestamped } from './common'

export interface Supplier extends Timestamped {
  id: ID
  
  // Identificação
  razao_social: string
  nome_fantasia?: string | null
  ramo_atividade?: string | null
  tipo_contribuinte: 'PJ' | 'PF' | 'MEI' | 'Outros'
  cpf_cnpj: string
  inscricao_estadual?: string | null
  inscricao_municipal?: string | null
  
  // Localização
  uf?: string | null
  cidade?: string | null
  cep?: string | null
  endereco?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  
  // Contato
  pessoa_contato?: string | null
  telefone_fixo?: string | null
  telefone_celular?: string | null
  email?: string | null
  site?: string | null
  
  // Financeiro
  banco_nome?: string | null
  banco_codigo?: string | null
  agencia_numero?: string | null
  agencia_digito?: string | null
  conta_numero?: string | null
  conta_digito?: string | null
  pix_chave?: string | null
  condicao_pagamento?: string | null
  
  // Operacional
  status: 'ATIVO' | 'INATIVO'
  data_cadastro: string
  observacoes?: string | null
  segment_id?: ID | null
  
  // Campos depreciados para compatibilidade
  /** @deprecated Use razao_social instead */
  name?: string
  /** @deprecated Use cpf_cnpj instead */
  cnpj?: string | null
  /** @deprecated Use cpf_cnpj instead */
  cpf?: string | null
  /** @deprecated Use telefone_celular instead */
  telefone?: string | null
  /** @deprecated Use endereco instead */
  address?: string | null
  /** @deprecated Use estado instead */
  state?: string | null
  /** @deprecated Use cpf_cnpj instead */
  document?: string | null
  /** @deprecated Use telefone_celular instead */
  phone?: string | null
  /** @deprecated Use pessoa_contato instead */
  contact_person?: string | null
  /** @deprecated Use condicao_pagamento instead */
  payment_terms?: string | null
  /** @deprecated Use status instead */
  is_active?: boolean
}

export interface SupplierPayload {
  // Identificação
  razao_social?: string
  nome_fantasia?: string | null
  ramo_atividade?: string | null
  tipo_contribuinte?: 'PJ' | 'PF' | 'MEI' | 'Outros'
  cpf_cnpj?: string
  inscricao_estadual?: string | null
  inscricao_municipal?: string | null
  
  // Localização
  uf?: string | null
  cidade?: string | null
  cep?: string | null
  endereco?: string | null
  numero?: string | null
  complemento?: string | null
  bairro?: string | null
  
  // Contato
  pessoa_contato?: string | null
  telefone_fixo?: string | null
  telefone_celular?: string | null
  email?: string | null
  site?: string | null
  
  // Financeiro
  banco_nome?: string | null
  banco_codigo?: string | null
  agencia_numero?: string | null
  agencia_digito?: string | null
  conta_numero?: string | null
  conta_digito?: string | null
  pix_chave?: string | null
  condicao_pagamento?: string | null
  
  // Operacional
  status?: 'ATIVO' | 'INATIVO'
  data_cadastro?: string
  observacoes?: string | null
  segment_id?: ID | null
  
  // Campos depreciados para compatibilidade
  /** @deprecated Use razao_social instead */
  name?: string
  /** @deprecated Use cpf_cnpj instead */
  cnpj?: string | null
  /** @deprecated Use cpf_cnpj instead */
  cpf?: string | null
  /** @deprecated Use telefone_celular instead */
  telefone?: string | null
  /** @deprecated Use endereco instead */
  address?: string | null
  /** @deprecated Use estado instead */
  state?: string | null
  /** @deprecated Use cpf_cnpj instead */
  document?: string | null
  /** @deprecated Use telefone_celular instead */
  phone?: string | null
  /** @deprecated Use pessoa_contato instead */
  contact_person?: string | null
  /** @deprecated Use condicao_pagamento instead */
  payment_terms?: string | null
  /** @deprecated Use status instead */
  is_active?: boolean
}