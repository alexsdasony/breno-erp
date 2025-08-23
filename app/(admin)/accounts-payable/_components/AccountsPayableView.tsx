'use client';

import React from 'react';
import { useAccountsPayable } from '../_hooks/useAccountsPayable';
import { Button } from '@/components/ui/button';

export default function AccountsPayableView() {
  const { items, loading, hasMore, loadMore } = useAccountsPayable();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Contas a Pagar</h1>

      <div className="border rounded-md divide-y bg-white/5 border-white/10">
        {items.map((a) => (
          <div key={a.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{a.description}</div>
              <div className="text-sm text-gray-400">
                Vencimento: {a.due_date || '-'} • Fornecedor: {a.supplier_name || '-'}
              </div>
            </div>
            <div className="text-sm text-gray-300">R$ {Number(a.amount || 0).toFixed(2)}</div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-6 text-center text-gray-400">Nenhuma conta encontrada.</div>
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
