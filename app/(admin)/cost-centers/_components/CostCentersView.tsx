'use client';

import React from 'react';
import { useCostCenters } from '../_hooks/useCostCenters';
import { Button } from '@/components/ui/button';

export default function CostCentersView() {
  const { items, loading, hasMore, loadMore } = useCostCenters();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Centros de Custo</h1>

      <div className="border rounded-md divide-y bg-white/5 border-white/10">
        {items.map((cc) => (
          <div key={cc.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{cc.name}</div>
              <div className="text-sm text-gray-400">{cc.code || '-'} • {cc.description || '-'}</div>
            </div>
            <div className="text-sm text-gray-400">{cc.status || 'active'}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-6 text-center text-gray-400">Nenhum centro de custo encontrado.</div>
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
