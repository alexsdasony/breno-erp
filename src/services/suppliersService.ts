import apiService from './api';
import type { ApiResponse } from './api';
import type { Supplier, SupplierPayload } from '@/types';

/**
 * Obtém a lista de fornecedores
 * @param params Parâmetros de filtro e paginação
 * @returns Lista de fornecedores
 */
export async function getSuppliers(params: Record<string, any> = {}): Promise<ApiResponse<{ suppliers: Supplier[] }>> {
  const response = await apiService.get<{ success: boolean; suppliers: Supplier[] }>('/suppliers', params);
  return {
    data: {
      suppliers: response.suppliers || []
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