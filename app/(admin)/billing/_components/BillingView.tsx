'use client';

import React from 'react';
import { useBillings } from '../_hooks/useBillings';
import { Button } from '@/components/ui/button';

export default function BillingView() {
  const { items, loading, hasMore, loadMore } = useBillings();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Cobranças</h1>

      <div className="border rounded-md divide-y bg-white/5 border-white/10">
        {items.map((b) => (
          <div key={b.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">NF #{b.invoice_number || '-'} • {b.customer_name || 'Cliente'}</div>
              <div className="text-sm text-gray-400">
                Emissão: {b.issue_date || '-'} • Vencimento: {b.due_date || '-'}
              </div>
            </div>
            <div className="text-sm text-gray-300">R$ {Number(b.total_amount || b.amount || 0).toFixed(2)}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-6 text-center text-gray-400">Nenhuma cobrança encontrada.</div>
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
