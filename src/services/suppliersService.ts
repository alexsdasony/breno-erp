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
  const response = await apiService.get<{ suppliers: SupplierExtended[] }>('/suppliers', params);
  return response as ApiResponse<{ suppliers: SupplierExtended[] }>;
}

/**
 * Obtém um fornecedor pelo ID
 * @param id ID do fornecedor
 * @returns Dados do fornecedor
 */
export async function getSupplier(id: string): Promise<ApiResponse<{ supplier: SupplierExtended }>> {
  const response = await apiService.get<{ supplier: SupplierExtended }>(`/suppliers/${id}`);
  return response as ApiResponse<{ supplier: SupplierExtended }>;
}

/**
 * Cria um novo fornecedor
 * @param supplierData Dados do fornecedor
 * @returns Fornecedor criado
 */
export async function createSupplier(supplierData: SupplierPayload): Promise<ApiResponse<{ supplier: SupplierExtended }>> {
  const response = await apiService.post<{ supplier: SupplierExtended }>('/suppliers', supplierData);
  return response as ApiResponse<{ supplier: SupplierExtended }>;
}

/**
 * Atualiza um fornecedor existente
 * @param id ID do fornecedor
 * @param supplierData Dados do fornecedor
 * @returns Fornecedor atualizado
 */
export async function updateSupplier(id: string, supplierData: SupplierPayload): Promise<ApiResponse<{ supplier: SupplierExtended }>> {
  const response = await apiService.put<{ supplier: SupplierExtended }>(`/suppliers/${id}`, supplierData);
  return response as ApiResponse<{ supplier: SupplierExtended }>;
}

/**
 * Remove um fornecedor
 * @param id ID do fornecedor
 * @returns Resposta da API
 */
export async function deleteSupplier(id: string): Promise<ApiResponse<void>> {
  return await apiService.delete<ApiResponse<void>>(`/suppliers/${id}`);
}