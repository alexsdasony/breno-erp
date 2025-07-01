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
  Filter,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData.jsx';
import { formatCurrency, formatDate } from '@/lib/utils.js';

const SalesModule = ({ metrics, addSale, toast, importData }) => {
  const { data, activeSegmentId } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
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

  const handleViewSale = (sale) => {
    setSelectedSale(sale);
    setShowViewModal(true);
  };

  const handleEditSale = (sale) => {
    setSelectedSale(sale);
    setFormData({
      customerId: sale.customerId || '',
      customerName: sale.customerName || '',
      product: sale.product || '',
      quantity: sale.quantity || '',
      total: sale.total || '',
      status: sale.status || 'Pendente',
      segmentId: sale.segmentId || activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
    });
    setShowEditModal(true);
  };

  const handleDeleteSale = (sale) => {
    setSelectedSale(sale);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Aqui você implementaria a chamada para deletar a venda
    toast({
      title: "Venda Excluída",
      description: `Venda de ${selectedSale.customerName} foi excluída com sucesso.`,
    });
    setShowDeleteConfirm(false);
    setSelectedSale(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.product || !formData.quantity || !formData.total || !formData.segmentId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    // Aqui você implementaria a chamada para atualizar a venda
    toast({
      title: "Venda Atualizada",
      description: `Venda de ${formData.customerName} foi atualizada com sucesso.`,
    });
    
    setShowEditModal(false);
    setSelectedSale(null);
    setFormData({ customerId: '', customerName: '', product: '', quantity: '', total: '', status: 'Pendente', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
  };

  const saleHeaders = ['customerId', 'customerName', 'product', 'quantity', 'total', 'status', 'date', 'segmentId'];
  const filteredSales = data.sales.filter(s => !activeSegmentId || activeSegmentId === 0 || s.segmentId === activeSegmentId);
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
                R$ {(filteredSales.reduce((sum, s) => sum + Number(s.total || 0), 0) || 0).toLocaleString('pt-BR')}
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
                <label htmlFor="salesQuantity" className="block text-sm font-medium mb-2">Quantidade</label>
                <input 
                  id="salesQuantity"
                  name="quantity"
                  type="number" 
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="Quantidade" 
                />
              </div>
              <div>
                <label htmlFor="salesTotal" className="block text-sm font-medium mb-2">Total</label>
                <input 
                  id="salesTotal"
                  name="total"
                  type="number" 
                  step="0.01" 
                  value={formData.total} 
                  onChange={(e) => setFormData({...formData, total: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="Valor total" 
                />
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
                  <td className="p-3">{formatDate(sale.date)}</td>
                  <td className="p-3 font-medium">{sale.customerName}</td>
                  <td className="p-3">{segments.find(s => s.id === sale.segmentId)?.name || 'N/A'}</td>
                  <td className="p-3 text-right font-medium text-green-400">{formatCurrency(sale.total || 0)}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${sale.status === 'Concluída' ? 'bg-green-500/20 text-green-400' : sale.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewSale(sale)}
                        title="Visualizar venda"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditSale(sale)}
                        title="Editar venda"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteSale(sale)}
                        title="Excluir venda"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal de Visualização */}
      <AnimatePresence>
        {showViewModal && selectedSale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-xl p-6 border max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalhes da Venda</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowViewModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Cliente</label>
                  <p className="text-lg font-medium">{selectedSale.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Produto</label>
                  <p>{selectedSale.product}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Quantidade</label>
                    <p>{selectedSale.quantity}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Total</label>
                    <p className="text-lg font-medium text-green-400">
                      R$ {(selectedSale.total || 0).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedSale.status === 'Concluída' ? 'bg-green-500/20 text-green-400' : selectedSale.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedSale.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Data</label>
                  <p>{selectedSale.date}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Segmento</label>
                  <p>{segments.find(s => s.id === selectedSale.segmentId)?.name || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => setShowViewModal(false)}>
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Edição */}
      <AnimatePresence>
        {showEditModal && selectedSale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-xl p-6 border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Editar Venda</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label htmlFor="editSalesQuantity" className="block text-sm font-medium mb-2">Quantidade</label>
                  <input 
                    id="editSalesQuantity"
                    name="quantity"
                    type="number" 
                    value={formData.quantity} 
                    onChange={(e) => setFormData({...formData, quantity: e.target.value})} 
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                    placeholder="Quantidade" 
                  />
                </div>
                <div>
                  <label htmlFor="editSalesTotal" className="block text-sm font-medium mb-2">Total</label>
                  <input 
                    id="editSalesTotal"
                    name="total"
                    type="number" 
                    step="0.01" 
                    value={formData.total} 
                    onChange={(e) => setFormData({...formData, total: e.target.value})} 
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                    placeholder="Valor total" 
                  />
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
                  <Button type="submit" className="bg-gradient-to-r from-orange-500 to-red-600">
                    Atualizar Venda
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteConfirm && selectedSale && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-xl p-6 border max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Confirmar Exclusão</h3>
                <p className="text-muted-foreground mb-6">
                  Tem certeza que deseja excluir a venda de <strong>{selectedSale.customerName}</strong>? 
                  Esta ação não pode ser desfeita.
                </p>
                
                <div className="flex space-x-3 justify-center">
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                  >
                    Sim, Excluir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SalesModule;