import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  AlertTriangle, 
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

const InventoryModule = ({ metrics, addProduct, toast, importData }) => {
  const { data, activeSegmentId } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    stock: '',
    minStock: '',
    price: '',
    category: '',
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.stock || !formData.minStock || !formData.price || !formData.category || !formData.segmentId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    addProduct({
      ...formData,
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      price: parseFloat(formData.price),
      segmentId: parseInt(formData.segmentId)
    });
    
    setFormData({ name: '', stock: '', minStock: '', price: '', category: '', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
    setShowForm(false);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name || '',
      stock: product.stock || '',
      minStock: product.minStock || '',
      price: product.price || '',
      category: product.category || '',
      segmentId: product.segmentId || activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
    });
    setShowEditModal(true);
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    toast({
      title: "Produto Excluído",
      description: `${selectedProduct.name} foi excluído com sucesso.`,
    });
    setShowDeleteConfirm(false);
    setSelectedProduct(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.stock || !formData.minStock || !formData.price || !formData.category || !formData.segmentId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Produto Atualizado",
      description: `${formData.name} foi atualizado com sucesso.`,
    });
    
    setShowEditModal(false);
    setSelectedProduct(null);
    setFormData({ name: '', stock: '', minStock: '', price: '', category: '', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
  };

  const productHeaders = ['name', 'stock', 'minStock', 'price', 'category', 'segmentId'];
  const filteredProducts = data.products.filter(p => !activeSegmentId || p.segmentId === activeSegmentId);
  const segments = data.segments || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie seus produtos e inventário</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={(parsedData) => importData(parsedData, 'products', activeSegmentId)}
            moduleName="Produtos"
            expectedHeaders={productHeaders}
          />
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
              <p className="text-2xl font-bold text-blue-400">{metrics.totalProducts}</p>
            </div>
            <Package className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Estoque Baixo</p>
              <p className="text-2xl font-bold text-yellow-400">{metrics.lowStockProducts}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total do Estoque</p>
              <p className="text-2xl font-bold text-green-400">
                R$ {(filteredProducts.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0) || 0).toLocaleString('pt-BR')}
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
            <h3 className="text-lg font-semibold mb-4">Novo Produto</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Segmento</label>
                <select value={formData.segmentId} onChange={(e) => setFormData({...formData, segmentId: e.target.value})} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="">Selecione um segmento</option>
                  {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="productName" className="block text-sm font-medium mb-2">Nome do Produto</label>
                <input 
                  id="productName"
                  name="name"
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="Nome do produto" 
                />
              </div>
              <div>
                <label htmlFor="productCategory" className="block text-sm font-medium mb-2">Categoria</label>
                <input 
                  id="productCategory"
                  name="category"
                  type="text" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="Ex: Eletrônicos, Casa, Escritório" 
                />
              </div>
              <div>
                <label htmlFor="productStock" className="block text-sm font-medium mb-2">Estoque Atual</label>
                <input 
                  id="productStock"
                  name="stock"
                  type="number" 
                  value={formData.stock} 
                  onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="Quantidade em estoque" 
                />
              </div>
              <div>
                <label htmlFor="productMinStock" className="block text-sm font-medium mb-2">Estoque Mínimo</label>
                <input 
                  id="productMinStock"
                  name="minStock"
                  type="number" 
                  value={formData.minStock} 
                  onChange={(e) => setFormData({...formData, minStock: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="Estoque mínimo" 
                />
              </div>
              <div>
                <label htmlFor="productPrice" className="block text-sm font-medium mb-2">Preço</label>
                <input 
                  id="productPrice"
                  name="price"
                  type="number" 
                  step="0.01" 
                  value={formData.price} 
                  onChange={(e) => setFormData({...formData, price: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="0,00" 
                />
              </div>
              <div className="md:col-span-2 flex space-x-3">
                <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600">Salvar Produto</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Produtos em Estoque</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" />Buscar</Button>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtrar</Button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-96 scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Produto</th>
                <th className="text-left p-3">Segmento</th>
                <th className="text-center p-3">Estoque</th>
                <th className="text-right p-3">Preço</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <motion.tr key={product.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">{segments.find(s => s.id === product.segmentId)?.name || 'N/A'}</td>
                  <td className="p-3 text-center">{product.stock}</td>
                  <td className="p-3 text-right font-medium">R$ {(product.price || 0).toLocaleString('pt-BR')}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock <= product.minStock ? 'bg-red-500/20 text-red-400' : product.stock <= product.minStock * 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {product.stock <= product.minStock ? 'Crítico' : product.stock <= product.minStock * 2 ? 'Baixo' : 'Normal'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewProduct(product)}
                        title="Visualizar produto"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        title="Editar produto"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product)}
                        title="Excluir produto"
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
        {showViewModal && selectedProduct && (
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
                <h3 className="text-lg font-semibold">Detalhes do Produto</h3>
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
                  <label className="block text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-lg font-medium">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Categoria</label>
                  <p>{selectedProduct.category}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Estoque Atual</label>
                    <p className="text-lg font-medium">{selectedProduct.stock}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Estoque Mínimo</label>
                    <p>{selectedProduct.minStock}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Preço</label>
                  <p className="text-lg font-medium text-green-400">
                    R$ {(selectedProduct.price || 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Status</label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedProduct.stock <= selectedProduct.minStock ? 'bg-red-500/20 text-red-400' : selectedProduct.stock <= selectedProduct.minStock * 2 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {selectedProduct.stock <= selectedProduct.minStock ? 'Crítico' : selectedProduct.stock <= selectedProduct.minStock * 2 ? 'Baixo' : 'Normal'}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Segmento</label>
                  <p>{segments.find(s => s.id === selectedProduct.segmentId)?.name || 'N/A'}</p>
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
        {showEditModal && selectedProduct && (
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
                <h3 className="text-lg font-semibold">Editar Produto</h3>
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
                  <select value={formData.segmentId} onChange={(e) => setFormData({...formData, segmentId: e.target.value})} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                    <option value="">Selecione um segmento</option>
                    {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="editProductName" className="block text-sm font-medium mb-2">Nome do Produto</label>
                  <input 
                    id="editProductName"
                    name="name"
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                    placeholder="Nome do produto" 
                  />
                </div>
                <div>
                  <label htmlFor="editProductCategory" className="block text-sm font-medium mb-2">Categoria</label>
                  <input 
                    id="editProductCategory"
                    name="category"
                    type="text" 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                    placeholder="Ex: Eletrônicos, Casa, Escritório" 
                  />
                </div>
                <div>
                  <label htmlFor="editProductStock" className="block text-sm font-medium mb-2">Estoque Atual</label>
                  <input 
                    id="editProductStock"
                    name="stock"
                    type="number" 
                    value={formData.stock} 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                    placeholder="Quantidade em estoque" 
                  />
                </div>
                <div>
                  <label htmlFor="editProductMinStock" className="block text-sm font-medium mb-2">Estoque Mínimo</label>
                  <input 
                    id="editProductMinStock"
                    name="minStock"
                    type="number" 
                    value={formData.minStock} 
                    onChange={(e) => setFormData({...formData, minStock: e.target.value})} 
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                    placeholder="Estoque mínimo" 
                  />
                </div>
                <div>
                  <label htmlFor="editProductPrice" className="block text-sm font-medium mb-2">Preço</label>
                  <input 
                    id="editProductPrice"
                    name="price"
                    type="number" 
                    step="0.01" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                    placeholder="0,00" 
                  />
                </div>
                <div className="md:col-span-2 flex space-x-3">
                  <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600">
                    Atualizar Produto
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
        {showDeleteConfirm && selectedProduct && (
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
                  Tem certeza que deseja excluir o produto <strong>{selectedProduct.name}</strong>? 
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

export default InventoryModule;
