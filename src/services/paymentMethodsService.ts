import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { PaymentMethod, PaymentMethodPayload } from '@/types'

export async function listPaymentMethods(params: Record<string, any> = {}): Promise<ApiResponse<{ payment_methods: PaymentMethod[] }>> {
  const response = await apiService.get<{ payment_methods: PaymentMethod[] }>('/payment-methods', params);
  return response as ApiResponse<{ payment_methods: PaymentMethod[] }>;
}

export async function createPaymentMethod(payload: PaymentMethodPayload): Promise<ApiResponse<{ payment_method: PaymentMethod }>> {
  const response = await apiService.post<{ payment_method: PaymentMethod }>('/payment-methods', payload);
  return response as ApiResponse<{ payment_method: PaymentMethod }>;
}

export async function updatePaymentMethod(id: string, payload: PaymentMethodPayload): Promise<ApiResponse<{ payment_method: PaymentMethod }>> {
  const response = await apiService.put<{ payment_method: PaymentMethod }>(`/payment-methods/${id}`, payload);
  return response as ApiResponse<{ payment_method: PaymentMethod }>;
}

export async function deletePaymentMethod(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<ApiResponse<void>>(`/payment-methods/${id}`);
  return response;
}

export default {
  listPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
}
