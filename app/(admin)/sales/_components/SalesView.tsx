'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useSales } from '../_hooks/useSales';
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
  Clock,
  FileDown
} from 'lucide-react';

export default function SalesView() {
  const { items, loading, hasMore, loadMore } = useSales();

  // Estados para filtros e formulário
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('all');
  const [showForm, setShowForm] = React.useState(false);
  const [showViewModal, setShowViewModal] = React.useState(false);
  const [editingSale, setEditingSale] = React.useState<any | null>(null);
  const [selectedSale, setSelectedSale] = React.useState<any | null>(null);
  const [formData, setFormData] = React.useState({
    customerId: '',
    customerName: '',
    saleDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'dinheiro',
    status: 'Pendente',
    notes: ''
  });
  const [saleItems, setSaleItems] = React.useState<any[]>([]);
  const [newItem, setNewItem] = React.useState({
    productId: '',
    productName: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  });

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Concluída': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'Pendente': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'Cancelada': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  // Função para obter ícone da forma de pagamento
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'dinheiro': return <DollarSign className="w-4 h-4" />;
      case 'cartão': return <CreditCard className="w-4 h-4" />;
      case 'pix': return <Receipt className="w-4 h-4" />;
      case 'boleto': return <Truck className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  // Filtros
  const filteredItems = items.filter(sale => {
    const matchesSearch = !searchTerm || 
      (sale.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sale.status?.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Cálculos dos KPIs
  const totalSales = items.length;
  const totalRevenue = items.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const uniqueCustomers = new Set(items.map(s => s.customer_name).filter(Boolean)).size;
  const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatação de data
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Handlers
  const handleEdit = (sale: any) => {
    setEditingSale(sale);
    setFormData({
      customerId: sale.customer_id || '',
      customerName: sale.customer_name || '',
      saleDate: sale.date || new Date().toISOString().split('T')[0],
      paymentMethod: sale.payment_method || 'dinheiro',
      status: sale.status || 'Pendente',
      notes: sale.notes || ''
    });
    setSaleItems(sale.items || []);
    setShowForm(true);
  };

  const handleView = (sale: any) => {
    setSelectedSale(sale);
    setShowViewModal(true);
  };

  const handleDelete = async (saleId: string | undefined) => {
    if (saleId && window.confirm('Tem certeza que deseja excluir esta venda?')) {
      // TODO: Implementar delete
      console.log('Deleting sale:', saleId);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSale(null);
    setSelectedSale(null);
    setFormData({
      customerId: '',
      customerName: '',
      saleDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'dinheiro',
      status: 'Pendente',
      notes: ''
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar create/update
    console.log('Submitting:', { formData, saleItems });
    handleCancel();
  };

  const addItemToSale = () => {
    if (!newItem.productId || newItem.quantity <= 0) {
      alert('Selecione um produto e informe a quantidade.');
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

  const removeItemFromSale = (itemId: number) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId));
  };

  const subtotal = saleItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Módulo de Vendas
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie vendas com múltiplos produtos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />Filtros
          </Button>
          <Button variant="outline" disabled>
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
            <Plus className="w-4 h-4 mr-2" />Nova Venda
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-lg p-4 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Total de Vendas</div>
              <div className="text-xl font-semibold text-orange-400">{totalSales}</div>
            </div>
            <ShoppingCart className="w-8 h-8 text-orange-400" />
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
              <div className="text-sm text-muted-foreground">Clientes Ativos</div>
              <div className="text-xl font-semibold text-blue-400">{uniqueCustomers}</div>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
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
              <div className="text-sm text-muted-foreground">Faturamento Total</div>
              <div className="text-xl font-semibold text-green-400">{formatCurrency(totalRevenue)}</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-effect rounded-lg p-4 border"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Ticket Médio</div>
              <div className="text-xl font-semibold text-purple-400">{formatCurrency(averageTicket)}</div>
            </div>
            <Calculator className="w-8 h-8 text-purple-400" />
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
              {editingSale ? 'Editar Venda' : 'Nova Venda'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cliente</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Nome do cliente"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Data da Venda</label>
                  <input
                    type="date"
                    value={formData.saleDate}
                    onChange={(e) => setFormData({...formData, saleDate: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Forma de Pagamento</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  >
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
                    <input
                      type="text"
                      value={newItem.productName}
                      onChange={(e) => setNewItem({...newItem, productName: e.target.value})}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quantidade</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value) || 0;
                        setNewItem({
                          ...newItem,
                          quantity,
                          totalPrice: newItem.unitPrice * quantity
                        });
                      }}
                      min="1"
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Preço Unitário</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => {
                        const unitPrice = parseFloat(e.target.value) || 0;
                        setNewItem({
                          ...newItem,
                          unitPrice,
                          totalPrice: unitPrice * newItem.quantity
                        });
                      }}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={addItemToSale} className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />Adicionar
                    </Button>
                  </div>
                </div>

                {/* Lista de Produtos */}
                {saleItems.length > 0 && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <div className="space-y-2">
                      {saleItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-background p-3 rounded-lg">
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} x {formatCurrency(item.unitPrice)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">{formatCurrency(item.totalPrice)}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItemFromSale(item.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-xl font-bold text-green-400">{formatCurrency(subtotal)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <Button type="submit">
                  {editingSale ? 'Salvar Alterações' : 'Criar Venda'}
                </Button>
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
        transition={{ delay: 0.5 }}
        className="glass-effect rounded-lg p-4 border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Lista de Vendas</h3>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por cliente..."
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
              <option value="all">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="concluída">Concluída</option>
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
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Data</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Pagamento</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Total</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((sale, index) => (
                <motion.tr
                  key={sale.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{sale.customer_name || 'Cliente'}</div>
                        <div className="text-sm text-muted-foreground">Itens: {sale.items?.length ?? 1}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">{formatDate(sale.date || '')}</span>
                  </td>
                  <td className="p-3">
                     <div className="flex items-center space-x-2">
                       {getPaymentMethodIcon((sale as any).payment_method || 'dinheiro')}
                       <span className="text-sm capitalize">{(sale as any).payment_method || 'dinheiro'}</span>
                     </div>
                   </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(sale.status || 'Pendente')}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'Concluída' ? 'bg-green-500/20 text-green-400' : 
                        sale.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-400' : 
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {sale.status || 'Pendente'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="font-medium">{formatCurrency(Number(sale.total_amount || 0))}</div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(sale)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(sale)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                         size="sm"
                         variant="ghost"
                         onClick={() => handleDelete(sale.id?.toString())}
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
              {items.length === 0 ? (
                <div>
                  <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhuma venda encontrada.</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeira Venda
                  </Button>
                </div>
              ) : (
                'Nenhuma venda encontrada com os filtros aplicados.'
              )}
            </div>
          )}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Cliente</label>
                    <p className="text-lg font-medium">{selectedSale.customer_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Data</label>
                    <p>{formatDate(selectedSale.date)}</p>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-muted-foreground">Forma de Pagamento</label>
                     <div className="flex items-center">
                       {getPaymentMethodIcon((selectedSale as any).payment_method || 'dinheiro')}
                       <span className="ml-1 capitalize">{(selectedSale as any).payment_method || 'dinheiro'}</span>
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

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <Calculator className="w-4 h-4 mr-2" />
                    Resumo Financeiro
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold text-green-600">{formatCurrency(Number(selectedSale.total_amount || 0))}</p>
                    </div>
                  </div>
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

      {/* Paginação */}
      {hasMore && (
        <div className="flex justify-center">
          <Button 
            onClick={() => void loadMore()} 
            disabled={loading}
            variant="outline"
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Carregando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Carregar Mais Vendas
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
