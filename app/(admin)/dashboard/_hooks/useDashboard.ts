import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export interface DashboardMetrics {
  total_sales?: number;
  total_revenue?: number;
  avg_ticket?: number;
  total_customers?: number;
  low_stock_count?: number;
  pending_invoices?: number;
  pending_payables?: number;
  series_days?: Array<{
    date: string;
    sales?: number;
    revenue?: number;
    payables?: number;
    receivables?: number;
    cash_in?: number;
    cash_out?: number;
  }>;
  [key: string]: any;
}

interface State {
  metrics: DashboardMetrics | null;
  loading: boolean;
}

interface Api {
  reload: () => Promise<void>;
  setPeriod: (p: Period) => void;
  period: Period;
}

export type Period = '7d' | '30d' | '90d' | 'custom';

function computeRange(period: Period): { from?: string; to?: string } {
  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  let days = 7;
  if (period === '30d') days = 30;
  if (period === '90d') days = 90;
  const fromDate = new Date(today);
  fromDate.setDate(today.getDate() - (days - 1));
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
}

export function useDashboard() {
  const [state, setState] = useState<State>({ metrics: null, loading: false });
  const [period, setPeriod] = useState<Period>('7d');

  const fetchMetrics = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const { from, to } = computeRange(period);
      const res = await apiService.getDashboardMetrics({ from, to });
      const metrics = (res as any).metrics || (res as any).data || res || {};
      setState({ metrics, loading: false });
    } catch (err) {
      setState({ metrics: null, loading: false });
      toast({ title: 'Falha ao carregar métricas', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  }, [period]);

  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);

  const api: Api = useMemo(() => ({ reload: fetchMetrics, setPeriod, period }), [fetchMetrics, period]);

  return { ...state, ...api };
}
