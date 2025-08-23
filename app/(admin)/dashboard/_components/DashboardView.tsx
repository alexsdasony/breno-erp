'use client';

import React from 'react';
import { useDashboard } from '../_hooks/useDashboard';
import { Button } from '@/components/ui/button';

export default function DashboardView() {
  const { metrics, loading, reload } = useDashboard();

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button onClick={() => void reload()} disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      {!metrics && (
        <div className="p-6 text-center text-gray-400">Sem métricas disponíveis.</div>
      )}

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-gray-400">Vendas</div>
            <div className="text-2xl font-semibold">{metrics.total_sales ?? 0}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-gray-400">Receita</div>
            <div className="text-2xl font-semibold">R$ {(Number(metrics.total_revenue ?? 0)).toFixed(2)}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-gray-400">Clientes</div>
            <div className="text-2xl font-semibold">{metrics.total_customers ?? 0}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-gray-400">Estoque baixo</div>
            <div className="text-2xl font-semibold">{metrics.low_stock_count ?? 0}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-gray-400">Cobranças pendentes</div>
            <div className="text-2xl font-semibold">{metrics.pending_invoices ?? 0}</div>
          </div>
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-gray-400">A pagar pendentes</div>
            <div className="text-2xl font-semibold">{metrics.pending_payables ?? 0}</div>
          </div>
        </div>
      )}
    </div>
  );
}
