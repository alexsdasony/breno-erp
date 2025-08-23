'use client';

import { StrictMode } from 'react';
import { AppDataProvider } from '@/hooks/useAppData';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StrictMode>
      <AppDataProvider>
        {children}
      </AppDataProvider>
    </StrictMode>
  );
}
