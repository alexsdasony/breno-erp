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
  const response = await apiService.post<{ success: boolean; customer: Customer }>('/customers', customerData);
  return {
    data: {
      customer: response.customer
    },
    success: response.success || false
  } as ApiResponse<{ customer: Customer }>;
}

export async function updateCustomer(id: string, customerData: CustomerPayload): Promise<ApiResponse<{ customer: Customer }>> {
  const response = await apiService.put<{ success: boolean; customer: Customer }>(`/customers/${id}`, customerData);
  return {
    data: {
      customer: response.customer
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