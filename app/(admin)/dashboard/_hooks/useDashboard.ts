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
  setCustomStart: (date: string) => void;
  setCustomEnd: (date: string) => void;
  customStart: string;
  customEnd: string;
}

export type Period = '7d' | '30d' | '90d' | '6mo' | '1yr' | 'last-year' | 'custom' | 'year-2021' | 'year-2022' | 'year-2023' | 'year-2024' | 'year-2025';

function computeRange(period: Period, customStart?: string, customEnd?: string): { period?: string; from?: string; to?: string; filterby?: string; tag?: string } {
  // Período personalizado
  if (period === 'custom') {
    return { filterby: 'custom', from: customStart, to: customEnd };
  }
  
  // Filtro por ano específico
  if (period.startsWith('year-')) {
    const year = period.split('-')[1];
    return { filterby: 'year', tag: year };
  }
  
  // Períodos predefinidos com formato compatível com o backend
  if (period === '7d') {
    return { filterby: 'day', tag: '7d' };
  }
  
  if (period === '30d') {
    return { filterby: 'day', tag: '30d' };
  }
  
  if (period === '90d') {
    return { filterby: 'day', tag: '90d' };
  }
  
  if (period === '6mo') {
    return { filterby: 'month', tag: '6mo' };
  }
  
  if (period === '1yr') {
    return { filterby: 'year', tag: '1yr' };
  }
  
  if (period === 'last-year') {
    return { filterby: 'year', tag: 'last-year' };
  }
  
  // Fallback para compatibilidade com código existente
  return { period };
}

export function useDashboard() {
  const [state, setState] = useState<State>({ metrics: null, loading: false });
  const [period, setPeriod] = useState<Period>('7d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const fetchMetrics = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const params = computeRange(period, customStart, customEnd);
      const res = await apiService.getDashboardMetrics(params);
      const metrics = (res as any).metrics || (res as any).data || res || {};
      setState({ metrics, loading: false });
    } catch (err) {
      setState({ metrics: null, loading: false });
      toast({ title: 'Falha ao carregar métricas', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  }, [period, customStart, customEnd]);

  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);

  const api: Api = useMemo(() => ({ 
    reload: fetchMetrics, 
    setPeriod, 
    period, 
    setCustomStart, 
    setCustomEnd, 
    customStart, 
    customEnd 
  }), [fetchMetrics, period, customStart, customEnd]);

  return { ...state, ...api };
}
