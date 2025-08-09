import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
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
import Modal from '@/components/ui/modal';
import { useAppData } from '@/hooks/useAppData.jsx';
import { formatCurrency, formatDate } from '@/lib/utils.js';

const FinancialModule = () => {
  const { data, activeSegmentId, loadTransactions, metrics, toast, addTransaction, updateTransaction, deleteTransaction, importData } = useAppData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    type: 'receita',
    description: '',
    amount: '',
    category: '',
    costCenter: '',
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

  const resetForm = () => {
    setFormData({
      type: 'receita',
      description: '',
      amount: '',
      category: '',
      costCenter: '',
      segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
    });
    setCurrentTransaction(null);
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category || !formData.segmentId) {
      toast({
        title: "Erro",
        description: "Preencha Descrição, Valor, Categoria e Segmento.",
        variant: "destructive"
      });
      return;
    }
    if (formData.type === 'despesa' && !formData.costCenter) {
      toast({
        title: "Erro",
        description: "Centro de Custo é obrigatório para despesas.",
        variant: "destructive"
      });
      return;
    }
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount),
      costCenter: formData.type === 'receita' ? null : formData.costCenter,
      // segmentId é UUID no banco; manter como string
      segmentId: formData.segmentId || null,
    };

    if (currentTransaction) {
      // Usar o método do useAppData
      await updateTransaction(currentTransaction.id, transactionData);
      setShowEditModal(false);
    } else {
      // Usar o método do useAppData
      await addTransaction(transactionData);
      setShowCreateModal(false);
    }

    // Recarregar lista para refletir imediatamente (forçando ignorar cache)
    const segmentFilter = activeSegmentId && activeSegmentId !== 0 ? { segment_id: activeSegmentId } : {};
    try { await loadTransactions({ ...segmentFilter, force: true }); } catch (_) {}
    
    resetForm();
  };

  const handleEdit = (transaction) => {
    setCurrentTransaction(transaction);
    setFormData({
      type: transaction.type,
      description: transaction.description,
      amount: transaction.amount.toString(),
      category: transaction.category,
      costCenter: transaction.costCenter || '',
      segmentId: transaction.segmentId || activeSegmentId || ''
    });
    setShowEditModal(true);
  };

  const handleView = (transaction) => {
    setViewingTransaction(transaction);
    setShowViewModal(true);
  };

  const handleDelete = (transaction) => {
    setCurrentTransaction(transaction);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (currentTransaction) {
      try {
        // Usar o método do useAppData
        await deleteTransaction(currentTransaction.id);
        toast({
          title: "Sucesso",
          description: "Transação excluída com sucesso.",
        });
        
        // Recarregar lista
        const segmentFilter = activeSegmentId && activeSegmentId !== 0 ? { segment_id: activeSegmentId } : {};
        try { await loadTransactions({ ...segmentFilter, force: true }); } catch (_) {}
      } catch (error) {
        toast({
          title: "Erro",
          description: "Falha ao excluir transação.",
          variant: "destructive"
        });
      }
    }
    setShowDeleteConfirm(false);
    setCurrentTransaction(null);
  };

  const handleSegmentChange = async (e) => {
    const newSegmentId = e.target.value;
    setFormData(prev => ({ ...prev, segmentId: newSegmentId }));
    
    // Recarregar transações do novo segmento
    const segmentFilter = newSegmentId && newSegmentId !== '0' ? { segment_id: newSegmentId } : {};
    try { await loadTransactions({ ...segmentFilter, force: true }); } catch (_) {}
  };

  // Filtrar transações por segmento ativo
  const filteredTransactions = data.transactions.filter(transaction => {
    if (!activeSegmentId || activeSegmentId === 0) return true;
    return transaction.segmentId === activeSegmentId;
  });

  const segments = data.segments || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Módulo Financeiro
          </h1>
          <p className="text-muted-foreground mt-2">Controle suas receitas e despesas</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={(parsedData) => importData(parsedData, 'transactions', activeSegmentId)}
            moduleName="Transações"
            expectedHeaders={['type', 'description', 'amount', 'category', 'costCenter', 'date', 'segmentId']}
          />
          <Button id="financial-new-transaction-button" onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Receitas</p>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(metrics?.totalRevenue || 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Despesas</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(metrics?.totalExpenses || 0)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lucro Bruto</p>
              <p className={`text-2xl font-bold ${(metrics?.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>{formatCurrency(metrics?.profit || 0)}</p>
            </div>
            <DollarSign className={`w-8 h-8 ${metrics?.profit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
          </div>
        </motion.div>
      </div>



      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Todas as Transações</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" />Buscar</Button>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtrar</Button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-96 scrollbar-hide">
          <table id="financial-transactions-table" className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Descrição</th>
                <th className="text-left p-3">Segmento</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-right p-3">Valor</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <motion.tr key={transaction.id} id={`financial-row-${transaction.id}`} data-testid={`financial-row-${transaction.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">{formatDate(transaction.date)}</td>
                  <td className="p-3 font-medium">{transaction.description}</td>
                  <td className="p-3">{segments.find(s => s.id === transaction.segmentId)?.name || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'receita' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-medium ${transaction.type === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount || 0)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Visualizar"
                        onClick={() => handleView(transaction)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Editar"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Excluir"
                        onClick={() => handleDelete(transaction)}
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

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nova Transação"
        size="md"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Segmento *</label>
            <select id="financial-segment-select" value={formData.segmentId} onChange={handleSegmentChange} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
              <option value="">Selecione um segmento</option>
              {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo *</label>
            <select id="financial-type-select" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value, costCenter: ''})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Descrição *</label>
            <input 
              id="financial-description-input"
              type="text" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="Descrição da transação" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categoria *</label>
            <input 
              id="financial-category-input"
              type="text" 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="Ex: Vendas, Compras, Serviços" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Valor *</label>
            <input 
              id="financial-amount-input"
              type="number" 
              step="0.01" 
              value={formData.amount} 
              onChange={(e) => setFormData({...formData, amount: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="0,00" 
              required
            />
          </div>
          {formData.type === 'despesa' && (
            <div>
              <label className="block text-sm font-medium mb-2">Centro de Custo *</label>
              <select id="financial-cost-center-select" value={formData.costCenter} onChange={(e) => setFormData({...formData, costCenter: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" required>
                <option value="">Selecione...</option>
                {data.costCenters.filter(cc => !activeSegmentId || activeSegmentId === 0 || cc.segmentId === activeSegmentId).map(cc => <option key={cc.id} value={cc.name}>{cc.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Data *</label>
            <input
              id="financial-date-input"
              type="date"
              value={formData.date ? formData.date.split('T')[0] : ''}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="md:col-span-2 flex space-x-3">
            <Button id="financial-submit-button" type="submit" className="bg-gradient-to-r from-green-500 to-blue-600">
              Salvar Transação
            </Button>
            <Button id="financial-cancel-button" type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Transação"
        size="md"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Segmento *</label>
            <select value={formData.segmentId} onChange={handleSegmentChange} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
              <option value="">Selecione um segmento</option>
              {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo *</label>
            <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value, costCenter: ''})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Descrição *</label>
            <input 
              type="text" 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="Descrição da transação" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Categoria *</label>
            <input 
              type="text" 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="Ex: Vendas, Compras, Serviços" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Valor *</label>
            <input 
              type="number" 
              step="0.01" 
              value={formData.amount} 
              onChange={(e) => setFormData({...formData, amount: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="0,00" 
              required
            />
          </div>
          {formData.type === 'despesa' && (
            <div>
              <label className="block text-sm font-medium mb-2">Centro de Custo *</label>
              <select value={formData.costCenter} onChange={(e) => setFormData({...formData, costCenter: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" required>
                <option value="">Selecione...</option>
                {data.costCenters.filter(cc => !activeSegmentId || activeSegmentId === 0 || cc.segmentId === activeSegmentId).map(cc => <option key={cc.id} value={cc.name}>{cc.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Data *</label>
            <input
              type="date"
              value={formData.date ? formData.date.split('T')[0] : ''}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div className="md:col-span-2 flex space-x-3">
            <Button type="submit" className="bg-gradient-to-r from-green-500 to-blue-600">
              Atualizar Transação
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
                </Button>
              </div>
        </form>
      </Modal>

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalhes da Transação"
        size="md"
      >
        {viewingTransaction && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                  <p className="text-lg font-medium">{viewingTransaction.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                    <p className={`font-medium ${viewingTransaction.type === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                      {viewingTransaction.type === 'receita' ? 'Receita' : 'Despesa'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Valor</label>
                    <p className={`text-lg font-bold ${viewingTransaction.type === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                      {viewingTransaction.type === 'receita' ? '+' : '-'}{formatCurrency(viewingTransaction.amount || 0)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Categoria</label>
                    <p className="font-medium">{viewingTransaction.category}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data</label>
                    <p className="font-medium">{formatDate(viewingTransaction.date)}</p>
                  </div>
                </div>
                
                {viewingTransaction.costCenter && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Centro de Custo</label>
                    <p className="font-medium">{viewingTransaction.costCenter}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Segmento</label>
                  <p className="font-medium">{segments.find(s => s.id === viewingTransaction.segmentId)?.name || 'N/A'}</p>
                </div>
              </div>
        )}
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmar Exclusão"
        size="sm"
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-muted-foreground mb-6">
            Tem certeza que deseja excluir a transação <strong>{currentTransaction?.description}</strong>? 
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
      </Modal>
    </motion.div>
  );
};

export default FinancialModule;
