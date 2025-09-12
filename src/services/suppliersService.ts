import apiService from '@/services/api'
import { getSegmentByName } from './segmentsService'
import type { ApiResponse } from '@/services/api'
import type { Supplier, SupplierPayload } from '@/types'

export async function listSuppliers(params: Record<string, any> = {}): Promise<ApiResponse<{ suppliers: Supplier[] }>> {
  const response = await apiService.get<{ success: boolean; suppliers: any[] }>('/suppliers', params)
  
  // Mapear dados de Partner para Supplier
  const suppliers: Supplier[] = (response.suppliers || []).map(partner => ({
    id: partner.id,
    razao_social: partner.name,
    nome_fantasia: partner.name,
    ramo_atividade: partner.profissao, // Mapear profissao para ramo_atividade
    tipo_contribuinte: partner.tipo_pessoa === 'fisica' ? 'PF' : 'PJ',
    cpf_cnpj: partner.tax_id,
    email: partner.email,
    telefone_celular: partner.phone,
    cidade: partner.city,
    uf: partner.state,
    endereco: partner.address,
    numero: partner.numero,
    complemento: partner.complemento,
    bairro: partner.bairro,
    cep: partner.zip_code,
    observacoes: partner.notes,
    status: partner.status === 'active' ? 'ativo' : 'inativo',
    segment_id: partner.segment_id,
    created_at: partner.created_at,
    updated_at: partner.updated_at
  } as Supplier));
  
  return {
    data: {
      suppliers
    },
    success: response.success || false
  } as ApiResponse<{ suppliers: Supplier[] }>
}

export async function createSupplier(payload: SupplierPayload): Promise<ApiResponse<{ supplier: Supplier }>> {
  // Buscar UUID do segmento se fornecido
  let segmentId = null;
  if (payload.segment_id && payload.segment_id !== 'outros') {
    try {
      const segmentResponse = await getSegmentByName(payload.segment_id);
      if (segmentResponse.success && segmentResponse.data?.segment) {
        segmentId = segmentResponse.data.segment.id;
      }
    } catch (error) {
      console.warn('Erro ao buscar segmento:', error);
    }
  }

  // Mapear dados de Supplier para Partner (formato esperado pela API)
  const partnerData = {
    name: payload.razao_social || payload.nome_fantasia || 'Fornecedor',
    tax_id: payload.cpf_cnpj || null,
    email: payload.email || null,
    phone: payload.telefone_celular || null,
    address: payload.endereco || null,
    city: payload.cidade || null,
    state: payload.uf || null,
    zip_code: payload.cep || null,
    numero: payload.numero || null,
    complemento: payload.complemento || null,
    bairro: payload.bairro || null,
    profissao: payload.ramo_atividade || null, // Mapear ramo_atividade para profissao
    notes: payload.observacoes || null,
    status: payload.status === 'ativo' ? 'active' : 'inactive',
    segment_id: segmentId,
    tipo_pessoa: payload.tipo_contribuinte === 'PF' ? 'fisica' : 'juridica'
  };
  
  console.log('🚀 Enviando dados para API /suppliers:', JSON.stringify(partnerData, null, 2));
  const response = await apiService.post<{ success: boolean; supplier: any }>('/suppliers', partnerData)
  console.log('📥 Resposta da API:', JSON.stringify(response, null, 2));
  
  // Mapear dados de volta para Supplier
  const supplier: Supplier = {
    id: response.supplier.id,
    razao_social: response.supplier.name,
    nome_fantasia: response.supplier.name,
    ramo_atividade: response.supplier.profissao, // Mapear profissao para ramo_atividade
    tipo_contribuinte: response.supplier.tipo_pessoa === 'fisica' ? 'PF' : 'PJ',
    cpf_cnpj: response.supplier.tax_id,
    email: response.supplier.email,
    telefone_celular: response.supplier.phone,
    cidade: response.supplier.city,
    uf: response.supplier.state,
    endereco: response.supplier.address,
    numero: response.supplier.numero,
    complemento: response.supplier.complemento,
    bairro: response.supplier.bairro,
    cep: response.supplier.zip_code,
    observacoes: response.supplier.notes,
    status: response.supplier.status === 'active' ? 'ativo' : 'inativo',
    segment_id: response.supplier.segment_id,
    created_at: response.supplier.created_at,
    updated_at: response.supplier.updated_at
  } as Supplier;
  
  return {
    data: {
      supplier
    },
    success: response.success || false
  } as ApiResponse<{ supplier: Supplier }>
}

export async function updateSupplier(id: string, payload: SupplierPayload): Promise<ApiResponse<{ supplier: Supplier }>> {
  // Buscar UUID do segmento se fornecido
  let segmentId = null;
  if (payload.segment_id && payload.segment_id !== 'outros') {
    try {
      const segmentResponse = await getSegmentByName(payload.segment_id);
      if (segmentResponse.success && segmentResponse.data?.segment) {
        segmentId = segmentResponse.data.segment.id;
      }
    } catch (error) {
      console.warn('Erro ao buscar segmento:', error);
    }
  }

  // Mapear dados de Supplier para Partner (formato esperado pela API)
  const partnerData = {
    name: payload.razao_social || payload.nome_fantasia || 'Fornecedor',
    tax_id: payload.cpf_cnpj || null,
    email: payload.email || null,
    phone: payload.telefone_celular || null,
    address: payload.endereco || null,
    city: payload.cidade || null,
    state: payload.uf || null,
    zip_code: payload.cep || null,
    numero: payload.numero || null,
    complemento: payload.complemento || null,
    bairro: payload.bairro || null,
    profissao: payload.ramo_atividade || null, // Mapear ramo_atividade para profissao
    notes: payload.observacoes || null,
    status: payload.status === 'ativo' ? 'active' : 'inactive',
    segment_id: segmentId,
    tipo_pessoa: payload.tipo_contribuinte === 'PF' ? 'fisica' : 'juridica'
  };
  
  const response = await apiService.put<{ success: boolean; supplier: any }>(`/suppliers/${id}`, partnerData)
  
  // Mapear dados de volta para Supplier
  const supplier: Supplier = {
    id: response.supplier.id,
    razao_social: response.supplier.name,
    nome_fantasia: response.supplier.name,
    ramo_atividade: response.supplier.profissao, // Mapear profissao para ramo_atividade
    tipo_contribuinte: response.supplier.tipo_pessoa === 'fisica' ? 'PF' : 'PJ',
    cpf_cnpj: response.supplier.tax_id,
    email: response.supplier.email,
    telefone_celular: response.supplier.phone,
    cidade: response.supplier.city,
    uf: response.supplier.state,
    endereco: response.supplier.address,
    numero: response.supplier.numero,
    complemento: response.supplier.complemento,
    bairro: response.supplier.bairro,
    cep: response.supplier.zip_code,
    observacoes: response.supplier.notes,
    status: response.supplier.status === 'active' ? 'ativo' : 'inativo',
    segment_id: response.supplier.segment_id,
    created_at: response.supplier.created_at,
    updated_at: response.supplier.updated_at
  } as Supplier;
  
  return {
    data: {
      supplier
    },
    success: response.success || false
  } as ApiResponse<{ supplier: Supplier }>
}

export async function deleteSupplier(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/suppliers/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getSupplierById(id: string): Promise<ApiResponse<{ supplier: Supplier }>> {
  const response = await apiService.get<{ success: boolean; supplier: Supplier }>(`/suppliers/${id}`)
  return {
    data: {
      supplier: response.supplier
    },
    success: response.success || false
  } as ApiResponse<{ supplier: Supplier }>
}