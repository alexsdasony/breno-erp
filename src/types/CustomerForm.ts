export interface CustomerFormData {
  // Dados Pessoais
  segment_id?: string;
  name: string;
  tipo_pessoa: 'fisica' | 'juridica';
  tax_id: string; // CPF ou CNPJ
  rg?: string;
  data_nascimento?: string;
  estado_civil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  profissao?: string;

  // Dados Profissionais
  empresa?: string;
  cargo?: string;
  data_admissao?: string;
  telefone_comercial?: string;

  // Contato
  email?: string;
  phone?: string; // telefone residencial
  celular?: string;
  preferencia_contato?: 'email' | 'telefone' | 'celular' | 'whatsapp';
  melhor_horario_contato?: string;

  // Endereço
  address?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  tipo_imovel?: 'proprio' | 'alugado' | 'financiado' | 'cedido' | 'outros';

  // Patrimônio
  possui_patrimonio: boolean;
  valor_patrimonio?: number;
  descricao_patrimonio?: string;

  // Sistema
  status: 'ativo' | 'inativo' | 'suspenso';
  data_cadastro?: string;
  responsavel_cadastro?: string;
  observacoes?: string;

  // Documentos
  documents?: CustomerDocument[];
}

export interface CustomerDocument {
  id?: string;
  partner_id?: string;
  document_type: DocumentType;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  url?: string;
  ai_extracted_content?: string;
  ai_model_used?: string;
  confidence_score?: number;
  created_at?: string;
  updated_at?: string;
}

export type DocumentType = 
  | 'rg'
  | 'cpf'
  | 'cnpj'
  | 'comprovante_residencia'
  | 'comprovante_renda'
  | 'contrato_social'
  | 'procuracao'
  | 'outros';

export type CustomerFormTab = 
  | 'dados-pessoais'
  | 'dados-profissionais'
  | 'contato'
  | 'endereco'
  | 'patrimonio'
  | 'documentos'
  | 'sistema';

export interface CustomerFormValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface CustomerFormState {
  data: CustomerFormData;
  activeTab: CustomerFormTab;
  isLoading: boolean;
  isSaving: boolean;
  validation: CustomerFormValidation;
  isDirty: boolean;
}

export interface AddressApiResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface CustomerFormProps {
  customerId?: string;
  onSave?: (customer: CustomerFormData) => void;
  onCancel?: () => void;
}

export interface CustomerTabProps {
  data: CustomerFormData;
  onChange: (data: Partial<CustomerFormData>) => void;
  validation: CustomerFormValidation;
  isLoading?: boolean;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  rg: 'RG',
  cpf: 'CPF',
  cnpj: 'CNPJ',
  comprovante_residencia: 'Comprovante de Residência',
  comprovante_renda: 'Comprovante de Renda',
  contrato_social: 'Contrato Social',
  procuracao: 'Procuração',
  outros: 'Outros'
};

export const ESTADO_CIVIL_OPTIONS = [
  { value: 'solteiro', label: 'Solteiro(a)' },
  { value: 'casado', label: 'Casado(a)' },
  { value: 'divorciado', label: 'Divorciado(a)' },
  { value: 'viuvo', label: 'Viúvo(a)' },
  { value: 'uniao_estavel', label: 'União Estável' }
];

export const TIPO_IMOVEL_OPTIONS = [
  { value: 'proprio', label: 'Próprio' },
  { value: 'alugado', label: 'Alugado' },
  { value: 'financiado', label: 'Financiado' },
  { value: 'cedido', label: 'Cedido' },
  { value: 'outros', label: 'Outros' }
];

export const TIPO_PESSOA_OPTIONS = [
  { value: 'fisica', label: 'Pessoa Física' },
  { value: 'juridica', label: 'Pessoa Jurídica' }
];

export const PREFERENCIA_CONTATO_OPTIONS = [
  { value: 'email', label: 'E-mail' },
  { value: 'telefone', label: 'Telefone' },
  { value: 'celular', label: 'Celular' },
  { value: 'whatsapp', label: 'WhatsApp' }
];

export const HORARIO_CONTATO_OPTIONS = [
  { value: 'manha', label: 'Manhã (8h-12h)' },
  { value: 'tarde', label: 'Tarde (12h-18h)' },
  { value: 'noite', label: 'Noite (18h-22h)' }
];

export const STATUS_OPTIONS = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'inativo', label: 'Inativo' },
  { value: 'suspenso', label: 'Suspenso' }
];