import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData.jsx';

const SalesModule = ({ metrics, addSale, toast, importData }) => {
  const { data, activeSegmentId } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    product: '',
    quantity: '',
    total: '',
    status: 'Pendente',
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

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
    if (!formData.customerId || !formData.product || !formData.quantity || !formData.total || !formData.segmentId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    addSale({
      ...formData,
      quantity: parseInt(formData.quantity),
      total: parseFloat(formData.total),
      segmentId: parseInt(formData.segmentId)
    });
    
    setFormData({ customerId: '', customerName: '', product: '', quantity: '', total: '', status: 'Pendente', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
    setShowForm(false);
  };

  const saleHeaders = ['customerId', 'customerName', 'product', 'quantity', 'total', 'status', 'date', 'segmentId'];
  const filteredSales = data.sales.filter(s => !activeSegmentId || s.segmentId === activeSegmentId);
  const segments = data.segments || [];
  const productsForSegment = data.products.filter(p => !formData.segmentId || p.segmentId === parseInt(formData.segmentId));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Módulo de Vendas
          </h1>
          <p className="text-muted-foreground mt-2">Registre e acompanhe suas vendas</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={(parsedData) => importData(parsedData, 'sales', activeSegmentId)}
            moduleName="Vendas"
            expectedHeaders={saleHeaders}
          />
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Vendas</p>
              <p className="text-2xl font-bold text-orange-400">{metrics.totalSales}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-2xl font-bold text-blue-400">{metrics.totalCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
              <p className="text-2xl font-bold text-green-400">
                R$ {filteredSales.reduce((sum, s) => sum + Number(s.total || 0), 0).toLocaleString('pt-BR')}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
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
            <h3 className="text-lg font-semibold mb-4">Nova Venda</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Segmento</label>
                <select value={formData.segmentId} onChange={(e) => setFormData({...formData, segmentId: e.target.value, product: ''})} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="">Selecione um segmento</option>
                  {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cliente</label>
                <select value={formData.customerId} onChange={handleCustomerSelect} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="">Selecione um cliente</option>
                  {data.customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Produto</label>
                 <select value={formData.product} onChange={(e) => setFormData({...formData, product: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" disabled={!formData.segmentId}>
                  <option value="">Selecione um produto</option>
                  {productsForSegment.map(product => <option key={product.id} value={product.name}>{product.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Quantidade</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" placeholder="Quantidade" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Total</label>
                <input type="number" step="0.01" value={formData.total} onChange={(e) => setFormData({...formData, total: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" placeholder="Valor total" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="Pendente">Pendente</option>
                  <option value="Concluída">Concluída</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-3">
                <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600">Registrar Venda</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Histórico de Vendas</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" />Buscar</Button>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtrar</Button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-96 scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Segmento</th>
                <th className="text-right p-3">Total</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <motion.tr key={sale.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">{sale.date}</td>
                  <td className="p-3 font-medium">{sale.customerName}</td>
                  <td className="p-3">{segments.find(s => s.id === sale.segmentId)?.name || 'N/A'}</td>
                  <td className="p-3 text-right font-medium text-green-400">R$ {sale.total.toLocaleString('pt-BR')}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.status === 'Concluída' ? 'bg-green-500/20 text-green-400' : sale.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SalesModule;