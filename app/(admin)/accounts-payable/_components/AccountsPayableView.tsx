'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccountsPayable } from '../_hooks/useAccountsPayable';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Search, Filter, FileDown, Eye, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AccountsPayableView() {
  const { items, loading, hasMore, loadMore, create, update, remove, load } = useAccountsPayable();
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
    descricao: '',
    valor: '',
    data_vencimento: '',
    data_pagamento: '',
    status: 'pending',
    categoria_id: '',
    forma_pagamento: 'boleto',
    observacoes: '',
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
      descricao: '',
      valor: '',
      data_vencimento: '',
      data_pagamento: '',
      status: 'pending',
      categoria_id: '',
      forma_pagamento: 'boleto',
      observacoes: '',
      segment_id: activeSegmentId
    });
    setCurrentAccount(null);
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowViewModal(false);
    setShowDeleteConfirm(false);
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
        item.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.numero_nota_fiscal?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por status
      const statusMatch = filterStatus === 'all' || item.status === filterStatus;
      
      // Filtro por segmento
      const segmentMatch = !activeSegmentId || activeSegmentId === '0' ||
                          (item.segment_id && item.segment_id === activeSegmentId);
      
      return searchMatch && statusMatch && segmentMatch;
    })
    .filter(isWithinPeriod);

  // Consolidado de valores por status
  const totalPaid = filteredItems.filter(a => a.status === 'paid').reduce((sum, a) => sum + Number(a.valor || 0), 0);
  const totalOverdue = filteredItems.filter(a => a.status === 'overdue').reduce((sum, a) => sum + Number(a.valor || 0), 0);
  const totalPending = filteredItems.filter(a => a.status === 'pending').reduce((sum, a) => sum + Number(a.valor || 0), 0);

  // Funções CRUD
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await create(formData);
      if (result) {
        await load(true); // Recarregar a lista
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao criar conta a pagar:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAccount) return;
    
    try {
      const result = await update(currentAccount.id, formData);
      if (result) {
        await load(true); // Recarregar a lista
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao atualizar conta a pagar:', error);
    }
  };

  const handleDelete = async () => {
    if (!currentAccount) return;
    
    try {
      const success = await remove(currentAccount.id);
      if (success) {
        await load(true); // Recarregar a lista
        resetForm();
      }
    } catch (error) {
      console.error('Erro ao excluir conta a pagar:', error);
    }
  };

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
                        {item.supplier_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        <div className="max-w-xs truncate" title={item.descricao}>
                          {item.descricao}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {item.categoria_id || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        {formatCurrency(item.valor)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {formatDate(item.data_vencimento)}
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
                                descricao: item.descricao || '',
                                valor: item.valor?.toString() || '',
                                data_vencimento: item.data_vencimento || '',
                                data_pagamento: item.data_pagamento || '',
                                status: item.status || 'pending',
                                categoria_id: item.categoria_id || '',
                                forma_pagamento: item.forma_pagamento || 'boleto',
                                observacoes: item.observacoes || '',
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

        {/* Modal de Criar/Editar */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {showCreateModal ? 'Nova Conta a Pagar' : 'Editar Conta a Pagar'}
              </h3>
              <form onSubmit={showCreateModal ? handleCreate : handleUpdate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fornecedor</label>
                    <input
                      type="text"
                      name="supplier_id"
                      value={formData.supplier_id}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Valor</label>
                    <input
                      type="number"
                      step="0.01"
                      name="valor"
                      value={formData.valor}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="0,00"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Data de Vencimento</label>
                    <input
                      type="date"
                      name="data_vencimento"
                      value={formData.data_vencimento}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                      <option value="overdue">Vencido</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                    <select
                      name="forma_pagamento"
                      value={formData.forma_pagamento}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="boleto">Boleto</option>
                      <option value="pix">PIX</option>
                      <option value="transferencia">Transferência</option>
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartao">Cartão</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Data de Pagamento</label>
                    <input
                      type="date"
                      name="data_pagamento"
                      value={formData.data_pagamento}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Descrição</label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Descrição da conta a pagar"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Observações</label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    rows={2}
                    placeholder="Observações adicionais"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {showCreateModal ? 'Criar' : 'Atualizar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Visualização */}
        {showViewModal && currentAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <h3 className="text-lg font-semibold mb-4">Detalhes da Conta a Pagar</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Fornecedor</label>
                  <p className="text-sm">{currentAccount.supplier_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Descrição</label>
                  <p className="text-sm">{currentAccount.descricao || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Valor</label>
                  <p className="text-sm font-semibold">{formatCurrency(currentAccount.valor)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Data de Vencimento</label>
                  <p className="text-sm">{formatDate(currentAccount.data_vencimento)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    getStatusColor(getStatusWithDueDate(currentAccount))
                  }`}>
                    {getStatusLabel(getStatusWithDueDate(currentAccount))}
                  </span>
                </div>
                {currentAccount.observacoes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Observações</label>
                    <p className="text-sm">{currentAccount.observacoes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button variant="outline" onClick={resetForm}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  setFormData({
                    supplier_id: currentAccount.supplier_id || '',
                    descricao: currentAccount.descricao || '',
                    valor: currentAccount.valor?.toString() || '',
                    data_vencimento: currentAccount.data_vencimento || '',
                    data_pagamento: currentAccount.data_pagamento || '',
                    status: currentAccount.status || 'pending',
                    categoria_id: currentAccount.categoria_id || '',
                    forma_pagamento: currentAccount.forma_pagamento || 'boleto',
                    observacoes: currentAccount.observacoes || '',
                    segment_id: currentAccount.segment_id || activeSegmentId
                  });
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}>
                  Editar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {showDeleteConfirm && currentAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Confirmar Exclusão</h3>
              <p className="text-sm text-gray-600 mb-6">
                Tem certeza que deseja excluir a conta a pagar "{currentAccount.descricao}"?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        )}
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
