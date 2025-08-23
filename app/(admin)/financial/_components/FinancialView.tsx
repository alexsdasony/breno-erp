'use client';

import React from 'react';
import { useFinancialDocuments } from '../_hooks/useFinancialDocuments';
import { Button } from '@/components/ui/button';

export default function FinancialView() {
  const { items, loading, hasMore, loadMore } = useFinancialDocuments();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Financeiro</h1>

      <div className="border rounded-md divide-y bg-white/5 border-white/10">
        {items.map((d) => (
          <div key={d.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{d.type || 'Documento'} • {d.description || '-'}</div>
              <div className="text-sm text-gray-400">
                Data: {d.date || '-'} • Venc.: {d.due_date || '-'} • {d.partner_name || '-'}
              </div>
            </div>
            <div className="text-sm text-gray-300">R$ {Number(d.amount || 0).toFixed(2)}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-6 text-center text-gray-400">Nenhum documento encontrado.</div>
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
