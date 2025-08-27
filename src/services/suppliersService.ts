import apiService from './api';
import type { ApiResponse } from './api';
import type { Supplier, SupplierPayload } from '@/types';

// Re-export Supplier type for backward compatibility
export type { Supplier };

// Interface estendida para compatibilidade com dados existentes
export interface SupplierExtended extends Supplier {
  city?: string;
  state?: string;
  tax_id?: string;
  status?: 'active' | 'inactive' | 'suspended';
  person_type?: 'pf' | 'pj';
  doc?: string;
  total_value?: number;
  orders_count?: number;
  last_order_date?: string;
}

/**
 * Obtém a lista de fornecedores
 * @param params Parâmetros de filtro e paginação
 * @returns Lista de fornecedores
 */
export async function getSuppliers(params: Record<string, any> = {}): Promise<ApiResponse<{ suppliers: SupplierExtended[] }>> {
  const response = await apiService.get<{ success: boolean; suppliers: SupplierExtended[] }>('/suppliers', params);
  return {
    data: {
      suppliers: response.suppliers || []
    },
    success: response.success || false
  } as ApiResponse<{ suppliers: SupplierExtended[] }>;
}

/**
 * Obtém um fornecedor pelo ID
 * @param id ID do fornecedor
 * @returns Dados do fornecedor
 */
export async function getSupplier(id: string): Promise<ApiResponse<{ supplier: SupplierExtended }>> {
  const response = await apiService.get<{ success: boolean; supplier: SupplierExtended }>(`/suppliers/${id}`);
  return {
    data: {
      supplier: response.supplier
    },
    success: response.success || false
  } as ApiResponse<{ supplier: SupplierExtended }>;
}

/**
 * Cria um novo fornecedor
 * @param supplierData Dados do fornecedor
 * @returns Fornecedor criado
 */
export async function createSupplier(supplierData: SupplierPayload): Promise<ApiResponse<{ supplier: SupplierExtended }>> {
  const response = await apiService.post<{ success: boolean; supplier: SupplierExtended }>('/suppliers', supplierData);
  return {
    data: {
      supplier: response.supplier
    },
    success: response.success || false
  } as ApiResponse<{ supplier: SupplierExtended }>;
}

/**
 * Atualiza um fornecedor existente
 * @param id ID do fornecedor
 * @param supplierData Dados do fornecedor
 * @returns Fornecedor atualizado
 */
export async function updateSupplier(id: string, supplierData: SupplierPayload): Promise<ApiResponse<{ supplier: SupplierExtended }>> {
  const response = await apiService.put<{ success: boolean; supplier: SupplierExtended }>(`/suppliers/${id}`, supplierData);
  return {
    data: {
      supplier: response.supplier
    },
    success: response.success || false
  } as ApiResponse<{ supplier: SupplierExtended }>;
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