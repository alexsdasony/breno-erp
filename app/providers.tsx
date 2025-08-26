'use client';

import { AppDataProvider } from '@/hooks/useAppData';
import { PaymentMethodsProvider } from '@/contexts/PaymentMethodsContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PaymentMethodsProvider>
      <AppDataProvider>
        {children}
      </AppDataProvider>
    </PaymentMethodsProvider>
  );
}
