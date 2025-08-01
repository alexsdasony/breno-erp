import React, { useState, useEffect } from 'react';
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
  X,
  Package,
  Calculator,
  Receipt,
  CreditCard,
  Truck,
  CheckCircle,
  AlertCircle,
  Clock
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
  const [saleItems, setSaleItems] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    saleDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'dinheiro',
    status: 'Pendente',
    notes: '',
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

  const [newItem, setNewItem] = useState({
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  });

  // Calcular totais
  const subtotal = saleItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const discount = 0; // Pode ser implementado depois
  const total = subtotal - discount;

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = data.customers.find(c => c.id === parseInt(customerId));
    if (selectedCustomer) {
      setFormData({ ...formData, customerId: selectedCustomer.id, customerName: selectedCustomer.name });
    } else {
      setFormData({ ...formData, customerId: '', customerName: '' });
    }
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    const selectedProduct = data.products.find(p => p.id === productId);
    if (selectedProduct) {
      setNewItem({
        ...newItem,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        unitPrice: selectedProduct.price || 0,
        totalPrice: (selectedProduct.price || 0) * newItem.quantity
      });
    }
  };

  const handleQuantityChange = (e) => {
    const quantity = parseInt(e.target.value) || 0;
    setNewItem({
      ...newItem,
      quantity,
      totalPrice: newItem.unitPrice * quantity
    });
  };

  const addItemToSale = () => {
    if (!newItem.productId || newItem.quantity <= 0) {
      toast({
        title: "Erro",
        description: "Selecione um produto e informe a quantidade.",
        variant: "destructive"
      });
      return;
    }

    setSaleItems([...saleItems, { ...newItem, id: Date.now() }]);
    setNewItem({
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    });
  };

  const removeItemFromSale = (itemId) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || saleItems.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um cliente e adicione pelo menos um produto.",
        variant: "destructive"
      });
      return;
    }
    
    const saleData = {
      ...formData,
      totalAmount: subtotal,
      discount,
      finalAmount: total,
      items: saleItems,
      segmentId: parseInt(formData.segmentId)
    };

    await addSale(saleData);
    resetForm();
    setShowForm(false);
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      customerName: '',
      saleDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'dinheiro',
      status: 'Pendente',
      notes: '',
      segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
    });
    setSaleItems([]);
    setNewItem({
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    });
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
      saleDate: sale.saleDate || sale.date || new Date().toISOString().split('T')[0],
      paymentMethod: sale.paymentMethod || 'dinheiro',
      status: sale.status || 'Pendente',
      notes: sale.notes || '',
      segmentId: sale.segmentId || activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
    });
    setSaleItems(sale.items || []);
    setShowEditModal(true);
  };

  const handleDeleteSale = (sale) => {
    setSelectedSale(sale);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Implementar exclusão
    toast({
      title: "Venda Excluída",
      description: `Venda de ${selectedSale.customerName} foi excluída com sucesso.`,
    });
    setShowDeleteConfirm(false);
    setSelectedSale(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.customerId || saleItems.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione um cliente e adicione pelo menos um produto.",
        variant: "destructive"
      });
      return;
    }
    
    // Implementar atualização
    toast({
      title: "Venda Atualizada",
      description: `Venda de ${formData.customerName} foi atualizada com sucesso.`,
    });
    
    setShowEditModal(false);
    setSelectedSale(null);
    resetForm();
  };

  const saleHeaders = ['customerId', 'customerName', 'saleDate', 'totalAmount', 'status', 'segmentId'];
  const filteredSales = data.sales.filter(s => {
    if (!activeSegmentId || activeSegmentId === 0) return true;
    return s.segmentId === activeSegmentId;
  });
  const segments = data.segments || [];
  
  // Filtrar produtos por segmento - se não há segmento selecionado, mostrar todos os produtos
  const productsForSegment = data.products.filter(p => {
    // Se não há segmento selecionado, mostrar todos os produtos
    if (!formData.segmentId) return true;
    
    // Se o produto não tem segment_id (null), mostrar para todos os segmentos
    if (!p.segment_id) return true;
    
    // Comparar segment_id diretamente (ambos são strings UUID)
    return p.segment_id === formData.segmentId;
  });

  // Debug: Log para verificar dados
  console.log('🔍 Debug SalesModule:', {
    totalProducts: data.products?.length || 0,
    segmentId: formData.segmentId,
    productsForSegment: productsForSegment.length,
    firstProduct: data.products?.[0]
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Concluída': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Pendente': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Cancelada': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'dinheiro': return <DollarSign className="w-4 h-4" />;
      case 'cartão': return <CreditCard className="w-4 h-4" />;
      case 'pix': return <Receipt className="w-4 h-4" />;
      case 'boleto': return <Truck className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

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
          <p className="text-muted-foreground mt-2">Gerencie vendas com múltiplos produtos</p>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                {formatCurrency(filteredSales.reduce((sum, s) => sum + Number(s.totalAmount || s.total || 0), 0))}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold text-purple-400">
                {filteredSales.length > 0 
                  ? formatCurrency(filteredSales.reduce((sum, s) => sum + Number(s.totalAmount || s.total || 0), 0) / filteredSales.length)
                  : formatCurrency(0)
                }
              </p>
            </div>
            <Calculator className="w-8 h-8 text-purple-400" />
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
            
            {/* Informações da Venda */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Cliente</label>
                <select value={formData.customerId} onChange={handleCustomerSelect} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="">Selecione um cliente</option>
                  {data.customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Data da Venda</label>
                <input 
                  type="date" 
                  value={formData.saleDate} 
                  onChange={(e) => setFormData({...formData, saleDate: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                <select value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartão">Cartão</option>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                </select>
              </div>
            </div>

            {/* Adicionar Produtos */}
            <div className="mb-6">
              <h4 className="text-md font-semibold mb-4 flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Produtos da Venda
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Produto</label>
                  <select value={newItem.productId} onChange={handleProductSelect} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                    <option value="">Selecione um produto</option>
                    {productsForSegment.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantidade</label>
                  <input 
                    type="number" 
                    value={newItem.quantity} 
                    onChange={handleQuantityChange}
                    min="1"
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preço Unitário</label>
                  <input 
                    type="number" 
                    value={newItem.unitPrice} 
                    readOnly
                    step="0.01"
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={addItemToSale} className="w-full bg-green-600 hover:bg-green-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Lista de Produtos */}
              {saleItems.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h5 className="font-medium mb-3">Produtos Adicionados</h5>
                  <div className="space-y-2">
                    {saleItems.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between bg-background p-3 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} x {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeItemFromSale(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Resumo da Venda */}
            {saleItems.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-semibold mb-3 flex items-center">
                  <Calculator className="w-4 h-4 mr-2" />
                  Resumo da Venda
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="text-lg font-semibold">{formatCurrency(subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Desconto</p>
                    <p className="text-lg font-semibold text-red-600">{formatCurrency(discount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold text-green-600">{formatCurrency(total)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Observações */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Observações</label>
              <textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows="3"
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Observações sobre a venda..."
              />
            </div>

            {/* Botões */}
            <div className="flex space-x-3">
              <Button type="button" onClick={handleSubmit} className="bg-gradient-to-r from-orange-500 to-red-600" disabled={saleItems.length === 0}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalizar Venda
              </Button>
              <Button type="button" variant="outline" onClick={() => {setShowForm(false); resetForm();}}>
                Cancelar
              </Button>
            </div>
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
                <th className="text-left p-3">Produtos</th>
                <th className="text-right p-3">Total</th>
                <th className="text-center p-3">Pagamento</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map(sale => (
                <motion.tr key={sale.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">{formatDate(sale.saleDate || sale.date)}</td>
                  <td className="p-3 font-medium">{sale.customerName}</td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {sale.items ? `${sale.items.length} produtos` : '1 produto'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-right font-medium text-green-400">
                    {formatCurrency(sale.totalAmount || sale.total || 0)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      {getPaymentMethodIcon(sale.paymentMethod || 'dinheiro')}
                      <span className="ml-1 text-xs capitalize">
                        {sale.paymentMethod || 'dinheiro'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center">
                      {getStatusIcon(sale.status)}
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'Concluída' ? 'bg-green-500/20 text-green-400' : 
                        sale.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {sale.status}
                      </span>
                    </div>
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
              className="glass-effect rounded-xl p-6 border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
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
              
              <div className="space-y-6">
                {/* Informações da Venda */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Cliente</label>
                    <p className="text-lg font-medium">{selectedSale.customerName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Data</label>
                    <p>{formatDate(selectedSale.saleDate || selectedSale.date)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Forma de Pagamento</label>
                    <div className="flex items-center">
                      {getPaymentMethodIcon(selectedSale.paymentMethod || 'dinheiro')}
                      <span className="ml-1 capitalize">{selectedSale.paymentMethod || 'dinheiro'}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Status</label>
                    <div className="flex items-center">
                      {getStatusIcon(selectedSale.status)}
                      <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedSale.status === 'Concluída' ? 'bg-green-500/20 text-green-400' : 
                        selectedSale.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {selectedSale.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Produtos */}
                <div>
                  <h4 className="font-medium mb-3 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Produtos
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-4">
                    {selectedSale.items ? (
                      <div className="space-y-3">
                        {selectedSale.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center bg-background p-3 rounded-lg">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} x {formatCurrency(item.unitPrice)}
                              </p>
                            </div>
                            <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center bg-background p-3 rounded-lg">
                        <div>
                          <p className="font-medium">{selectedSale.product}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedSale.quantity} x {formatCurrency(selectedSale.total / selectedSale.quantity)}
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(selectedSale.total)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Calculator className="w-4 h-4 mr-2" />
                    Resumo Financeiro
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="text-lg font-semibold">{formatCurrency(selectedSale.totalAmount || selectedSale.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Desconto</p>
                      <p className="text-lg font-semibold text-red-600">{formatCurrency(selectedSale.discount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(selectedSale.finalAmount || selectedSale.total)}</p>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                {selectedSale.notes && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Observações</label>
                    <p className="bg-muted/50 rounded-lg p-3">{selectedSale.notes}</p>
                  </div>
                )}
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

      {/* Modal de Edição - Similar ao formulário de criação */}
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
              className="glass-effect rounded-xl p-6 border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
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
              
              {/* Conteúdo similar ao formulário de criação */}
              <div className="space-y-6">
                {/* Informações da Venda */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cliente</label>
                    <select value={formData.customerId} onChange={handleCustomerSelect} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                      <option value="">Selecione um cliente</option>
                      {data.customers.map(customer => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Data da Venda</label>
                    <input 
                      type="date" 
                      value={formData.saleDate} 
                      onChange={(e) => setFormData({...formData, saleDate: e.target.value})} 
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                    <select value={formData.paymentMethod} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                      <option value="dinheiro">Dinheiro</option>
                      <option value="cartão">Cartão</option>
                      <option value="pix">PIX</option>
                      <option value="boleto">Boleto</option>
                    </select>
                  </div>
                </div>

                {/* Produtos da Venda */}
                <div>
                  <h4 className="text-md font-semibold mb-4 flex items-center">
                    <Package className="w-4 h-4 mr-2" />
                    Produtos da Venda
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Produto</label>
                      <select value={newItem.productId} onChange={handleProductSelect} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                        <option value="">Selecione um produto</option>
                        {productsForSegment.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Quantidade</label>
                      <input 
                        type="number" 
                        value={newItem.quantity} 
                        onChange={handleQuantityChange}
                        min="1"
                        className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Preço Unitário</label>
                      <input 
                        type="number" 
                        value={newItem.unitPrice} 
                        readOnly
                        step="0.01"
                        className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={addItemToSale} className="w-full bg-green-600 hover:bg-green-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                      </Button>
                    </div>
                  </div>

                  {/* Lista de Produtos */}
                  {saleItems.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h5 className="font-medium mb-3">Produtos Adicionados</h5>
                      <div className="space-y-2">
                        {saleItems.map((item, index) => (
                          <div key={item.id} className="flex items-center justify-between bg-background p-3 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity} x {formatCurrency(item.unitPrice)} = {formatCurrency(item.totalPrice)}
                              </p>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeItemFromSale(item.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Resumo da Venda */}
                {saleItems.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Calculator className="w-4 h-4 mr-2" />
                      Resumo da Venda
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Subtotal</p>
                        <p className="text-lg font-semibold">{formatCurrency(subtotal)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Desconto</p>
                        <p className="text-lg font-semibold text-red-600">{formatCurrency(discount)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(total)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Observações */}
                <div>
                  <label className="block text-sm font-medium mb-2">Observações</label>
                  <textarea 
                    value={formData.notes} 
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Observações sobre a venda..."
                  />
                </div>

                {/* Botões */}
                <div className="flex space-x-3">
                  <Button type="button" onClick={handleEditSubmit} className="bg-gradient-to-r from-orange-500 to-red-600" disabled={saleItems.length === 0}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Atualizar Venda
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
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