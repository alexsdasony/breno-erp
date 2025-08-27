import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { Product, ProductPayload } from '@/types'

export async function listProducts(params: Record<string, any> = {}): Promise<ApiResponse<{ products: Product[] }>> {
  const response = await apiService.get<{ products: Product[] }>('/products', params);
  return response as ApiResponse<{ products: Product[] }>;
}

export async function createProduct(productData: ProductPayload): Promise<ApiResponse<{ product: Product }>> {
  const response = await apiService.post<{ product: Product }>('/products', productData);
  return response as ApiResponse<{ product: Product }>;
}

export async function updateProduct(id: string, productData: ProductPayload): Promise<ApiResponse<{ product: Product }>> {
  const response = await apiService.put<{ product: Product }>(`/products/${id}`, productData);
  return response as ApiResponse<{ product: Product }>;
}

export async function deleteProduct(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/products/${id}`);
  return response;
}

export async function getProductById(id: string): Promise<ApiResponse<{ product: Product }>> {
  const response = await apiService.get<{ product: Product }>(`/products/${id}`);
  return response as ApiResponse<{ product: Product }>;
}

export async function getLowStockProducts(params: Record<string, any> = {}): Promise<ApiResponse<{ products: Product[] }>> {
  const response = await apiService.get<{ products: Product[] }>('/products/low-stock', params);
  return response as ApiResponse<{ products: Product[] }>;
}
