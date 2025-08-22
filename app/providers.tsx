'use client';

import { StrictMode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { AppDataProvider } from '@/hooks/useAppData';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <StrictMode>
      <AppDataProvider>
        {children}
        <Toaster />
      </AppDataProvider>
    </StrictMode>
  );
}
