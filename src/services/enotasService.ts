// Tipos para integração com e-Notas
export interface ENotasConfig {
  apiKey: string
  environment: 'sandbox' | 'production'
  baseUrl: string
}

export interface ENotasNFe {
  id?: string
  numero?: string
  serie?: string
  natureza_operacao: string
  data_emissao: string
  data_entrada_saida?: string
  tipo_documento: 'entrada' | 'saida'
  finalidade_emissao: 'normal' | 'complementar' | 'ajuste' | 'devolucao'
  consumidor_final: boolean
  presenca_comprador: 'nao_se_aplica' | 'presencial' | 'internet' | 'teleatendimento' | 'nfc_entrega_domicilio' | 'presencial_fora_estabelecimento' | 'outros'
  notas_referenciadas?: any[]
  informacoes_adicionais_contribuinte?: string
  informacoes_adicionais_fisco?: string
  
  // Dados do emitente
  emitente: {
    cnpj: string
    inscricao_estadual?: string
    nome: string
    nome_fantasia?: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    municipio: string
    uf: string
    cep: string
    telefone?: string
    email?: string
  }
  
  // Dados do destinatário
  destinatario: {
    cpf?: string
    cnpj?: string
    inscricao_estadual?: string
    nome: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    municipio: string
    uf: string
    cep: string
    telefone?: string
    email?: string
    indicador_inscricao_estadual: 'contribuinte' | 'isento' | 'nao_contribuinte'
  }
  
  // Itens da nota
  itens: Array<{
    numero_item: number
    codigo_produto: string
    descricao: string
    cfop: string
    unidade_comercial: string
    quantidade_comercial: number
    valor_unitario_comercial: number
    valor_bruto: number
    unidade_tributavel?: string
    quantidade_tributavel?: number
    valor_unitario_tributavel?: number
    origem: string
    ncm: string
    informacoes_adicionais?: string
    
    // Impostos
    icms: {
      situacao_tributaria: string
      aliquota?: number
      valor?: number
      base_calculo?: number
    }
    
    pis?: {
      situacao_tributaria: string
      aliquota?: number
      valor?: number
      base_calculo?: number
    }
    
    cofins?: {
      situacao_tributaria: string
      aliquota?: number
      valor?: number
      base_calculo?: number
    }
  }>
  
  // Totais
  totais: {
    base_calculo_icms?: number
    valor_icms?: number
    valor_icms_desonerado?: number
    base_calculo_icms_st?: number
    valor_icms_st?: number
    valor_produtos: number
    valor_frete?: number
    valor_seguro?: number
    valor_desconto?: number
    valor_outras_despesas?: number
    valor_ipi?: number
    valor_pis?: number
    valor_cofins?: number
    valor_aproximado_tributos?: number
    valor_total: number
  }
  
  // Transporte
  transporte?: {
    modalidade_frete: 'emitente' | 'destinatario' | 'terceiros' | 'proprio_remetente' | 'proprio_destinatario' | 'sem_frete'
    transportadora?: {
      cnpj?: string
      cpf?: string
      nome?: string
      inscricao_estadual?: string
      endereco?: string
      municipio?: string
      uf?: string
    }
    veiculo?: {
      placa?: string
      uf?: string
      rntc?: string
    }
    volume?: {
      quantidade?: number
      especie?: string
      marca?: string
      numeracao?: string
      peso_liquido?: number
      peso_bruto?: number
    }
  }
  
  // Pagamento
  pagamento?: {
    forma_pagamento: 'dinheiro' | 'cheque' | 'cartao_credito' | 'cartao_debito' | 'credito_loja' | 'vale_alimentacao' | 'vale_refeicao' | 'vale_presente' | 'vale_combustivel' | 'outros'
    valor_pagamento?: number
    tipo_integracao?: 'pag_integrado' | 'pag_nao_integrado'
    cnpj_credenciadora?: string
    bandeira_operadora?: string
    numero_autorizacao?: string
  }
}

export interface ENotasResponse {
  id: string
  numero: string
  serie: string
  chave_acesso: string
  data_emissao: string
  status: 'processando' | 'autorizada' | 'cancelada' | 'rejeitada' | 'denegada'
  motivo_status?: string
  protocolo_autorizacao?: string
  data_autorizacao?: string
  url_xml?: string
  url_danfe?: string
  qr_code?: string
  url_consulta_nf?: string
}

export interface ENotasError {
  codigo: string
  mensagem: string
  campo?: string
}

// Configuração padrão para SEFAZ-AM
const ENOTAS_CONFIG: ENotasConfig = {
  apiKey: process.env.NEXT_PUBLIC_ENOTAS_API_KEY || '',
  environment: (process.env.NEXT_PUBLIC_ENOTAS_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  baseUrl: process.env.NEXT_PUBLIC_ENOTAS_ENVIRONMENT === 'production' 
    ? 'https://api.enotas.com.br/v2'
    : 'https://api.sandbox.enotas.com.br/v2'
}

class ENotasService {
  private config: ENotasConfig
  
  constructor(config?: Partial<ENotasConfig>) {
    this.config = { ...ENOTAS_CONFIG, ...config }
  }
  
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Basic ${btoa(this.config.apiKey + ':')}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ mensagem: 'Erro desconhecido' }))
      throw new Error(errorData.mensagem || `Erro HTTP: ${response.status}`)
    }
    
    return response.json()
  }
  
  // Emitir NFe
  async emitirNFe(nfe: ENotasNFe): Promise<ENotasResponse> {
    try {
      const response = await this.makeRequest<ENotasResponse>('/nfe', {
        method: 'POST',
        body: JSON.stringify(nfe)
      })
      
      return response
    } catch (error) {
      console.error('Erro ao emitir NFe:', error)
      throw error
    }
  }
  
  // Consultar NFe
  async consultarNFe(id: string): Promise<ENotasResponse> {
    try {
      const response = await this.makeRequest<ENotasResponse>(`/nfe/${id}`)
      return response
    } catch (error) {
      console.error('Erro ao consultar NFe:', error)
      throw error
    }
  }
  
  // Cancelar NFe
  async cancelarNFe(id: string, motivo: string): Promise<ENotasResponse> {
    try {
      const response = await this.makeRequest<ENotasResponse>(`/nfe/${id}/cancelamento`, {
        method: 'POST',
        body: JSON.stringify({ motivo })
      })
      
      return response
    } catch (error) {
      console.error('Erro ao cancelar NFe:', error)
      throw error
    }
  }
  
  // Baixar XML
  async baixarXML(id: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.config.baseUrl}/nfe/${id}/xml`, {
        headers: {
          'Authorization': `Basic ${btoa(this.config.apiKey + ':')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao baixar XML: ${response.status}`)
      }
      
      return response.blob()
    } catch (error) {
      console.error('Erro ao baixar XML:', error)
      throw error
    }
  }
  
  // Baixar DANFE (PDF)
  async baixarDANFE(id: string): Promise<Blob> {
    try {
      const response = await fetch(`${this.config.baseUrl}/nfe/${id}/danfe`, {
        headers: {
          'Authorization': `Basic ${btoa(this.config.apiKey + ':')}`
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erro ao baixar DANFE: ${response.status}`)
      }
      
      return response.blob()
    } catch (error) {
      console.error('Erro ao baixar DANFE:', error)
      throw error
    }
  }
  
  // Converter NFe do sistema para formato e-Notas
  convertToENotas(nfe: any, emitente: any, destinatario: any, itens: any[]): ENotasNFe {
    return {
      natureza_operacao: 'Venda de mercadoria',
      data_emissao: new Date().toISOString().split('T')[0],
      tipo_documento: 'saida',
      finalidade_emissao: 'normal',
      consumidor_final: true,
      presenca_comprador: 'presencial',
      
      emitente: {
        cnpj: emitente.cnpj,
        inscricao_estadual: emitente.inscricao_estadual,
        nome: emitente.razao_social,
        nome_fantasia: emitente.nome_fantasia,
        logradouro: emitente.endereco,
        numero: emitente.numero,
        complemento: emitente.complemento,
        bairro: emitente.bairro,
        municipio: emitente.cidade,
        uf: emitente.uf,
        cep: emitente.cep,
        telefone: emitente.telefone,
        email: emitente.email
      },
      
      destinatario: {
        cpf: destinatario.cpf,
        cnpj: destinatario.cnpj,
        nome: destinatario.nome,
        logradouro: destinatario.endereco,
        numero: destinatario.numero,
        complemento: destinatario.complemento,
        bairro: destinatario.bairro,
        municipio: destinatario.cidade,
        uf: destinatario.uf,
        cep: destinatario.cep,
        telefone: destinatario.telefone,
        email: destinatario.email,
        indicador_inscricao_estadual: destinatario.cnpj ? 'contribuinte' : 'nao_contribuinte'
      },
      
      itens: itens.map((item, index) => ({
        numero_item: index + 1,
        codigo_produto: item.codigo,
        descricao: item.descricao,
        cfop: item.cfop || '5102',
        unidade_comercial: item.unidade || 'UN',
        quantidade_comercial: item.quantidade,
        valor_unitario_comercial: item.valor_unitario,
        valor_bruto: item.quantidade * item.valor_unitario,
        origem: '0',
        ncm: item.ncm || '00000000',
        
        icms: {
          situacao_tributaria: item.icms_situacao || '102',
          aliquota: item.icms_aliquota,
          valor: item.icms_valor,
          base_calculo: item.icms_base_calculo
        },
        
        pis: {
          situacao_tributaria: item.pis_situacao || '07',
          aliquota: item.pis_aliquota,
          valor: item.pis_valor,
          base_calculo: item.pis_base_calculo
        },
        
        cofins: {
          situacao_tributaria: item.cofins_situacao || '07',
          aliquota: item.cofins_aliquota,
          valor: item.cofins_valor,
          base_calculo: item.cofins_base_calculo
        }
      })),
      
      totais: {
        valor_produtos: itens.reduce((total, item) => total + (item.quantidade * item.valor_unitario), 0),
        valor_total: nfe.total_amount || itens.reduce((total, item) => total + (item.quantidade * item.valor_unitario), 0),
        valor_icms: nfe.tax_amount || 0,
        valor_pis: 0,
        valor_cofins: 0
      },
      
      transporte: {
        modalidade_frete: 'sem_frete'
      },
      
      pagamento: {
        forma_pagamento: 'dinheiro',
        valor_pagamento: nfe.total_amount
      }
    }
  }
}

// Instância singleton
export const enotasService = new ENotasService()

// Funções utilitárias
export const formatCNPJ = (cnpj: string): string => {
  return cnpj.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export const formatCPF = (cpf: string): string => {
  return cpf.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export const validateCNPJ = (cnpj: string): boolean => {
  const cleanCNPJ = cnpj.replace(/\D/g, '')
  return cleanCNPJ.length === 14
}

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '')
  return cleanCPF.length === 11
}

export default enotasService