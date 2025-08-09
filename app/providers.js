'use client';

import { AppDataProvider } from '@/hooks/useAppData';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }) {
  return (
    <AppDataProvider>
      {children}
      <Toaster />
    </AppDataProvider>
  );
}
