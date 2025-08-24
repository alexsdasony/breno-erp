'use client';

import { AppDataProvider } from '@/hooks/useAppData';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AppDataProvider>
      {children}
    </AppDataProvider>
  );
}
