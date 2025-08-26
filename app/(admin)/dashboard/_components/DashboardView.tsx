'use client';

import React from 'react';
import { useDashboard } from '../_hooks/useDashboard';
import { Button } from '@/components/ui/button';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ShoppingCart, CircleDollarSign, Users, FileText, Wallet } from 'lucide-react';

export default function DashboardView() {
  const { metrics, loading, reload, setPeriod, period } = useDashboard();
  const data = metrics?.series_days || [];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button onClick={() => void reload()} disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400 mr-2">Período:</span>
        <Button variant={period === '7d' ? 'default' : 'secondary'} size="sm" onClick={() => setPeriod('7d')}>7d</Button>
        <Button variant={period === '30d' ? 'default' : 'secondary'} size="sm" onClick={() => setPeriod('30d')}>30d</Button>
        <Button variant={period === '90d' ? 'default' : 'secondary'} size="sm" onClick={() => setPeriod('90d')}>90d</Button>
      </div>

      {!metrics && !loading && (
        <div className="p-6 text-center text-gray-400">Sem métricas disponíveis.</div>
      )}

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card: Vendas */}
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Vendas</div>
                <div className="text-2xl font-semibold">{metrics.total_sales ?? 0}</div>
              </div>
              <div className="h-10 w-10 rounded-md bg-sky-500/20 flex items-center justify-center text-sky-400">
                <ShoppingCart size={18} />
              </div>
            </div>
            <div className="h-10 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="sales" stroke="#38bdf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Card: Receita */}
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Receita</div>
                <div className="text-2xl font-semibold">R$ {(Number(metrics.total_revenue ?? 0)).toFixed(2)}</div>
              </div>
              <div className="h-10 w-10 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400">
                <CircleDollarSign size={18} />
              </div>
            </div>
            <div className="h-10 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Card: Ticket médio */}
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Ticket médio</div>
                <div className="text-2xl font-semibold">R$ {(Number(metrics.avg_ticket ?? 0)).toFixed(2)}</div>
              </div>
              <div className="h-10 w-10 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <FileText size={18} />
              </div>
            </div>
            <div className="h-10 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Card: Clientes */}
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Clientes</div>
                <div className="text-2xl font-semibold">{metrics.total_customers ?? 0}</div>
              </div>
              <div className="h-10 w-10 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users size={18} />
              </div>
            </div>
            <div className="h-10 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="sales" stroke="#818cf8" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Card: Cobranças pendentes */}
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Cobranças pendentes</div>
                <div className="text-2xl font-semibold">{metrics.pending_invoices ?? 0}</div>
              </div>
              <div className="h-10 w-10 rounded-md bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400">
                <FileText size={18} />
              </div>
            </div>
            <div className="h-10 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="receivables" stroke="#e879f9" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* Card: A pagar pendentes */}
          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">A pagar pendentes</div>
                <div className="text-2xl font-semibold">{metrics.pending_payables ?? 0}</div>
              </div>
              <div className="h-10 w-10 rounded-md bg-rose-500/20 flex items-center justify-center text-rose-400">
                <Wallet size={18} />
              </div>
            </div>
            <div className="h-10 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <Line type="monotone" dataKey="payables" stroke="#fb7185" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Extra small charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-md border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Vendas diárias</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#e5e7eb' }} />
                <Line type="monotone" dataKey="sales" name="Vendas" stroke="#60a5fa" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-md border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Receita diária</h2>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#e5e7eb' }} />
                <Line type="monotone" dataKey="revenue" name="Receita" stroke="#f59e0b" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mixed charts: Bar (A pagar x A receber) and Pie (Distribuição pendências) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar chart */}
        <div className="rounded-md border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">A pagar x A receber (diário)</h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
                <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#e5e7eb' }} />
                <Legend />
                <Bar dataKey="payables" name="A pagar" fill="#ef4444" />
                <Bar dataKey="receivables" name="A receber" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="rounded-md border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Distribuição de pendências</h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#e5e7eb' }} />
                <Legend />
                <Pie
                  dataKey="value"
                  nameKey="name"
                  data={[
                    { name: 'Cobranças pendentes', value: Number(metrics?.pending_invoices || 0) },
                    { name: 'A pagar pendentes', value: Number(metrics?.pending_payables || 0) },
                  ]}
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  <Cell fill="#a78bfa" />
                  <Cell fill="#fb7185" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="rounded-md border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Tendência (vendas/receita)</h2>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff22" />
              <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', color: '#e5e7eb' }} />
              <Legend />
              <Line type="monotone" yAxisId="left" dataKey="sales" name="Vendas" stroke="#60a5fa" dot={false} />
              <Line type="monotone" yAxisId="right" dataKey="revenue" name="Receita" stroke="#f59e0b" dot={false} />
              {/* Optionally show payables/receivables if present */}
              {data?.some((d: any) => d?.payables != null) && (
                <Line type="monotone" yAxisId="left" dataKey="payables" name="A pagar" stroke="#ef4444" dot={false} />
              )}
              {data?.some((d: any) => d?.receivables != null) && (
                <Line type="monotone" yAxisId="left" dataKey="receivables" name="A receber" stroke="#10b981" dot={false} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
