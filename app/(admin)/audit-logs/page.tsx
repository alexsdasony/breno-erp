'use client';

import React from 'react';
import { useAuditLogs, AuditLog } from '@/hooks/useAuditLogs';
import { Button } from '@/components/ui/button';
import { RefreshCw, Search, Filter, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AuditLogsPage() {
  const { logs, loading, hasMore, total, loadMore, refresh, updateFilters, filters } = useAuditLogs();
  const [showFilters, setShowFilters] = React.useState(false);

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-green-600 bg-green-100';
      case 'UPDATE': return 'text-blue-600 bg-blue-100';
      case 'DELETE': return 'text-red-600 bg-red-100';
      case 'LOGIN': return 'text-purple-600 bg-purple-100';
      case 'LOGOUT': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTableName = (tableName: string) => {
    const tableNames: Record<string, string> = {
      'financial_documents': 'Documentos Financeiros',
      'sales': 'Vendas',
      'partners': 'Parceiros',
      'billings': 'Cobranças',
      'accounts_payable': 'Contas a Pagar',
      'products': 'Produtos',
      'users': 'Usuários'
    };
    return tableNames[tableName] || tableName;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Logs de Auditoria</h1>
          <p className="text-muted-foreground">
            Total: {total} registros
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button onClick={refresh} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <div>
            <label className="text-sm font-medium">Tabela</label>
            <select
              value={filters.table_name || ''}
              onChange={(e) => updateFilters({ ...filters, table_name: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="">Todas as tabelas</option>
              <option value="financial_documents">Documentos Financeiros</option>
              <option value="sales">Vendas</option>
              <option value="partners">Parceiros</option>
              <option value="billings">Cobranças</option>
              <option value="accounts_payable">Contas a Pagar</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Ação</label>
            <select
              value={filters.action || ''}
              onChange={(e) => updateFilters({ ...filters, action: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
            >
              <option value="">Todas as ações</option>
              <option value="CREATE">Criar</option>
              <option value="UPDATE">Atualizar</option>
              <option value="DELETE">Excluir</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Data Inicial</label>
            <input
              type="date"
              value={filters.start_date || ''}
              onChange={(e) => updateFilters({ ...filters, start_date: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Data Final</label>
            <input
              type="date"
              value={filters.end_date || ''}
              onChange={(e) => updateFilters({ ...filters, end_date: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-sm"
            />
          </div>
        </div>
      )}

      {/* Lista de Logs */}
      <div className="space-y-4">
        {logs.map((log: AuditLog) => (
          <div key={log.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
                <span className="text-sm font-medium">
                  {getTableName(log.table_name)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {log.user_email}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
              </span>
            </div>
            
            {log.old_values && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                <strong className="text-red-700">Valores Anteriores:</strong>
                <pre className="mt-1 text-red-600 text-xs overflow-x-auto">
                  {JSON.stringify(log.old_values, null, 2)}
                </pre>
              </div>
            )}
            
            {log.new_values && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm">
                <strong className="text-green-700">Valores Novos:</strong>
                <pre className="mt-1 text-green-600 text-xs overflow-x-auto">
                  {JSON.stringify(log.new_values, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={loadMore} disabled={loading} variant="outline">
            {loading ? 'Carregando...' : 'Carregar Mais'}
          </Button>
        </div>
      )}
    </div>
  );
}
