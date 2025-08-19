'use client';

import { Toaster } from '@/components/ui/toaster';
import { AppDataProvider } from '@/hooks/useAppData'

export function Providers({ children }) {
  return (
    <AppDataProvider>
      {children}
      <Toaster />
    </AppDataProvider>
  );
}
