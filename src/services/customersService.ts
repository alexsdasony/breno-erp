import apiService from '@/services/api';
import type { ApiResponse } from '@/services/api';
import type { Customer, CustomerPayload } from '@/types';

// Interface estendida para compatibilidade com dados existentes
export interface CustomerExtended extends Customer {
  city?: string;
  state?: string;
  cep?: string;
  cpf?: string;
  cnpj?: string;
  status?: string;
  segmentId?: string | null;
  tax_id?: string;
  taxId?: string;
  doc?: string;
  personType?: 'pf' | 'pj';
  person_type?: 'pf' | 'pj';
  roles?: string[];
  role?: string;
}

export interface CustomerDataPayload extends CustomerPayload {
  city?: string;
  state?: string;
  cep?: string;
  cpf?: string;
  cnpj?: string;
  status?: string;
  segmentId?: string | null;
  tax_id?: string;
  taxId?: string;
  doc?: string;
  personType?: 'pf' | 'pj';
  person_type?: 'pf' | 'pj';
  roles?: string[];
  role?: string;
}

export async function getCustomers(params: Record<string, any> = {}): Promise<ApiResponse<{ customers: CustomerExtended[] }>> {
  const response = await apiService.get<{ customers: CustomerExtended[] }>('/customers', params);
  return response as ApiResponse<{ customers: CustomerExtended[] }>;
}

export async function getCustomerById(id: string): Promise<ApiResponse<{ customer: CustomerExtended }>> {
  const response = await apiService.get<{ customer: CustomerExtended }>(`/customers/${id}`);
  return response as ApiResponse<{ customer: CustomerExtended }>;
}

export async function createCustomer(customerData: CustomerDataPayload): Promise<ApiResponse<{ customer: CustomerExtended }>> {
  const response = await apiService.post<{ customer: CustomerExtended }>('/customers', customerData);
  return response as ApiResponse<{ customer: CustomerExtended }>;
}

export async function updateCustomer(id: string, customerData: CustomerDataPayload): Promise<ApiResponse<{ customer: CustomerExtended }>> {
  const response = await apiService.put<{ customer: CustomerExtended }>(`/customers/${id}`, customerData);
  return response as ApiResponse<{ customer: CustomerExtended }>;
}

export async function deleteCustomer(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/customers/${id}`);
  return response;
}