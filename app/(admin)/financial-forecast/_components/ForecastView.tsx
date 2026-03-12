'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppData } from '@/hooks/useAppData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, ArrowDownCircle, ArrowUpCircle, Percent, FileText, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type ForecastData = {
  forecast_revenue: number;
  realized_revenue: number;
  forecast_expense: number;
  realized_expense: number;
  percentage_revenue: number;
  percentage_expense: number;
  result_forecast: number;
  result_realized: number;
  period: { startDate: string; endDate: string; month: number; year: number };
  categories: {
    id: string;
    name: string;
    type: string;
    forecast: number;
    realized: number;
    difference: number;
    percentage: number;
  }[];
};

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default function ForecastView() {
  const { data: appData, segments, activeSegmentId } = useAppData();
  const costCenters = appData?.costCenters ?? [];
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [segmentId, setSegmentId] = useState<string>(activeSegmentId || '');
  const [centerCostId, setCenterCostId] = useState<string>('');
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [archiveDate, setArchiveDate] = useState(() => new Date().toISOString().slice(0, 10));
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        month: String(month),
        year: String(year),
      });
      if (segmentId && segmentId !== 'null' && segmentId !== '0') params.set('segment_id', segmentId);
      if (centerCostId) params.set('center_cost_id', centerCostId);
      const res = await fetch(`/api/financial-forecast?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Erro ao carregar previsão');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar previsão');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [month, year, segmentId, centerCostId]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  useEffect(() => {
    if (activeSegmentId !== undefined && activeSegmentId !== null && segmentId === '') {
      setSegmentId(activeSegmentId || '');
    }
  }, [activeSegmentId, segmentId]);

  const chartData = React.useMemo(() => {
    if (!data?.categories?.length) return [];
    return data.categories.map((c) => ({
      name: c.name.length > 15 ? c.name.slice(0, 15) + '…' : c.name,
      Previsto: c.forecast,
      Realizado: c.realized,
    }));
  }, [data?.categories]);

  const formatBrl = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v);

  const handlePrintReport = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Previsão Financeira</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Receitas e despesas previstas a partir das contas a pagar e a receber (sem digitação manual).
          </p>
        </div>
        <Button onClick={() => fetchForecast()} disabled={loading}>
          {loading ? 'Atualizando...' : 'Atualizar'}
        </Button>
        <Button
          variant="outline"
          onClick={() => setReportOpen(true)}
          disabled={!data || loading}
          className="gap-2"
        >
          <FileText size={18} />
          Gerar relatório para arquivamento
        </Button>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1">Mês</label>
            <select
              className="w-full bg-muted border rounded-lg p-2"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Ano</label>
            <select
              className="w-full bg-muted border rounded-lg p-2"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
            >
              {[now.getFullYear() + 1, now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Segmento</label>
            <select
              className="w-full bg-muted border rounded-lg p-2"
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
            >
              <option value="">Todos</option>
              {(segments || []).map((s: { id: string; name?: string }) => (
                <option key={s.id} value={s.id}>{s.name || s.id}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Centro de custo</label>
            <select
              className="w-full bg-muted border rounded-lg p-2"
              value={centerCostId}
              onChange={(e) => setCenterCostId(e.target.value)}
            >
              <option value="">Todos</option>
              {(costCenters || []).map((cc: { id: string; name?: string }) => (
                <option key={cc.id} value={cc.id}>{cc.name || cc.id}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        {/* @ts-expect-error Radix DialogContent accepts className and children */}
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto print:max-w-none print:max-h-none">
          <DialogHeader className="print:block">
            {/* @ts-expect-error Radix DialogTitle accepts string children */}
            <DialogTitle>Relatório de Previsão Financeira – Arquivamento físico</DialogTitle>
          </DialogHeader>
          <div ref={reportRef} className="space-y-4 print-report">
            <div className="flex flex-wrap gap-4 items-center border-b pb-3 print:flex print:gap-6">
              <div>
                <span className="text-sm text-muted-foreground">Período: </span>
                <span className="font-medium">{data ? `${MONTHS[(data.period?.month ?? 1) - 1]} / ${data.period?.year ?? ''}` : ''}</span>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Data para arquivamento físico: </label>
                <input
                  type="date"
                  value={archiveDate}
                  onChange={(e) => setArchiveDate(e.target.value)}
                  className="ml-2 bg-muted border rounded px-2 py-1 print:border-black print:bg-transparent"
                />
              </div>
            </div>
            {data && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm print:grid-cols-4">
                  <div><span className="text-muted-foreground">Receita Prevista:</span> {formatBrl(data.forecast_revenue)}</div>
                  <div><span className="text-muted-foreground">Receita Realizada:</span> {formatBrl(data.realized_revenue)}</div>
                  <div><span className="text-muted-foreground">% Receita:</span> {data.percentage_revenue}%</div>
                  <div><span className="text-muted-foreground">Despesa Prevista:</span> {formatBrl(data.forecast_expense)}</div>
                  <div><span className="text-muted-foreground">Despesa Realizada:</span> {formatBrl(data.realized_expense)}</div>
                  <div><span className="text-muted-foreground">% Despesa:</span> {data.percentage_expense}%</div>
                  <div><span className="text-muted-foreground">Resultado Previsto:</span> {formatBrl(data.result_forecast)}</div>
                  <div><span className="text-muted-foreground">Resultado Realizado:</span> {formatBrl(data.result_realized)}</div>
                </div>
                {data.categories?.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Categoria</th>
                          <th className="text-left p-2">Tipo</th>
                          <th className="text-right p-2">Previsto</th>
                          <th className="text-right p-2">Realizado</th>
                          <th className="text-right p-2">Diferença</th>
                          <th className="text-right p-2">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.categories.map((c) => (
                          <tr key={c.id || c.name} className="border-b">
                            <td className="p-2">{c.name}</td>
                            <td className="p-2">{c.type}</td>
                            <td className="p-2 text-right">{formatBrl(c.forecast)}</td>
                            <td className="p-2 text-right">{formatBrl(c.realized)}</td>
                            <td className="p-2 text-right">{formatBrl(c.difference)}</td>
                            <td className="p-2 text-right">{c.percentage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setReportOpen(false)}>Fechar</Button>
            <Button onClick={handlePrintReport} className="gap-2">
              <Printer size={18} />
              Imprimir / Salvar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style dangerouslySetInnerHTML={{
        __html: `@media print {
          body * { visibility: hidden; }
          .print-report, .print-report * { visibility: visible; }
          .print-report { position: absolute; left: 0; top: 0; width: 100%; background: white; color: #111; padding: 1rem; }
          .print-report .text-muted-foreground { color: #444; }
        }`
      }} />

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {loading && !data && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Receita Prevista</div>
                  <div className="text-xl font-semibold">{formatBrl(data.forecast_revenue)}</div>
                </div>
                <div className="h-10 w-10 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ArrowUpCircle size={20} />
                </div>
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Receita Realizada</div>
                  <div className="text-xl font-semibold">{formatBrl(data.realized_revenue)}</div>
                </div>
                <div className="h-10 w-10 rounded-md bg-sky-500/20 flex items-center justify-center text-sky-400">
                  <DollarSign size={20} />
                </div>
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">% Receita</div>
                  <div className="text-xl font-semibold">{data.percentage_revenue}%</div>
                </div>
                <div className="h-10 w-10 rounded-md bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Percent size={20} />
                </div>
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">Despesa Prevista</div>
                  <div className="text-xl font-semibold">{formatBrl(data.forecast_expense)}</div>
                </div>
                <div className="h-10 w-10 rounded-md bg-red-500/20 flex items-center justify-center text-red-400">
                  <ArrowDownCircle size={20} />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-gray-400">Despesa Realizada</div>
              <div className="text-xl font-semibold">{formatBrl(data.realized_expense)}</div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-gray-400">% Despesa</div>
              <div className="text-xl font-semibold">{data.percentage_expense}%</div>
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-gray-400">Resultado Previsto</div>
              <div className={`text-xl font-semibold ${data.result_forecast >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatBrl(data.result_forecast)}
              </div>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/5 p-4">
            <div className="text-sm text-gray-400 mb-1">Resultado Realizado</div>
            <div className={`text-2xl font-semibold ${data.result_realized >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatBrl(data.result_realized)}
            </div>
          </div>

          {data.categories?.length > 0 && (
            <>
              <h2 className="text-lg font-semibold">Detalhamento por categoria</h2>
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left p-3">Categoria</th>
                      <th className="text-left p-3">Tipo</th>
                      <th className="text-right p-3">Previsto</th>
                      <th className="text-right p-3">Realizado</th>
                      <th className="text-right p-3">Diferença</th>
                      <th className="text-right p-3">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.categories.map((c) => (
                      <tr key={c.id || c.name} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">{c.name}</td>
                        <td className="p-3">{c.type}</td>
                        <td className="p-3 text-right">{formatBrl(c.forecast)}</td>
                        <td className="p-3 text-right">{formatBrl(c.realized)}</td>
                        <td className={`p-3 text-right ${c.difference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatBrl(c.difference)}
                        </td>
                        <td className="p-3 text-right">{c.percentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="text-lg font-semibold mt-6">Previsto vs Realizado por categoria</h2>
              <div className="h-80 rounded-xl border border-white/10 bg-white/5 p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickFormatter={(v) => `R$ ${v}`} />
                    <Tooltip formatter={(v: number) => formatBrl(v)} />
                    <Legend />
                    <Bar dataKey="Previsto" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Realizado" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {data.categories?.length === 0 && (
            <p className="text-gray-400 py-6">Nenhuma categoria com previsão no período selecionado.</p>
          )}
        </>
      )}
    </div>
  );
}
