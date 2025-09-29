'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useBillings } from '../_hooks/useBillings';
import { Plus, Filter, FileDown, Edit, Trash2, Eye, Search, AlertTriangle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import CustomerAutocomplete from './CustomerAutocomplete';

export default function BillingView() {
  const { items, loading, hasMore, loadMore } = useBillings();
  const { activeSegmentId } = useAppData();

  // Estados para filtros e formulário
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [showForm, setShowForm] = React.useState(false);
  const [editingBilling, setEditingBilling] = React.useState<any | null>(null);
  const [formData, setFormData] = React.useState({
    customer_id: '',
    customer_name: '',
    amount: '',
    dueDate: '',
    status: 'Pendente',
    description: ''
  });

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paga': return 'text-green-400';
      case 'vencida': return 'text-red-400';
      case 'pendente': return 'text-yellow-400';
      case 'cancelada': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'paga': return <CheckCircle className="w-4 h-4 mr-2" />;
      case 'vencida': return <AlertTriangle className="w-4 h-4 mr-2" />;
      case 'pendente': return <Clock className="w-4 h-4 mr-2" />;
      default: return <Clock className="w-4 h-4 mr-2" />;
    }
  };

  // Função para verificar se está vencida
  const isOverdue = (dueDate: string, status: string) => {
    if (status?.toLowerCase() === 'paga') return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  };

  // Função para obter status considerando vencimento
  const getStatusWithDueDate = (billing: any) => {
    const status = billing.status?.toLowerCase() || 'pendente';
    if (status === 'pendente') {
      const dueDate = new Date(billing.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        return 'Vencida';
      }
    }
    return billing.status || 'Pendente';
  };

  // Aplicar status atualizado aos itens
  const itemsWithStatus = items.map(item => ({
    ...item,
    status: getStatusWithDueDate(item)
  }));

  // Filtros
  const filteredItems = itemsWithStatus.filter(billing => {
    const matchesSearch = !searchTerm || 
        (billing.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (billing.status || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        billing.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || billing.status?.toLowerCase() === filterStatus.toLowerCase();
    const matchesSegment = !activeSegmentId || activeSegmentId === '0' ||
                          (billing.segment_id && billing.segment_id === activeSegmentId);
    return matchesSearch && matchesStatus && matchesSegment;
  });

  // Cálculos dos KPIs baseados nos itens filtrados por segmento
  const totalBillings = filteredItems.length;
  const overdueBillings = filteredItems.filter(b => b.status?.toLowerCase() === 'vencida').length;
  const defaultRate = totalBillings > 0 ? (overdueBillings / totalBillings) * 100 : 0;
  const totalPendingAmount = filteredItems
    .filter(b => ['pendente', 'vencida'].includes(b.status?.toLowerCase() || ''))
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatação de data
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Handlers
  const handleEdit = (billing: any) => {
    setEditingBilling(billing);
    setFormData({
      customer_id: billing.customer_id || '',
      customer_name: billing.customer_name || '',
      amount: billing.amount || '',
      dueDate: billing.due_date || '',
      status: billing.status || 'Pendente',
      description: billing.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (billingId: string | undefined) => {
     if (billingId && window.confirm('Tem certeza que deseja excluir esta cobrança?')) {
       try {
         const success = await remove(billingId);
         if (success) {
           setShowForm(false);
           setEditingBilling(null);
         }
       } catch (error) {
         console.error('Erro ao excluir cobrança:', error);
       }
     }
   };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBilling(null);
    setFormData({
      customer_id: '',
      customer_name: '',
      amount: '',
      dueDate: '',
      status: 'Pendente',
      description: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customer_id) {
      alert('Por favor, selecione um cliente');
      return;
    }
    
    try {
      const billingData = {
        customer_id: formData.customer_id,
        customer_name: formData.customer_name,
        amount: parseFloat(formData.amount),
        due_date: formData.dueDate,
        status: formData.status,
        description: formData.description
      };
      
      if (editingBilling) {
        // Atualizar cobrança existente
        const updatedBilling = await update(editingBilling.id, billingData);
        if (updatedBilling) {
          console.log('Cobrança atualizada:', updatedBilling);
        }
      } else {
        // Criar nova cobrança
        const newBilling = await create(billingData);
        if (newBilling) {
          console.log('Cobrança criada:', newBilling);
        }
      }
      
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar cobrança:', error);
      alert('Erro ao salvar cobrança');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold">Gestão de Cobranças</h1>
          <p className="text-muted-foreground mt-1">Acompanhe suas cobranças e inadimplência</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />Filtros
          </Button>
          <Button variant="outline" disabled>
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />Nova Cobrança
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-lg p-4 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Índice de Inadimplência</div>
              <div className={`text-xl font-semibold ${defaultRate > 10 ? 'text-red-400' : 'text-green-400'}`}>
                {defaultRate.toFixed(2)}%
              </div>
            </div>
            <AlertTriangle className={`w-8 h-8 ${defaultRate > 10 ? 'text-red-400' : 'text-green-400'}`} />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect rounded-lg p-4 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Cobranças Vencidas</div>
              <div className="text-xl font-semibold text-red-400">{overdueBillings}</div>
            </div>
            <Clock className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-lg p-4 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total a Receber</div>
              <div className="text-xl font-semibold text-yellow-400">{formatCurrency(totalPendingAmount)}</div>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      {/* Formulário */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-lg p-6 border"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingBilling ? 'Editar Cobrança' : 'Nova Cobrança'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cliente</label>
                <CustomerAutocomplete
                  value={formData.customer_id}
                  onChange={(customerId, customerName) => setFormData({...formData, customer_id: customerId, customer_name: customerName})}
                  placeholder="Digite o nome do cliente..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="0,00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data de Vencimento</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Paga">Paga</option>
                  <option value="Vencida">Vencida</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Descrição da cobrança"
                />
              </div>
              <div className="md:col-span-2 flex space-x-3">
                <Button type="submit">Salvar Cobrança</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros e Busca */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-effect rounded-lg p-4 border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Histórico de Cobranças</h3>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por cliente ou status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                style={{ minWidth: '200px' }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos</option>
              <option value="pendente">Pendente</option>
              <option value="paga">Paga</option>
              <option value="vencida">Vencida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Cliente</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground">Valor</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Vencimento</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((billing, index) => (
                <motion.tr
                  key={billing.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3">
                    <div className="font-medium">
                      {billing.customer_name || `Cliente ${billing.id.slice(0, 8)}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {billing.customer_id ? `ID: ${billing.customer_id.slice(0, 8)}` : 'Cliente não identificado'}
                    </div>
                  </td>
                  <td className="p-3 text-right font-medium">
                    {formatCurrency(Number(billing.amount || 0))}
                  </td>
                  <td className="p-3 text-center text-sm">
                    <div>{formatDate(billing.due_date || new Date().toISOString())}</div>
                    {billing.payment_date && (
                      <div className="text-xs text-green-600">
                        Pago em: {formatDate(billing.payment_date)}
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <div className={`flex items-center justify-center ${getStatusColor(getStatusWithDueDate(billing))}`}>
                      {getStatusIcon(getStatusWithDueDate(billing))}
                      <span className="text-sm font-medium">{getStatusWithDueDate(billing)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(billing)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(billing.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma cobrança encontrada.
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
    </div>
  );
}
