// TODO: Futuro: migrar este layout para Server Component com verificação de sessão no servidor (sem flicker).

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppData } from '@/hooks/useAppData';
import ErpLayout from '@/components/layouts/ErpLayout';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { currentUser: user, authLoading } = useAppData();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4 mx-auto">
            <div className="w-8 h-8 text-white">🚀</div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Breno ERP</h2>
          <p className="text-gray-400">Carregando...</p>
          <div className="mt-4 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <ErpLayout>{children}</ErpLayout>;
}

