import apiService from '@/services/api';
import type { ApiResponse } from '@/services/api';
import type { Customer, CustomerPayload } from '@/types';

export async function getCustomers(params: Record<string, any> = {}): Promise<ApiResponse<{ customers: Customer[] }>> {
  const response = await apiService.get<{ success: boolean; customers: Customer[] }>('/customers', params);
  return {
    data: {
      customers: response.customers || []
    },
    success: response.success || false
  } as ApiResponse<{ customers: Customer[] }>;
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
    const response = await apiService.post<{ success: boolean; customer: Customer; message?: string }>('/customers', customerData);
    return {
      data: {
        customer: response.customer
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
    segment_id: customerData.segment_id || null,
    tipo_pessoa: customerData.tipo_pessoa || 'pf'
  };
  
  const response = await apiService.put<{ success: boolean; customer: any }>(`/customers/${id}`, partnerData);
  
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