import apiService from './api';
import type { ApiResponse } from './api';
import type { Supplier, SupplierPayload } from '@/types';

/**
 * Obtém a lista de fornecedores
 * @param params Parâmetros de filtro e paginação
 * @returns Lista de fornecedores
 */
export async function getSuppliers(params: Record<string, any> = {}): Promise<ApiResponse<{ suppliers: Supplier[] }>> {
  const response = await apiService.get<{ success: boolean; suppliers: any[] }>('/suppliers', params);
  
  // Mapear os dados da API para o formato esperado pelo tipo Supplier
  const suppliers: Supplier[] = (response.suppliers || []).map((item: any) => ({
    id: item.id,
    razao_social: item.name || item.razao_social || '',
    nome_fantasia: item.nome_fantasia || null,
    ramo_atividade: item.ramo_atividade || null,
    tipo_contribuinte: item.tipo_pessoa === 'pf' ? 'PF' : item.tipo_pessoa === 'pj' ? 'PJ' : 'PJ',
    cpf_cnpj: item.tax_id || item.cpf_cnpj || item.cnpj || item.cpf || '',
    inscricao_estadual: item.inscricao_estadual || null,
    inscricao_municipal: item.inscricao_municipal || null,
    uf: item.state || item.uf || null,
    cidade: item.city || item.cidade || null,
    cep: item.zip_code || item.cep || null,
    endereco: item.address || item.endereco || null,
    numero: item.numero || null,
    complemento: item.complemento || null,
    bairro: item.bairro || null,
    pessoa_contato: item.pessoa_contato || null,
    telefone_fixo: item.telefone_fixo || null,
    telefone_celular: item.phone || item.telefone_celular || item.telefone || null,
    email: item.email || null,
    site: item.site || null,
    banco_nome: item.banco_nome || null,
    banco_codigo: item.banco_codigo || null,
    agencia_numero: item.agencia_numero || null,
    agencia_digito: item.agencia_digito || null,
    conta_numero: item.conta_numero || null,
    conta_digito: item.conta_digito || null,
    pix_chave: item.pix_chave || null,
    condicao_pagamento: item.condicao_pagamento || null,
    status: item.status === 'active' ? 'ATIVO' : 'INATIVO',
    data_cadastro: item.data_cadastro || item.created_at || new Date().toISOString().split('T')[0],
    observacoes: item.observacoes || item.notes || null,
    segment_id: item.segment_id || null,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    // Campos depreciados para compatibilidade
    name: item.name || item.razao_social || '',
    cnpj: item.cnpj || item.cpf_cnpj || null,
    cpf: item.cpf || item.cpf_cnpj || null,
    telefone: item.telefone || item.phone || null,
    address: item.address || item.endereco || null,
    state: item.state || item.uf || null,
    document: item.tax_id || item.cpf_cnpj || null,
    phone: item.phone || item.telefone_celular || null,
    contact_person: item.contact_person || item.pessoa_contato || null,
    payment_terms: item.payment_terms || item.condicao_pagamento || null,
    is_active: item.status === 'active'
  }));
  
  return {
    data: {
      suppliers
    },
    success: response.success || false
  } as ApiResponse<{ suppliers: Supplier[] }>;
}

/**
 * Obtém um fornecedor pelo ID
 * @param id ID do fornecedor
 * @returns Dados do fornecedor
 */
export async function getSupplier(id: string): Promise<ApiResponse<{ supplier: Supplier }>> {
  const response = await apiService.get<{ success: boolean; supplier: Supplier }>(`/suppliers/${id}`);
  return {
    data: {
      supplier: response.supplier
    },
    success: response.success || false
  } as ApiResponse<{ supplier: Supplier }>;
}

/**
 * Cria um novo fornecedor
 * @param supplierData Dados do fornecedor
 * @returns Fornecedor criado
 */
export async function createSupplier(supplierData: SupplierPayload): Promise<ApiResponse<{ supplier: Supplier }>> {
  const response = await apiService.post<{ success: boolean; suppliers: Supplier }>('/suppliers', supplierData);
  return {
    data: {
      supplier: response.suppliers
    },
    success: response.success || false
  } as ApiResponse<{ supplier: Supplier }>;
}

/**
 * Atualiza um fornecedor existente
 * @param id ID do fornecedor
 * @param supplierData Dados do fornecedor
 * @returns Fornecedor atualizado
 */
export async function updateSupplier(id: string, supplierData: SupplierPayload): Promise<ApiResponse<{ supplier: Supplier }>> {
  const response = await apiService.put<{ success: boolean; suppliers: Supplier }>(`/suppliers/${id}`, supplierData);
  return {
    data: {
      supplier: response.suppliers
    },
    success: response.success || false
  } as ApiResponse<{ supplier: Supplier }>;
}

/**
 * Remove um fornecedor
 * @param id ID do fornecedor
 * @returns Resposta da API
 */
export async function deleteSupplier(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/suppliers/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}