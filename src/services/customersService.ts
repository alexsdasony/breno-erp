import apiService from '@/services/api';
import { getSegmentByName } from './segmentsService';
import type { ApiResponse } from '@/services/api';
import type { Customer, CustomerPayload } from '@/types';

export async function getCustomers(params: Record<string, any> = {}): Promise<ApiResponse<{ customers: Customer[] }>> {
  const response = await apiService.get<{ success: boolean; customers: Customer[] }>('/customers', params);
  
  // Converter status de 'active'/'inactive' para 'ativo'/'inativo'
  const customers = (response.customers || []).map(customer => ({
    ...customer,
    status: (customer.status as any) === 'active' ? 'ativo' : (customer.status as any) === 'inactive' ? 'inativo' : customer.status
  }));
  
  return {
    data: {
      customers
    },
    success: response.success || false
  } as ApiResponse<{ customers: Customer[] }>;
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  try {
    const response = await getCustomers({ search: query });
    return response.data?.customers || [];
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return [];
  }
}

export async function getCustomerById(id: string): Promise<ApiResponse<{ customer: Customer }>> {
  const response = await apiService.get<{ success: boolean; customer: Customer }>(`/customers/${id}`);
  return {
    data: {
      customer: response.customer
    },
    success: response.success || false
  } as ApiResponse<{ customer: Customer }>;
}

export async function createCustomer(customerData: CustomerPayload): Promise<ApiResponse<{ customer: Customer }>> {
  try {
    // Buscar UUID do segmento se fornecido
    let segmentId = null;
    if (customerData.segment_id && customerData.segment_id !== 'outros') {
      try {
        const segmentResponse = await getSegmentByName(customerData.segment_id);
        if (segmentResponse.success && segmentResponse.data?.segment) {
          segmentId = segmentResponse.data.segment.id;
        }
      } catch (error) {
        console.warn('Erro ao buscar segmento:', error);
      }
    }

    // Mapear dados de Customer para Partner (formato esperado pela API)
    const partnerData = {
      name: customerData.name || 'Cliente',
      tax_id: customerData.tax_id || null,
      email: customerData.email || null,
      phone: customerData.phone || null,
      address: customerData.address || null,
      city: customerData.city || null,
      state: customerData.state || null,
      zip_code: customerData.zip_code || null,
      notes: customerData.notes || null,
      status: customerData.status === 'ativo' ? 'active' : 'inactive',
      segment_id: segmentId,
      tipo_pessoa: customerData.tipo_pessoa || 'pf'
    };

    const response = await apiService.post<{ success: boolean; customer: any; message?: string }>('/customers', partnerData);
    
    // Mapear dados de volta para Customer
    const customer: Customer = {
      id: response.customer.id,
      name: response.customer.name,
      tipo_pessoa: response.customer.tipo_pessoa,
      tax_id: response.customer.tax_id,
      email: response.customer.email,
      phone: response.customer.phone,
      address: response.customer.address,
      city: response.customer.city,
      state: response.customer.state,
      zip_code: response.customer.zip_code,
      notes: response.customer.notes,
      status: response.customer.status === 'active' ? 'ativo' : 'inativo',
      segment_id: response.customer.segment_id,
      created_at: response.customer.created_at,
      updated_at: response.customer.updated_at
    } as Customer;
    
    return {
      data: {
        customer
      },
      success: response.success || false,
      message: response.message
    } as ApiResponse<{ customer: Customer }>;
  } catch (error: any) {
    // Tratar erros detalhados do backend
    const errorData = error.data || {};
    const errorMessage = errorData.error || error.message || 'Erro ao criar cliente';
    const details = errorData.details || [];
    
    return {
      success: false,
      error: errorMessage,
      message: details.length > 0 ? details.join(', ') : errorMessage,
      status: error.status || 500,
      data: {
        details,
        field_count: errorData.field_count
      }
    } as any;
  }
}

export async function updateCustomer(id: string, customerData: CustomerPayload): Promise<ApiResponse<{ customer: Customer }>> {
  // Buscar UUID do segmento se fornecido
  let segmentId = null;
  if (customerData.segment_id && customerData.segment_id !== 'outros') {
    try {
      const segmentResponse = await getSegmentByName(customerData.segment_id);
      if (segmentResponse.success && segmentResponse.data?.segment) {
        segmentId = segmentResponse.data.segment.id;
      }
    } catch (error) {
      console.warn('Erro ao buscar segmento:', error);
    }
  }

  // Mapear dados de Customer para Partner (formato esperado pela API)
  const partnerData = {
    ...(customerData.name && { name: customerData.name }),
    ...(customerData.tax_id && { tax_id: customerData.tax_id }),
    ...(customerData.email && { email: customerData.email }),
    ...(customerData.phone && { phone: customerData.phone }),
    ...(customerData.address && { address: customerData.address }),
    ...(customerData.city && { city: customerData.city }),
    ...(customerData.state && { state: customerData.state }),
    ...(customerData.zip_code && { zip_code: customerData.zip_code }),
    ...(customerData.notes && { notes: customerData.notes }),
    status: customerData.status === 'ativo' ? 'active' : 'inactive',
    ...(segmentId && { segment_id: segmentId }),
    ...(customerData.tipo_pessoa && { tipo_pessoa: customerData.tipo_pessoa }),
    // Campos adicionais do formulário completo
    ...(customerData.rg && { rg: customerData.rg }),
    ...(customerData.data_nascimento && { data_nascimento: customerData.data_nascimento }),
    ...(customerData.estado_civil && { estado_civil: customerData.estado_civil }),
    ...(customerData.profissao && { profissao: customerData.profissao }),
    ...(customerData.empresa && { empresa: customerData.empresa }),
    ...(customerData.cargo && { cargo: customerData.cargo }),
    ...(customerData.data_admissao && { data_admissao: customerData.data_admissao }),
    ...(customerData.telefone_comercial && { telefone_comercial: customerData.telefone_comercial }),
    ...(customerData.celular && { celular: customerData.celular }),
    ...(customerData.numero && { numero: customerData.numero }),
    ...(customerData.complemento && { complemento: customerData.complemento }),
    ...(customerData.bairro && { bairro: customerData.bairro }),
    ...(customerData.tipo_imovel && { tipo_imovel: customerData.tipo_imovel }),
    ...(customerData.possui_patrimonio !== undefined && { possui_patrimonio: customerData.possui_patrimonio }),
    ...(customerData.valor_patrimonio && { valor_patrimonio: customerData.valor_patrimonio }),
    ...(customerData.descricao_patrimonio && { descricao_patrimonio: customerData.descricao_patrimonio }),
    ...(customerData.data_cadastro && { data_cadastro: customerData.data_cadastro }),
    ...(customerData.responsavel_cadastro && { responsavel_cadastro: customerData.responsavel_cadastro }),
    ...(customerData.observacoes && { observacoes: customerData.observacoes })
  };
  
  console.log('🔍 [SERVICE] Dados sendo enviados para API:', partnerData);
  console.log('🔍 [SERVICE] estado_civil sendo enviado:', customerData.estado_civil);
  
  const response = await apiService.put<{ success: boolean; customer: any }>(`/customers/${id}`, partnerData);
  
  // Verificar se a resposta tem a estrutura esperada
  if (!response || !response.customer) {
    console.error('❌ Resposta inválida:', response);
    throw new Error('Resposta inválida da API');
  }
  
  // Mapear dados de volta para Customer
  const customer: Customer = {
    id: response.customer.id,
    name: response.customer.name,
    tipo_pessoa: response.customer.tipo_pessoa,
    tax_id: response.customer.tax_id,
    email: response.customer.email,
    phone: response.customer.phone,
    address: response.customer.address,
    city: response.customer.city,
    state: response.customer.state,
    zip_code: response.customer.zip_code,
    notes: response.customer.notes,
    status: response.customer.status === 'active' ? 'ativo' : 'inativo',
    segment_id: response.customer.segment_id,
    created_at: response.customer.created_at,
    updated_at: response.customer.updated_at
  } as Customer;
  
  return {
    data: {
      customer
    },
    success: response.success || false
  } as ApiResponse<{ customer: Customer }>;
}

export async function deleteCustomer(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/customers/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}