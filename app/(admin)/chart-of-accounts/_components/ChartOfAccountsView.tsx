'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Plus, 
  Building, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  X,
  Target,
  TrendingUp,
  FileText,
  CreditCard,
  PieChart
} from 'lucide-react';
import { useChartOfAccounts } from '../_hooks/useChartOfAccounts';
import { Button } from '@/components/ui/button';

interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  created_at?: string;
  updated_at?: string;
}

export default function ChartOfAccountsView() {
  const { items, loading, hasMore, loadMore, create, update, remove } = useChartOfAccounts();

  // State management
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ChartOfAccount | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Form data
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | ''
  });

  // Legacy form state for compatibility
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | ''>('');
  const [codeError, setCodeError] = React.useState<string | null>(null);
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [typeError, setTypeError] = React.useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editCode, setEditCode] = React.useState('');
  const [editName, setEditName] = React.useState('');
  const [editType, setEditType] = React.useState<'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | ''>('');

  // Search/filter
  const [query, setQuery] = React.useState('');

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return items.filter((account: any) => {
      const matchesSearch = account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || account.type === typeFilter;
      const matchesQuery = !query.trim() || 
                          (account.name || '').toLowerCase().includes(query.trim().toLowerCase()) ||
                          (account.code || '').toLowerCase().includes(query.trim().toLowerCase());
      
      return matchesSearch && matchesType && matchesQuery;
    });
  }, [items, searchTerm, typeFilter, query]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalAccounts = filteredAccounts.length;
    const assetAccounts = filteredAccounts.filter((acc: any) => acc.type === 'asset').length;
    const liabilityAccounts = filteredAccounts.filter((acc: any) => acc.type === 'liability').length;
    const equityAccounts = filteredAccounts.filter((acc: any) => acc.type === 'equity').length;
    const revenueAccounts = filteredAccounts.filter((acc: any) => acc.type === 'revenue').length;
    const expenseAccounts = filteredAccounts.filter((acc: any) => acc.type === 'expense').length;
    
    return {
      totalAccounts,
      assetAccounts,
      liabilityAccounts,
      equityAccounts,
      revenueAccounts,
      expenseAccounts
    };
  }, [filteredAccounts]);

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'asset': return <Building className="w-4 h-4 text-blue-400" />;
      case 'liability': return <CreditCard className="w-4 h-4 text-red-400" />;
      case 'equity': return <PieChart className="w-4 h-4 text-purple-400" />;
      case 'revenue': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'expense': return <DollarSign className="w-4 h-4 text-yellow-400" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'asset': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'liability': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'equity': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'revenue': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'expense': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'asset': return 'Ativo';
      case 'liability': return 'Passivo';
      case 'equity': return 'Patrimônio';
      case 'revenue': return 'Receita';
      case 'expense': return 'Despesa';
      default: return 'Desconhecido';
    }
  };

  // Event handlers
  const handleAddNew = () => {
    setIsEditing(false);
    setSelectedAccount(null);
    setFormData({ code: '', name: '', type: '' });
    setShowForm(true);
  };

  const handleEdit = (account: ChartOfAccount) => {
    setIsEditing(true);
    setSelectedAccount(account);
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type
    });
    setShowForm(true);
  };

  const handleView = (account: ChartOfAccount) => {
    setSelectedAccount(account);
    setShowViewModal(true);
  };

  const handleDelete = (account: ChartOfAccount) => {
    setSelectedAccount(account);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedAccount) {
      await remove(selectedAccount.id);
      setShowDeleteConfirm(false);
      setSelectedAccount(null);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name || !type) return;
    await create({ code, name, type });
    setCode('');
    setName('');
    setType('');
    setShowForm(false);
  };

  const startEdit = (acc: { id: string; code?: string | null; name?: string | null; type?: any }) => {
    setEditingId(acc.id);
    setEditCode(acc.code || '');
    setEditName(acc.name || '');
    setEditType((acc.type as any) || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditCode('');
    setEditName('');
    setEditType('');
  };

  const onSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editCode || !editName || !editType) return;
    await update(editingId, { code: editCode, name: editName, type: editType });
    cancelEdit();
  };

  const cancelAndReset = () => {
    setCode('');
    setName('');
    setType('');
    setShowForm(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Plano de Contas
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie as contas contábeis da empresa</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleAddNew} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Contas</p>
              <p className="text-2xl font-bold text-blue-400">{kpis.totalAccounts}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold text-green-400">{kpis.assetAccounts}</p>
            </div>
            <Building className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Passivos</p>
              <p className="text-2xl font-bold text-yellow-400">{kpis.liabilityAccounts}</p>
            </div>
            <CreditCard className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receitas</p>
              <p className="text-2xl font-bold text-purple-400">{kpis.revenueAccounts}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="text-2xl font-bold text-red-400">{kpis.expenseAccounts}</p>
            </div>
            <DollarSign className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="glass-effect rounded-xl p-6 border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar contas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos os tipos</option>
              <option value="asset">Ativo</option>
              <option value="liability">Passivo</option>
              <option value="equity">Patrimônio</option>
              <option value="revenue">Receita</option>
              <option value="expense">Despesa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="glass-effect rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground w-1/3">Conta</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground w-1/6">Código</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground w-1/6">Tipo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground w-1/6">Criado em</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-muted-foreground w-1/6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <FileText className="w-12 h-12 text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma conta encontrada</h3>
                        <p className="text-muted-foreground mb-4">Comece criando sua primeira conta contábil</p>
                        <Button
                          onClick={handleAddNew}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Nova Conta
                        </Button>
                      </div>
                    </div>
                  </td>
                </tr>
                ) : (
                  filteredAccounts.map((account: any, index: number) => (
                    <motion.tr 
                      key={account.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-700/50 transition-all duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                            {getTypeIcon(account.type)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{account.name}</div>
                            <div className="text-sm text-gray-400">{account.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 font-mono">{account.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(account.type)}`}>
                          {getTypeName(account.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          {account.created_at ? formatDate(account.created_at) : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleView(account)}
                            className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-200"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEdit(account)}
                            className="p-2 text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-200"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(account)}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
              aria-modal="true"
              role="dialog"
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowForm(false)} />
              {/* Modal panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                className="relative bg-gray-800 border border-gray-700 rounded-xl w-[95vw] max-w-2xl max-h-[85vh] overflow-auto p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    {isEditing ? 'Editar Conta' : 'Nova Conta'}
                  </h2>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Código <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Ex: 1.1.01"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      placeholder="Nome da conta"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    >
                      <option value="">Selecione o tipo</option>
                      <option value="asset">Ativo</option>
                      <option value="liability">Passivo</option>
                      <option value="equity">Patrimônio Líquido</option>
                      <option value="revenue">Receita</option>
                      <option value="expense">Despesa</option>
                    </select>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Criar Conta'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                      className="px-6"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* View Modal */}
        <AnimatePresence>
          {showViewModal && selectedAccount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
              aria-modal="true"
              role="dialog"
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowViewModal(false)} />
              {/* Modal panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                className="relative bg-gray-800 border border-gray-700 rounded-xl w-[95vw] max-w-2xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">Detalhes da Conta</h2>
                  <button 
                    onClick={() => setShowViewModal(false)}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      {getTypeIcon(selectedAccount.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedAccount.name}</h3>
                      <p className="text-gray-400">Código: {selectedAccount.code}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(selectedAccount.type)}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(selectedAccount.type)}`}>
                          {getTypeName(selectedAccount.type)}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Criado em</label>
                      <p className="text-white">
                        {selectedAccount.created_at ? formatDate(selectedAccount.created_at) : '-'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => {
                        setShowViewModal(false);
                        handleEdit(selectedAccount);
                      }}
                      className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowViewModal(false)}
                      className="px-6"
                    >
                      Fechar
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && selectedAccount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
              aria-modal="true"
              role="dialog"
            >
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowDeleteConfirm(false)} />
              {/* Modal panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 8 }}
                className="relative bg-gray-800 border border-gray-700 rounded-xl w-[95vw] max-w-md p-6"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Confirmar Exclusão</h2>
                    <p className="text-gray-400 text-sm">Esta ação não pode ser desfeita</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-300 mb-2">
                    Tem certeza que deseja excluir a conta:
                  </p>
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <p className="font-semibold text-white">{selectedAccount.name}</p>
                    <p className="text-sm text-gray-400">Código: {selectedAccount.code}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={confirmDelete}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {loading ? 'Excluindo...' : 'Excluir'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-6"
                  >
                    Cancelar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </motion.div>
  );
}

