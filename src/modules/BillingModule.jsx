import React, { useState } from 'react';
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
  CalendarDays
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData.jsx';
import { formatCurrency, formatDate } from '@/lib/utils.js';

const BillingModule = ({ metrics, addBilling, toast, importData }) => {
  const { data, activeSegmentId } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    amount: '',
    dueDate: '',
    status: 'Pendente',
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

  const segments = data.segments || [];

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = data.customers.find(c => c.id === parseInt(customerId));
    if (selectedCustomer) {
      setFormData({ ...formData, customerId: selectedCustomer.id, customerName: selectedCustomer.name });
    } else {
      setFormData({ ...formData, customerId: '', customerName: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.amount || !formData.dueDate || !formData.segmentId) {
      toast({
        title: "Erro",
        description: "Cliente, Valor, Data de Vencimento e Segmento são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    addBilling({
      ...formData,
      amount: parseFloat(formData.amount),
      segmentId: parseInt(formData.segmentId)
    });
    
    setFormData({ customerId: '', customerName: '', amount: '', dueDate: '', status: 'Pendente', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
    setShowForm(false);
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
  const filteredBillings = (data.billings || [])
    .map(billing => ({ ...billing, status: getStatusWithDueDate(billing) }))
    .filter(b => !activeSegmentId || activeSegmentId === 0 || b.segmentId === activeSegmentId);

  // Log de depuração para analisar dados recebidos
  console.log('data.billings:', data.billings);
  console.log('filteredBillings:', filteredBillings);
  if (filteredBillings && filteredBillings.length > 0) {
    filteredBillings.forEach((b, i) => {
      if (!b.customerName || !b.amount || !b.segmentId) {
        console.warn('Cobrança com campo ausente:', { index: i, billing: b });
      }
    });
  }

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
              <p className={`text-2xl font-bold ${metrics.defaultRate > 10 ? 'text-red-400' : 'text-green-400'}`}>{metrics.defaultRate.toFixed(2)}%</p>
            </div>
            <AlertTriangle className={`w-8 h-8 ${metrics.defaultRate > 10 ? 'text-red-400' : 'text-green-400'}`} />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cobranças Vencidas</p>
              <p className="text-2xl font-bold text-red-400">{metrics.overdueBillings}</p>
            </div>
            <Clock className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total a Receber</p>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(metrics.totalPendingAmount || 0)}</p>
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
            <h3 className="text-lg font-semibold mb-4">Nova Cobrança</h3>
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
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Histórico de Cobranças</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" />Buscar</Button>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtrar</Button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-96 scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Segmento</th>
                <th className="text-right p-3">Valor</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBillings.map(billing => (
                <motion.tr key={billing.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-medium">{billing.customerName || 'N/A'}</td>
                  <td className="p-3">{segments.find(s => s.id === billing.segmentId)?.name || 'N/A'}</td>
                  <td className="p-3 text-right font-medium">{formatCurrency(billing.amount || 0)}</td>
                  <td className="p-3 text-center">
                    {billing.status || 'N/A'}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-1">
                      <Button variant="ghost" size="sm" title="Visualizar"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" title="Editar"><Edit className="w-4 h-4" /></Button>
                      {billing.status !== 'Paga' && (<Button variant="ghost" size="sm" title="Enviar Lembrete (Simulado)"><Send className="w-4 h-4" /></Button>)}
                      <Button variant="ghost" size="sm" title="Excluir"><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredBillings.length === 0 && (<tr><td colSpan="6" className="p-4 text-center text-muted-foreground">Nenhuma cobrança registrada.</td></tr>)}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BillingModule;
