'use client';

import { AppDataProvider } from '@/hooks/useAppData';
import { PaymentMethodsProvider } from '@/contexts/PaymentMethodsContext';
import { CustomersProvider } from '@/contexts/CustomersContext';
import { ProductsProvider } from '@/contexts/ProductsContext';
import { SuppliersProvider } from '@/contexts/SuppliersContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <PaymentMethodsProvider>
      <CustomersProvider>
        <ProductsProvider>
          <SuppliersProvider>
            <AppDataProvider>
              {children}
            </AppDataProvider>
          </SuppliersProvider>
        </ProductsProvider>
      </CustomersProvider>
    </PaymentMethodsProvider>
  );
}
