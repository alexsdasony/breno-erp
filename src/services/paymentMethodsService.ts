import apiService from '@/services/api'
import type { ApiResponse } from '@/services/api'
import type { PaymentMethod, PaymentMethodPayload } from '@/types'

export async function listPaymentMethods(params: Record<string, any> = {}): Promise<ApiResponse<{ payment_methods: PaymentMethod[] }>> {
  const response = await apiService.get<{ success: boolean; paymentMethods: PaymentMethod[] }>('/payment-methods', params);
  return {
    success: response.success,
    data: { payment_methods: response.paymentMethods || [] }
  };
}

export async function createPaymentMethod(payload: PaymentMethodPayload): Promise<ApiResponse<{ payment_method: PaymentMethod }>> {
  const response = await apiService.post<{ success: boolean; payment_method: PaymentMethod }>('/payment-methods', payload);
  return {
    success: response.success,
    data: { payment_method: response.payment_method }
  };
}

export async function updatePaymentMethod(id: string, payload: PaymentMethodPayload): Promise<ApiResponse<{ payment_method: PaymentMethod }>> {
  const response = await apiService.put<{ success: boolean; payment_method: PaymentMethod }>(`/payment-methods/${id}`, payload);
  return {
    success: response.success,
    data: { payment_method: response.payment_method }
  };
}

export async function deletePaymentMethod(id: string): Promise<ApiResponse<void>> {
  const response = await apiService.delete<{ success: boolean; message?: string }>(`/payment-methods/${id}`);
  return {
    success: response.success,
    data: undefined
  };
}

export default {
  listPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod
}
