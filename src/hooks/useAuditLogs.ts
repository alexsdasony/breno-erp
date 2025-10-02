import { useState, useCallback, useEffect } from 'react';
import apiService from '@/services/api';

export interface AuditLog {
  id: string;
  user_id: string;
  user_email: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface AuditLogsState {
  logs: AuditLog[];
  loading: boolean;
  page: number;
  hasMore: boolean;
  total: number;
}

interface AuditLogsFilters {
  table_name?: string;
  action?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
}

export function useAuditLogs() {
  const [state, setState] = useState<AuditLogsState>({
    logs: [],
    loading: false,
    page: 1,
    hasMore: true,
    total: 0
  });

  const [filters, setFilters] = useState<AuditLogsFilters>({});
  const [initialLoad, setInitialLoad] = useState(false);

  const fetchLogs = useCallback(async (page: number = 1, reset: boolean = false) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '50',
        ...filters
      });

      // ✅ Timeout de segurança para evitar travamentos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos

      const response = await apiService.get(`/audit-logs?${params}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.data?.success) {
        const newLogs = response.data.logs || [];
        const total = response.data.pagination?.total || 0;
        
        // ✅ Fallback: se vier menos que pageSize, não há mais registros
        const hasMore = newLogs.length === 50; // Só tem mais se retornou exatamente 50
        
        
        setState(prev => ({
          logs: reset ? newLogs : [...prev.logs, ...newLogs],
          loading: false,
          page,
          hasMore,
          total
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao buscar logs de auditoria:', error);
      
      // ✅ Tratamento específico para timeout
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn('⏰ Timeout na busca de logs de auditoria');
      }
      
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchLogs(state.page + 1, false);
    }
  }, [state.loading, state.hasMore, state.page]);

  const refresh = useCallback(() => {
    fetchLogs(1, true);
  }, []);

  const updateFilters = useCallback((newFilters: AuditLogsFilters) => {
    // Só atualizar se os filtros realmente mudaram
    const filtersChanged = JSON.stringify(newFilters) !== JSON.stringify(filters);
    if (filtersChanged) {
      setFilters(newFilters);
      fetchLogs(1, true);
    }
  }, []);

  // Carregar logs iniciais apenas uma vez
  useEffect(() => {
    if (!initialLoad && !state.loading) {
      setInitialLoad(true);
      fetchLogs(1, true);
    }
  }, [initialLoad, state.loading, fetchLogs]);

  return {
    logs: state.logs,
    loading: state.loading,
    hasMore: state.hasMore,
    total: state.total,
    loadMore,
    refresh,
    updateFilters,
    filters
  };
}
