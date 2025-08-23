'use client';

import React, { useEffect, useState } from 'react';
import apiService from '@/services/api';
import { Button } from '@/components/ui/button';

interface ProfileData {
  id?: string;
  name?: string;
  email?: string;
  roles?: string[];
}

export default function ProfileView() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await apiService.getProfile();
        const profile = (res as any).profile || (res as any).data || res;
        setData(profile as ProfileData);
      } catch (_) {
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Perfil</h1>
        <Button onClick={() => window.location.reload()} disabled={loading}>
          {loading ? 'Atualizando...' : 'Recarregar'}
        </Button>
      </div>

      {!data && <div className="p-6 text-center text-gray-400">Nenhum dado de perfil.</div>}

      {data && (
        <div className="rounded-md border border-white/10 bg-white/5 p-4 space-y-2">
          <div><span className="text-gray-400">Nome:</span> {data.name || '-'}</div>
          <div><span className="text-gray-400">Email:</span> {data.email || '-'}</div>
          <div><span className="text-gray-400">Funções:</span> {(data.roles || []).join(', ') || '-'}</div>
        </div>
      )}
    </div>
  );
}
