import apiService from '@/services/api'
import type { PaymentMethod, PaymentMethodPayload } from '@/types'

export async function listPaymentMethods(params: Record<string, any> = {}): Promise<PaymentMethod[]> {
  const res: any = await apiService.getPaymentMethods(params)
  return (res.payment_methods || res.data || []) as PaymentMethod[]
}

export async function createPaymentMethod(payload: PaymentMethodPayload): Promise<PaymentMethod> {
  const res: any = await apiService.createPaymentMethod(payload)
  return (res.payment_method || res) as PaymentMethod
}

export async function updatePaymentMethod(id: string, payload: PaymentMethodPayload): Promise<PaymentMethod> {
  const res: any = await apiService.updatePaymentMethod(id, payload)
  return (res.payment_method || res) as PaymentMethod
}

export async function deletePaymentMethod(id: string): Promise<void> {
  await apiService.deletePaymentMethod(id)
}
