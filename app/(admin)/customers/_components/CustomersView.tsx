'use client';

import React from 'react';
import { usePartners } from '../_hooks/usePartners';
import { Button } from '@/components/ui/button';

export default function CustomersView() {
  const { items, loading, hasMore, loadMore } = usePartners();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Clientes</h1>

      <div className="border rounded-md divide-y bg-white/5 border-white/10">
        {items.map((c) => (
          <div key={c.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.name}</div>
              <div className="text-sm text-gray-400">{c.email} • {c.phone}</div>
            </div>
            <div className="text-sm text-gray-400">{c.city} - {c.state}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-6 text-center text-gray-400">Nenhum cliente encontrado.</div>
        )}
      </div>

      <div className="flex gap-2">
        <Button disabled={loading || !hasMore} onClick={() => void loadMore()}>
          {loading ? 'Carregando...' : hasMore ? 'Carregar mais' : 'Fim da lista'}
        </Button>
      </div>
    </div>
  );
}
