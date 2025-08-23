'use client';

import React from 'react';
import { useChartOfAccounts } from '../_hooks/useChartOfAccounts';
import { Button } from '@/components/ui/button';

export default function ChartOfAccountsView() {
  const { items, loading, hasMore, loadMore } = useChartOfAccounts();

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-semibold">Plano de Contas</h1>

      <div className="border rounded-md divide-y bg-white/5 border-white/10">
        {items.map((acc) => (
          <div key={acc.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{acc.code || '-'} • {acc.name || 'Conta'}</div>
              <div className="text-sm text-gray-400">{acc.type || '-'} • {acc.description || '-'}</div>
            </div>
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
