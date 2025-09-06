'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useProducts } from '../_hooks/useProducts';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileDown
} from 'lucide-react';

export default function InventoryView() {
  const { items: products, loading, create, update, remove, load } = useProducts();
  
  // Estado para controle de paginação
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  
  // Função para carregar mais produtos
  const loadMore = React.useCallback(() => {
    setPage(prevPage => prevPage + 1);
    // Simulando o fim da paginação após 5 páginas
    if (page >= 5) setHasMore(false);
  }, [page]);

  // Estados para filtros e formulário
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState('all');
  const [showForm, setShowForm] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<any | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: ''
  });

  // Função para obter status do estoque
  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= 0) return { status: 'out', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (stock <= minStock) return { status: 'low', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    return { status: 'ok', color: 'text-green-400', bg: 'bg-green-500/20' };
  };

  // Função para obter ícone do estoque
  const getStockIcon = (stock: number, minStock: number) => {
    const status = getStockStatus(stock, minStock);
    switch (status.status) {
      case 'out':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Package className="w-4 h-4 text-green-400" />;
    }
  };

  // Filtros
  const filteredItems = products.filter(product => {
    const matchesSearch = !searchTerm || 
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category?.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Cálculos dos KPIs
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + (Number(p.price || 0) * Number(p.stock_quantity || 0)), 0);
  const lowStockProducts = products.filter(p => Number(p.stock_quantity || 0) <= Number(p.minimum_stock || 0) && Number(p.stock_quantity || 0) > 0).length;
  const outOfStockProducts = products.filter(p => Number(p.stock_quantity || 0) <= 0).length;

  // Formatação de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Handlers
  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || '',
      cost: product.cost_price || '',
      stock: product.stock_quantity || product.stock || '',
      minStock: product.minimum_stock || product.min_stock || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (productId: string | undefined) => {
    if (productId && window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const success = await remove(productId);
        if (success) {
          console.log('✅ Produto excluído com sucesso');
          // Recarregar a lista para mostrar as alterações
          await load(true);
        } else {
          console.error('❌ Falha ao excluir produto');
        }
      } catch (error) {
        console.error('❌ Erro ao excluir produto:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      minStock: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        stock_quantity: parseInt(formData.stock) || 0,
        minimum_stock: parseInt(formData.minStock) || 0
      };

      if (editingProduct) {
        console.log('Atualizando produto:', editingProduct.id);
        await update(editingProduct.id, productData);
      } else {
        console.log('Criando novo produto');
        await create(productData);
      }
      
      // Recarregar a lista para mostrar as alterações
      await load(true);
      
      handleCancel();
    } catch (error) {
      console.error('❌ Erro ao salvar produto:', error);
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
          <h1 className="text-2xl font-semibold">Gestão de Estoque</h1>
          <p className="text-muted-foreground mt-1">Gerencie seu inventário de produtos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />Filtros
          </Button>
          <Button variant="outline" disabled>
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />Novo Produto
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
              <div className="text-sm text-muted-foreground">Total de Produtos</div>
              <div className="text-xl font-semibold text-blue-400">{totalProducts}</div>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
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
              <div className="text-sm text-muted-foreground">Valor Total</div>
              <div className="text-xl font-semibold text-green-400">{formatCurrency(totalValue)}</div>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
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
              <div className="text-sm text-muted-foreground">Estoque Baixo</div>
              <div className="text-xl font-semibold text-yellow-400">{lowStockProducts}</div>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
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
              <div className="text-sm text-muted-foreground">Sem Estoque</div>
              <div className="text-xl font-semibold text-red-400">{outOfStockProducts}</div>
            </div>
            <TrendingDown className="w-8 h-8 text-red-400" />
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
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nome do Produto</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Nome do produto"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Categoria"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preço de Venda</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Custo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estoque Atual</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Estoque Mínimo</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                    className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Descrição do produto"
                  rows={3}
                />
              </div>
              <div className="flex space-x-3">
                <Button type="submit">
                  {editingProduct ? 'Salvar Alterações' : 'Adicionar Produto'}
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
          <h3 className="text-lg font-semibold">Lista de Produtos</h3>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
                style={{ minWidth: '200px' }}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todas as categorias</option>
              {Array.from(new Set(products.map(p => p.category).filter(Boolean))).map(category => (
                <option key={category} value={category || ''}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Produto</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Categoria</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Preço</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Estoque</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((product, index) => {
                const stockStatus = getStockStatus(Number(product.stock_quantity || product.stock || 0), Number(product.minimum_stock || product.min_stock || 0));
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.description || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground">{product.category || '-'}</span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{formatCurrency(Number(product.price || 0))}</div>
                      <div className="text-sm text-muted-foreground">Custo: {formatCurrency(Number(product.cost_price || 0))}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{product.stock_quantity || product.stock || 0} unidades</div>
                      <div className="text-sm text-muted-foreground">Mín: {product.minimum_stock || product.min_stock || 0}</div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg}`}>
                        {getStockIcon(Number(product.stock_quantity || product.stock || 0), Number(product.minimum_stock || product.min_stock || 0))}
                        <span className={`ml-1 capitalize ${stockStatus.color}`}>
                          {stockStatus.status === 'out' ? 'Sem estoque' : 
                           stockStatus.status === 'low' ? 'Estoque baixo' : 'OK'}
                        </span>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {products.length === 0 ? (
                <div>
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhum produto encontrado.</p>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Produto
                  </Button>
                </div>
              ) : (
                'Nenhum produto encontrado com os filtros aplicados.'
              )}
            </div>
          )}
        </div>
      </motion.div>

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
                Carregar Mais Produtos
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
