"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { listPaymentMethods } from '@/services/paymentMethodsService';
import type { PaymentMethod } from '@/types';

export type PaymentMethodsContextValue = {
  paymentMethods: PaymentMethod[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const PaymentMethodsContext = createContext<PaymentMethodsContextValue | undefined>(undefined);

export function PaymentMethodsProvider({ children }: { children: React.ReactNode }) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      console.log('💳 Carregando métodos de pagamento...');
      const response = await listPaymentMethods({ page: 1, limit: 100 });
      console.log('💳 Resposta da API:', response);
      setPaymentMethods(response?.data?.payment_methods || []);
      console.log('💳 Métodos de pagamento definidos:', response?.data?.payment_methods || []);
    } catch (e) {
      console.error('💳 Erro ao carregar métodos de pagamento:', e);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <PaymentMethodsContext.Provider value={{ paymentMethods, loading, refresh: load }}>
      {children}
    </PaymentMethodsContext.Provider>
  );
}

export function usePaymentMethodsContext(): PaymentMethodsContextValue {
  const ctx = useContext(PaymentMethodsContext);
  if (!ctx) throw new Error('usePaymentMethodsContext must be used within PaymentMethodsProvider');
  return ctx;
}
