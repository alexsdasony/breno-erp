import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useProducts } from './hooks/useProducts';
import { useAppData } from '@/hooks/useAppData';
import { formatCurrency } from '@/lib/utils.js';

const InventoryModule = () => {
  const { activeSegmentId, data } = useAppData();
  const { products, loading, create, update, remove } = useProducts({ 
    segmentId: activeSegmentId 
  });

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    minStock: '',
    segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
  });

  const filteredProducts = products.filter(p => {
    if (!activeSegmentId || activeSegmentId === 0) {
      return true;
    }
    return p.segment_id === activeSegmentId;
  });
  const segments = data.segments || [];

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      cost: '',
      stock: '',
      minStock: '',
      segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
    });
    setShowForm(true);
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setCurrentProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      price: product.price || '',
      cost: product.cost || '',
      stock: product.stock || '',
      minStock: product.minStock || '',
      segmentId: product.segment_id || activeSegmentId || (data.segments?.[0]?.id || '')
    });
    setShowForm(true);
  };

  const handleDelete = async (product) => {
    try {
      await remove(product.id);
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 0,
        segment_id: formData.segmentId
      };

      if (isEditing && currentProduct) {
        await update(currentProduct.id, productData);
      } else {
        await create(productData);
      }

      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        cost: '',
        stock: '',
        minStock: '',
        segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
      });
      setCurrentProduct(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
    }
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= 0) return { status: 'out', color: 'text-red-500', bg: 'bg-red-500/20' };
    if (stock <= minStock) return { status: 'low', color: 'text-yellow-500', bg: 'bg-yellow-500/20' };
    return { status: 'ok', color: 'text-green-500', bg: 'bg-green-500/20' };
  };

  const getStockIcon = (stock, minStock) => {
    const status = getStockStatus(stock, minStock);
    switch (status.status) {
      case 'out':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'low':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Package className="w-4 h-4 text-green-500" />;
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Gestão de Estoque
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie seu inventário de produtos</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={(rows) => {
              // TODO: Implementar importação
              console.log('Import data:', rows);
            }} 
            moduleName="Produtos" 
            expectedHeaders={['name', 'description', 'category', 'price', 'cost', 'stock', 'minStock', 'segmentId']}
          />
          <Button id="inventory-new-button" onClick={handleAddNew} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
              <p className="text-2xl font-bold text-blue-400">{filteredProducts.length}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(filteredProducts.reduce((sum, p) => sum + (p.price * p.stock), 0))}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estoque Baixo</p>
              <p className="text-2xl font-bold text-yellow-400">
                {filteredProducts.filter(p => p.stock <= p.minStock && p.stock > 0).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sem Estoque</p>
              <p className="text-2xl font-bold text-red-400">
                {filteredProducts.filter(p => p.stock <= 0).length}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-400" />
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
              {isEditing ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="productName" className="block text-sm font-medium mb-1">Nome do Produto</label>
                  <input
                    id="productName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Nome do produto"
                  />
                </div>
                <div>
                  <label htmlFor="productCategory" className="block text-sm font-medium mb-1">Categoria</label>
                  <input
                    id="productCategory"
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Categoria"
                  />
                </div>
                <div>
                  <label htmlFor="productPrice" className="block text-sm font-medium mb-1">Preço de Venda</label>
                  <input
                    id="productPrice"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="productCost" className="block text-sm font-medium mb-1">Custo</label>
                  <input
                    id="productCost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="productStock" className="block text-sm font-medium mb-1">Estoque Atual</label>
                  <input
                    id="productStock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="productMinStock" className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                  <input
                    id="productMinStock"
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label htmlFor="productSegment" className="block text-sm font-medium mb-1">Segmento</label>
                  <select
                    id="productSegment"
                    value={formData.segmentId}
                    onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="productDescription" className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  id="productDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Descrição do produto"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <Button id="inventory-submit-button" type="submit" className="bg-gradient-to-r from-green-500 to-blue-600">
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Produto'}
                </Button>
                <Button id="inventory-cancel-button" type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Lista de Produtos</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar produtos..."
                className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum produto encontrado.</p>
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Produto
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="inventory-table" className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Produto</th>
                  <th className="text-left p-3">Categoria</th>
                  <th className="text-left p-3">Preço</th>
                  <th className="text-left p-3">Estoque</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product.stock, product.minStock);
                  return (
                    <motion.tr
                      key={product.id}
                      id={`inventory-row-${product.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm text-muted-foreground">{product.category}</span>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{formatCurrency(product.price)}</p>
                        <p className="text-sm text-muted-foreground">Custo: {formatCurrency(product.cost)}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-medium">{product.stock} unidades</p>
                        <p className="text-sm text-muted-foreground">Mín: {product.minStock}</p>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg}`}>
                          {getStockIcon(product.stock, product.minStock)}
                          <span className={`ml-1 capitalize ${stockStatus.color}`}>
                            {stockStatus.status === 'out' ? 'Sem estoque' : 
                             stockStatus.status === 'low' ? 'Estoque baixo' : 'OK'}
                          </span>
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center space-x-1">
                          <Button id={`inventory-edit-${product.id}`} variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button id={`inventory-delete-${product.id}`} variant="ghost" size="sm" title="Excluir" onClick={() => handleDelete(product)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default InventoryModule;
