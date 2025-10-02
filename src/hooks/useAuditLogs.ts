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

  const fetchLogs = useCallback(async (page: number = 1, reset: boolean = false) => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '50',
        ...filters
      });

      const response = await apiService.get(`/audit-logs?${params}`);
      
      if (response.data?.success) {
        const newLogs = response.data.logs || [];
        const total = response.data.pagination?.total || 0;
        
        setState(prev => ({
          logs: reset ? newLogs : [...prev.logs, ...newLogs],
          loading: false,
          page,
          hasMore: newLogs.length === 50,
          total
        }));
      }
    } catch (error) {
      console.error('❌ Erro ao buscar logs de auditoria:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [filters]);

  const loadMore = useCallback(() => {
    if (!state.loading && state.hasMore) {
      fetchLogs(state.page + 1, false);
    }
  }, [state.loading, state.hasMore, state.page, fetchLogs]);

  const refresh = useCallback(() => {
    fetchLogs(1, true);
  }, [fetchLogs]);

  const updateFilters = useCallback((newFilters: AuditLogsFilters) => {
    setFilters(newFilters);
    fetchLogs(1, true);
  }, [fetchLogs]);

  // Carregar logs iniciais
  useEffect(() => {
    fetchLogs(1, true);
  }, [fetchLogs]);

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
