'use client';

import React from 'react';
import { useSuppliers } from '../_hooks/useSuppliers';
import { Button } from '@/components/ui/button';

export default function SuppliersView() {
  const { items, loading, hasMore, loadMore } = useSuppliers();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Fornecedores</h1>

      <div className="border rounded-md divide-y bg-white/5 border-white/10">
        {items.map((p) => (
          <div key={p.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-400">{p.email} • {p.phone}</div>
            </div>
            <div className="text-sm text-gray-400">{p.city} - {p.state}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-6 text-center text-gray-400">Nenhum fornecedor encontrado.</div>
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
