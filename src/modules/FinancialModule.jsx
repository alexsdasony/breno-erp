import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData.jsx';

const FinancialModule = ({ metrics, addTransaction, toast, importData }) => {
  const { data, activeSegmentId } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'receita',
    description: '',
    amount: '',
    category: '',
    costCenter: '',
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

  const handleSubmit = (e) => {
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
    
    addTransaction({
      ...formData,
      amount: parseFloat(formData.amount),
      costCenter: formData.type === 'receita' ? null : formData.costCenter,
      segmentId: parseInt(formData.segmentId)
    });
    
    setFormData({ type: 'receita', description: '', amount: '', category: '', costCenter: '', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
    setShowForm(false);
  };

  const transactionHeaders = ['type', 'description', 'amount', 'category', 'costCenter', 'date', 'segmentId'];
  const filteredTransactions = data.transactions.filter(t => !activeSegmentId || t.segmentId === activeSegmentId);
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
            expectedHeaders={transactionHeaders}
          />
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700">
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
              <p className="text-2xl font-bold text-green-400">R$ {(metrics.totalRevenue || 0).toLocaleString('pt-BR')}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Despesas</p>
              <p className="text-2xl font-bold text-red-400">R$ {(metrics.totalExpenses || 0).toLocaleString('pt-BR')}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lucro Líquido</p>
              <p className={`text-2xl font-bold ${(metrics.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>R$ {(metrics.profit || 0).toLocaleString('pt-BR')}</p>
            </div>
            <DollarSign className={`w-8 h-8 ${metrics.profit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
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
            <h3 className="text-lg font-semibold mb-4">Nova Transação</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Segmento</label>
                <select value={formData.segmentId} onChange={(e) => setFormData({...formData, segmentId: e.target.value})} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="">Selecione um segmento</option>
                  {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tipo</label>
                <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value, costCenter: ''})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="transactionDescription" className="block text-sm font-medium mb-2">Descrição</label>
                <input 
                  id="transactionDescription"
                  name="description"
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="Descrição da transação" 
                />
              </div>
              <div>
                <label htmlFor="transactionCategory" className="block text-sm font-medium mb-2">Categoria</label>
                <input 
                  id="transactionCategory"
                  name="category"
                  type="text" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="Ex: Vendas, Compras, Serviços" 
                />
              </div>
              <div>
                <label htmlFor="transactionAmount" className="block text-sm font-medium mb-2">Valor</label>
                <input 
                  id="transactionAmount"
                  name="amount"
                  type="number" 
                  step="0.01" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
                  placeholder="0,00" 
                />
              </div>
              {formData.type === 'despesa' && (
                <div>
                  <label className="block text-sm font-medium mb-2">Centro de Custo</label>
                  <select value={formData.costCenter} onChange={(e) => setFormData({...formData, costCenter: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                    <option value="">Selecione...</option>
                    {data.costCenters.filter(cc => !activeSegmentId || cc.segmentId === activeSegmentId).map(cc => <option key={cc.id} value={cc.name}>{cc.name}</option>)}
                  </select>
                </div>
              )}
              <div className="md:col-span-2 flex space-x-3">
                <Button type="submit" className="bg-gradient-to-r from-green-500 to-blue-600">Salvar Transação</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Todas as Transações</h3>
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
                <th className="text-left p-3">Descrição</th>
                <th className="text-left p-3">Segmento</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-right p-3">Valor</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map(transaction => (
                <motion.tr key={transaction.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">{transaction.date}</td>
                  <td className="p-3 font-medium">{transaction.description}</td>
                  <td className="p-3">{segments.find(s => s.id === transaction.segmentId)?.name || 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${transaction.type === 'receita' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {transaction.type === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`p-3 text-right font-medium ${transaction.type === 'receita' ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.type === 'receita' ? '+' : '-'}R$ {(transaction.amount || 0).toLocaleString('pt-BR')}
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

export default FinancialModule;
