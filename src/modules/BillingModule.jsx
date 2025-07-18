import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Send,
  CalendarDays,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData.jsx';
import { formatCurrency, formatDate } from '@/lib/utils.js';

const BillingModule = ({ metrics, addBilling, updateBilling, deleteBilling, toast, importData }) => {
  const { data, activeSegmentId } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editingBilling, setEditingBilling] = useState(null);
  const [viewingBilling, setViewingBilling] = useState(null);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    amount: '',
    dueDate: '',
    status: 'Pendente',
    segmentId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const segments = data.segments || [];

  // Inicializar segmentId quando os dados estiverem disponíveis
  useEffect(() => {
    if (data.segments && data.segments.length > 0 && !formData.segmentId) {
      setFormData(prev => ({
        ...prev,
        segmentId: activeSegmentId || data.segments[0].id
      }));
    }
  }, [data.segments, activeSegmentId, formData.segmentId]);

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = data.customers.find(c => c.id === parseInt(customerId));
    if (selectedCustomer) {
      setFormData({ ...formData, customerId: selectedCustomer.id, customerName: selectedCustomer.name });
    } else {
      setFormData({ ...formData, customerId: '', customerName: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.amount || !formData.dueDate || !formData.segmentId) {
      toast({
        title: "Erro",
        description: "Cliente, Valor, Data de Vencimento e Segmento são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    const billingData = {
      customer_id: parseInt(formData.customerId),
      customer_name: formData.customerName,
      amount: parseFloat(formData.amount),
      due_date: formData.dueDate,
      status: formData.status,
      segment_id: parseInt(formData.segmentId)
    };
    
    if (editingBilling) {
      // Update existing billing
      updateBilling(editingBilling.id, billingData);
      setEditingBilling(null);
    } else {
      // Create new billing
      await addBilling(billingData);
      if (typeof loadCustomers === 'function') await loadCustomers();
    }
    
    setFormData({ customerId: '', customerName: '', amount: '', dueDate: '', status: 'Pendente', segmentId: '' });
    setShowForm(false);
  };

  const handleEdit = (billing) => {
    setEditingBilling(billing);
    
    // Buscar o nome do cliente se não estiver disponível
    let customerName = billing.customerName || billing.customer_name || '';
    if (!customerName && billing.customerId) {
      const customer = data.customers.find(c => c.id === billing.customerId);
      if (customer) {
        customerName = customer.name;
      }
    }
    
    setFormData({
      customerId: billing.customerId || billing.customer_id || '',
      customerName: customerName,
      amount: billing.amount || '',
      dueDate: billing.dueDate || billing.due_date || '',
      status: billing.status || 'Pendente',
      segmentId: billing.segmentId || billing.segment_id || activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
    });
    setShowForm(true);
  };

  const handleView = (billing) => {
    setViewingBilling(billing);
  };

  const handleDelete = async (billingId) => {
    if (window.confirm('Tem certeza que deseja excluir esta cobrança?')) {
      try {
        await deleteBilling(billingId);
      } catch (error) {
        console.error('Delete billing error:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBilling(null);
    setFormData({ customerId: '', customerName: '', amount: '', dueDate: '', status: 'Pendente', segmentId: '' });
  };

  const getStatusColor = (status) => {
    if (status === 'Paga') return 'text-green-400';
    if (status === 'Vencida') return 'text-red-400';
    if (status === 'Pendente') return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getStatusIcon = (status) => {
    if (status === 'Paga') return <CheckCircle className="w-4 h-4 mr-2" />;
    if (status === 'Vencida') return <AlertTriangle className="w-4 h-4 mr-2" />;
    if (status === 'Pendente') return <Clock className="w-4 h-4 mr-2" />;
    return null;
  };

  // Função para atualizar status pendente para vencido se necessário
  function getStatusWithDueDate(billing) {
    if (billing.status === 'Pendente') {
      const dueStr = billing.dueDate || billing.due_date;
      if (!dueStr) return billing.status;
      const due = new Date(dueStr);
      if (isNaN(due.getTime())) return billing.status;
      const today = new Date();
      today.setHours(0,0,0,0);
      if (due < today) {
        return 'Vencida';
      }
    }
    return billing.status;
  }

  // Usar status calculado em toda a renderização e nos filtros
  let allBillings = (data.billings || [])
    .map(billing => ({ ...billing, status: getStatusWithDueDate(billing) }));

  // Filtro por segmento
  let filteredBillings = allBillings.filter(b => {
    // Se activeSegmentId é 0 ou null (Todos os Segmentos), mostrar todas as cobranças
    if (!activeSegmentId || activeSegmentId === 0) {
      return true;
    }
    // Se há um segmento específico selecionado, filtrar por esse segmento
    return (b.segmentId || b.segment_id) === activeSegmentId;
  });

  // Filtro por busca
  filteredBillings = filteredBillings.filter(billing =>
    (billing.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (billing.status || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtro por status
  filteredBillings = filteredBillings.filter(billing =>
    filterStatus === 'all' || billing.status === filterStatus
  );

  // Cálculo dos índices dinâmicos baseados no segmento ativo
  const billingsForMetrics = activeSegmentId && activeSegmentId !== 0 ? filteredBillings : allBillings;
  
  const totalBillings = billingsForMetrics.length;
  const overdueBillings = billingsForMetrics.filter(b => b.status === 'Vencida').length;
  const defaultRate = totalBillings > 0 ? (overdueBillings / totalBillings) * 100 : 0;
  const totalPendingAmount = billingsForMetrics
    .filter(b => b.status === 'Pendente' || b.status === 'Vencida')
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  // Cálculo dos índices gerais para comparação (quando há segmento ativo)
  const totalAllBillings = allBillings.length;
  const overdueAllBillings = allBillings.filter(b => b.status === 'Vencida').length;
  const defaultRateAll = totalAllBillings > 0 ? (overdueAllBillings / totalAllBillings) * 100 : 0;
  const totalPendingAmountAll = allBillings
    .filter(b => b.status === 'Pendente' || b.status === 'Vencida')
    .reduce((sum, b) => sum + Number(b.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text--3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
            Gestão de Cobranças
          </h1>
          <p className="text-muted-foreground mt-2">Acompanhe suas cobranças e inadimplência</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={(parsedData) => importData(parsedData, 'billings', activeSegmentId)}
            moduleName="Cobranças"
          />
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Cobrança
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Índice de Inadimplência</p>
              <p className={`text-2xl font-bold ${defaultRate > 10 ? 'text-red-400' : 'text-green-400'}`}>{defaultRate.toFixed(2)}%</p>
              {activeSegmentId && activeSegmentId !== 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Geral: {defaultRateAll.toFixed(2)}%
                </p>
              )}
            </div>
            <AlertTriangle className={`w-8 h-8 ${defaultRate > 10 ? 'text-red-400' : 'text-green-400'}`} />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cobranças Vencidas</p>
              <p className="text-2xl font-bold text-red-400">{overdueBillings}</p>
              {activeSegmentId && activeSegmentId !== 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Geral: {overdueAllBillings}
                </p>
              )}
            </div>
            <Clock className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total a Receber</p>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(totalPendingAmount)}</p>
              {activeSegmentId && activeSegmentId !== 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Geral: {formatCurrency(totalPendingAmountAll)}
                </p>
              )}
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-6 border"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingBilling ? 'Editar Cobrança' : 'Nova Cobrança'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Segmento</label>
                <select value={formData.segmentId} onChange={(e) => setFormData({...formData, segmentId: e.target.value})} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="">Selecione um segmento</option>
                  {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cliente</label>
                <select value={formData.customerId} onChange={handleCustomerSelect} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="">Selecione um cliente</option>
                  {data.customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name} ({customer.cpf})</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="billingAmount" className="block text-sm font-medium mb-2">Valor</label>
                <input 
                  id="billingAmount"
                  name="amount"
                  type="number" 
                  step="0.01" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="0,00" 
                />
              </div>
              <div>
                <label htmlFor="billingDueDate" className="block text-sm font-medium mb-2">Data de Vencimento</label>
                <input 
                  id="billingDueDate"
                  name="dueDate"
                  type="date" 
                  value={formData.dueDate} 
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                />
              </div>
               <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="Pendente">Pendente</option>
                  <option value="Paga">Paga</option>
                  <option value="Vencida">Vencida</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-3">
                <Button type="submit" className="bg-gradient-to-r from-pink-500 to-rose-600">Salvar Cobrança</Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Histórico de Cobranças</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Buscar por cliente ou status..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="p-2 border rounded-md bg-muted text-sm"
              style={{ minWidth: 180 }}
            />
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="p-2 border rounded-md bg-muted text-sm"
            >
              <option value="all">Todos</option>
              <option value="Pendente">Pendente</option>
              <option value="Paga">Paga</option>
              <option value="Vencida">Vencida</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto max-h-96 scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Segmento</th>
                <th className="text-right p-3">Valor</th>
                <th className="text-center p-3">Vencimento</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBillings.map(billing => (
                <motion.tr key={billing.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-medium">{billing.customerName || billing.customer_name || 'N/A'}</td>
                  <td className="p-3">{segments.find(s => s.id === (billing.segmentId || billing.segment_id))?.name || 'N/A'}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(billing.amount || 0)}</td>
                  <td className="p-3 text-center">{formatDate(billing.dueDate || billing.due_date)}</td>
                  <td className="p-3 text-center">
                    {billing.status || 'N/A'}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Visualizar"
                        onClick={() => handleView(billing)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Editar"
                        onClick={() => handleEdit(billing)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {billing.status !== 'Paga' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Enviar Lembrete (Simulado)"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Excluir"
                        onClick={() => handleDelete(billing.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredBillings.length === 0 && (<tr><td colSpan="6" className="p-4 text-center text-muted-foreground">Nenhuma cobrança registrada.</td></tr>)}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal de Visualização */}
      <AnimatePresence>
        {viewingBilling && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setViewingBilling(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-xl p-6 border max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalhes da Cobrança</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingBilling(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                  <p className="text-sm">{viewingBilling.customerName || viewingBilling.customer_name || 'N/A'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Segmento</label>
                  <p className="text-sm">
                    {segments.find(s => s.id === (viewingBilling.segmentId || viewingBilling.segment_id))?.name || 'N/A'}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Valor</label>
                  <p className="text-sm font-medium">{formatCurrency(viewingBilling.amount || 0)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Vencimento</label>
                  <p className="text-sm">{formatDate(viewingBilling.dueDate || viewingBilling.due_date)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <p className={`text-sm font-medium ${getStatusColor(viewingBilling.status)}`}>
                    {viewingBilling.status || 'N/A'}
                  </p>
                </div>
                
                {viewingBilling.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                    <p className="text-sm">{viewingBilling.description}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => setViewingBilling(null)}
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BillingModule;
