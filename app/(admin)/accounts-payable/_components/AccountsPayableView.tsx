'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccountsPayable } from '../_hooks/useAccountsPayable';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Search, Filter, FileDown, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountsPayableView() {
  const { items, loading, hasMore, loadMore, create, update, remove } = useAccountsPayable();
  const { activeSegmentId } = useAppData();
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [periodType, setPeriodType] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  // Estados para modais
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<any>(null);
  
  // Estado para formulário
  const [formData, setFormData] = useState({
    supplier_id: '',
    description: '',
    amount: '',
    due_date: '',
    payment_date: '',
    status: 'pending',
    category: '',
    payment_method: 'boleto',
    notes: '',
    segment_id: activeSegmentId
  });
  
  // Funções auxiliares
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const resetForm = () => {
    setFormData({
      supplier_id: '',
      description: '',
      amount: '',
      due_date: '',
      payment_date: '',
      status: 'pending',
      category: '',
      payment_method: 'boleto',
      notes: '',
      segment_id: activeSegmentId
    });
    setCurrentAccount(null);
    setShowCreateModal(false);
    setShowEditModal(false);
  };
  
  // Função para atualizar status pendente para vencido se necessário
  function getStatusWithDueDate(account: any) {
    if ((account.status || '').toLowerCase() === 'pending') {
      const due = new Date(account.due_date);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (!isNaN(due.getTime()) && due < today) {
        return 'overdue';
      }
    }
    return account.status;
  }

  // Filtro de período
  function isWithinPeriod(account: any) {
    if (periodType === 'all') return true;
    
    const dueDate = new Date(account.due_date);
    const today = new Date();
    
    switch (periodType) {
      case 'today':
        return dueDate.toDateString() === today.toDateString();
      case 'week':
        const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dueDate >= today && dueDate <= weekFromNow;
      case 'month':
        const monthFromNow = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
        return dueDate >= today && dueDate <= monthFromNow;
      case 'custom':
        if (!customStart || !customEnd) return true;
        const start = new Date(customStart);
        const end = new Date(customEnd);
        return dueDate >= start && dueDate <= end;
      default:
        return true;
    }
  }

  // Filtrar itens baseado nos filtros
  const filteredItems = items
    .map(account => ({ ...account, status: getStatusWithDueDate(account) }))
    .filter(item => {
      // Filtro por termo de busca
      const searchMatch = !searchTerm || 
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por status
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      
      return searchMatch && statusMatch;
    })
    .filter(isWithinPeriod);

  // Consolidado de valores por status
  const totalPaid = filteredItems.filter(a => a.status === 'paid').reduce((sum, a) => sum + Number(a.amount || 0), 0);
  const totalOverdue = filteredItems.filter(a => a.status === 'overdue').reduce((sum, a) => sum + Number(a.amount || 0), 0);
  const totalPending = filteredItems.filter(a => a.status === 'pending').reduce((sum, a) => sum + Number(a.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold">Contas a Pagar</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas obrigações financeiras
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Nova
            </Button>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="glass-effect p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pago</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalPaid)}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vencido</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalOverdue)}
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="glass-effect p-6 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(totalPending)}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtros simples */}
        <div className="glass-effect rounded-lg p-4 border space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por descrição ou fornecedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-background border rounded-lg"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="paid">Pago</option>
                <option value="overdue">Vencido</option>
              </select>
              
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
                className="px-3 py-2 bg-background border rounded-lg"
              >
                <option value="all">Todos os Períodos</option>
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="month">Este Mês</option>
                <option value="custom">Período Personalizado</option>
              </select>
              
              {periodType === 'custom' && (
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="px-3 py-2 bg-background border rounded-lg"
                  />
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="px-3 py-2 bg-background border rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabela */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-effect rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Fornecedor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Descrição
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Categoria
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Valor
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Vencimento
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">
                        {item.supplier_name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="max-w-xs truncate" title={item.description}>
                          {item.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(item.due_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          getStatusColor(getStatusWithDueDate(item))
                        }`}>
                          {getStatusLabel(getStatusWithDueDate(item))}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setCurrentAccount(item);
                              setShowViewModal(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setCurrentAccount(item);
                              setFormData({
                                supplier_id: item.supplier_id || '',
                                description: item.description || '',
                                amount: item.amount?.toString() || '',
                                due_date: item.due_date || '',
                                payment_date: item.payment_date || '',
                                status: item.status || 'pending',
                                category: item.category || '',
                                payment_method: item.payment_method || 'boleto',
                                notes: item.notes || '',
                                segment_id: item.segment_id || activeSegmentId
                              });
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setCurrentAccount(item);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="w-12 h-12 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium mb-1">Nenhuma conta encontrada</h3>
                <p className="text-muted-foreground">Tente ajustar os filtros ou criar uma nova conta.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Paginação */}
        <div className="flex gap-2">
          <Button disabled={loading || !hasMore} onClick={() => void loadMore()}>
            {loading ? 'Carregando...' : hasMore ? 'Carregar mais' : 'Fim da lista'}
          </Button>
        </div>

        {/* Aqui seriam implementados os modais de criar, editar, visualizar e excluir */}
        {/* Eles seriam importados de componentes separados ou implementados aqui */}
        {/* Por enquanto, estamos apenas mantendo a estrutura visual */}
      </div>
    </div>
  );
}

// Funções auxiliares para formatação
function getStatusColor(status: string) {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'overdue': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'paid': return 'Pago';
    case 'pending': return 'Pendente';
    case 'overdue': return 'Atrasado';
    default: return status;
  }
}
