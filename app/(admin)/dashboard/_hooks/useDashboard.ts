import { useCallback, useEffect, useMemo, useState } from 'react';
import apiService from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export interface DashboardMetrics {
  total_sales?: number;
  total_revenue?: number;
  total_customers?: number;
  low_stock_count?: number;
  pending_invoices?: number;
  pending_payables?: number;
  [key: string]: any;
}

interface State {
  metrics: DashboardMetrics | null;
  loading: boolean;
}

interface Api {
  reload: () => Promise<void>;
}

export function useDashboard() {
  const [state, setState] = useState<State>({ metrics: null, loading: false });

  const fetchMetrics = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const res = await apiService.getDashboardMetrics();
      const metrics = (res as any).metrics || (res as any).data || res || {};
      setState({ metrics, loading: false });
    } catch (err) {
      setState({ metrics: null, loading: false });
      toast({ title: 'Falha ao carregar métricas', description: 'Tente novamente em instantes.', variant: 'destructive' });
    }
  }, []);

  useEffect(() => {
    void fetchMetrics();
  }, [fetchMetrics]);

  const api: Api = useMemo(() => ({ reload: fetchMetrics }), [fetchMetrics]);

  return { ...state, ...api };
}
