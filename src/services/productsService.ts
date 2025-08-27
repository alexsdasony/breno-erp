import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Product, ProductPayload } from '@/types'

export async function listProducts(params: Record<string, any> = {}): Promise<ApiResponse<{ products: Product[] }>> {
  const response = await apiService.get<{ success: boolean; products: Product[] }>('/products', params);
  return {
    data: {
      products: response.products || []
    },
    success: response.success || false
  } as ApiResponse<{ products: Product[] }>;
}

export async function createProduct(payload: ProductPayload): Promise<ApiResponse<{ product: Product }>> {
  const response = await apiService.post<{ success: boolean; products: Product }>('/products', payload);
  return {
    data: {
      product: response.products
    },
    success: response.success || false
  } as ApiResponse<{ product: Product }>;
}

export async function updateProduct(id: string, payload: ProductPayload): Promise<ApiResponse<{ product: Product }>> {
  const response = await apiService.put<{ success: boolean; products: Product }>(`/products/${id}`, payload);
  return {
    data: {
      product: response.products
    },
    success: response.success || false
  } as ApiResponse<{ product: Product }>;
}

export async function deleteProduct(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/products/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export async function getProductById(id: string): Promise<ApiResponse<{ product: Product }>> {
  const response = await apiService.get<{ success: boolean; products: Product }>(`/products/${id}`);
  return {
    data: {
      product: response.products
    },
    success: response.success || false
  } as ApiResponse<{ product: Product }>;
}

export async function getLowStockProducts(params: Record<string, any> = {}): Promise<ApiResponse<{ products: Product[] }>> {
  const response = await apiService.get<{ success: boolean; products: Product[] }>('/products/low-stock', params);
  return {
    data: {
      products: response.products || []
    },
    success: response.success || false
  } as ApiResponse<{ products: Product[] }>;
}
