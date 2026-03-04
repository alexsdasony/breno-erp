import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { getDashboardMetrics, DashboardMetrics } from '@/services/dashboardService';
import { useAppData } from '@/hooks/useAppData';

interface State {
  metrics: DashboardMetrics | null;
  loading: boolean;
}

export type Period = 'current_month' | '7d' | '30d' | '90d' | '6mo' | '1yr' | 'last-year' | 'custom' | 'year-2021' | 'year-2022' | 'year-2023' | 'year-2024' | 'year-2025';

function computeRange(period: Period, customStart?: string, customEnd?: string): Record<string, string | undefined> {
  if (period === 'current_month') {
    return { tag: 'current_month' };
  }
  if (period === 'custom') {
    return { filterby: 'custom', from: customStart, to: customEnd };
  }
  if (period.startsWith('year-')) {
    const year = period.split('-')[1];
    return { filterby: 'year', tag: year };
  }
  if (period === '7d') return { filterby: 'day', tag: '7d' };
  if (period === '30d') return { filterby: 'day', tag: '30d' };
  if (period === '90d') return { filterby: 'day', tag: '90d' };
  if (period === '6mo') return { filterby: 'month', tag: '6mo' };
  if (period === '1yr') return { filterby: 'year', tag: '1yr' };
  if (period === 'last-year') return { filterby: 'year', tag: 'last-year' };
  return { tag: 'current_month' };
}

export function useDashboard() {
  const [state, setState] = useState<State>({ metrics: null, loading: false });
  const [period, setPeriod] = useState<Period>('current_month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const { activeSegmentId } = useAppData();
  const fetchingRef = useRef(false);

  const fetchMetrics = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setState((s) => ({ ...s, loading: true }));
    try {
      const params = { ...computeRange(period, customStart, customEnd), segment_id: activeSegmentId };
      const response = await getDashboardMetrics(params);
      const metrics = response.data?.metrics || {};
      setState({ metrics, loading: false });
    } catch (err) {
      setState({ metrics: null, loading: false });
      toast({ title: 'Falha ao carregar métricas', description: 'Tente novamente em instantes.', variant: 'destructive' });
    } finally {
      fetchingRef.current = false;
    }
  }, [period, customStart, customEnd, activeSegmentId]);

  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);

  const api = useMemo(() => ({
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
