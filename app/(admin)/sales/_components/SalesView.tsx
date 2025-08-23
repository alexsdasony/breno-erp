'use client';

import React from 'react';
import { useSales } from '../_hooks/useSales';
import { Button } from '@/components/ui/button';

export default function SalesView() {
  const { items, loading, hasMore, loadMore } = useSales();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Vendas</h1>

      <div className="border rounded-md divide-y bg-white/5 border-white/10">
        {items.map((s) => (
          <div key={s.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{s.customer_name || 'Cliente'} • {s.status || 'status'}</div>
              <div className="text-sm text-gray-400">Data: {s.date || '-'} • Itens: {s.items?.length ?? 0}</div>
            </div>
            <div className="text-sm text-gray-300">R$ {Number(s.total_amount || 0).toFixed(2)}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-6 text-center text-gray-400">Nenhuma venda encontrada.</div>
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
