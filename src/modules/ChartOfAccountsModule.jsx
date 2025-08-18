import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Plus, Edit, Trash2, Save, XCircle, Search, Filter, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData';
import apiService from '@/services/api';

const ChartOfAccountsModule = () => {
  const { data, activeSegmentId, toast } = useAppData();
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [formData, setFormData] = useState({
    account_code: '',
    account_name: '',
    account_type: '',
    account_category: '',
    description: '',
    parent_account_id: '',
    segment_id: activeSegmentId || ''
  });

  const segments = data.segments || [];

  // Load accounts when component mounts and when segment changes
  useEffect(() => {
    loadAccounts();
  }, [activeSegmentId]);

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/chart-of-accounts', {
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });
      if (response.ok) {
        const accountsData = await response.json();
        setAccounts(accountsData);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
    }
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentAccount(null);
    setFormData({
      account_code: '',
      account_name: '',
      account_type: '',
      account_category: '',
      description: '',
      parent_account_id: '',
      segment_id: activeSegmentId || ''
    });
    setShowForm(true);
  };

  const handleEdit = (account) => {
    setIsEditing(true);
    setCurrentAccount(account);
    setFormData({
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type,
      account_category: account.account_category,
      description: account.description || '',
      parent_account_id: account.parent_account_id || '',
      segment_id: account.segment_id || activeSegmentId || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/chart-of-accounts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiService.getToken()}`
        }
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Conta contábil excluída com sucesso.",
        });
        loadAccounts();
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.error || "Erro ao excluir conta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir conta.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.account_code || !formData.account_name || !formData.account_type || !formData.account_category) {
      toast({
        title: "Erro",
        description: "Código, nome, tipo e categoria são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      const url = isEditing ? `/api/chart-of-accounts/${currentAccount.id}` : '/api/chart-of-accounts';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiService.getToken()}`
        },
        body: JSON.stringify({
          account_code: formData.account_code,
          account_name: formData.account_name,
          account_type: formData.account_type,
          account_category: formData.account_category,
          description: formData.description,
          parent_account_id: formData.parent_account_id || null,
          segment_id: formData.segment_id || null
        })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: isEditing ? "Conta contábil atualizada com sucesso." : "Conta contábil criada com sucesso.",
        });
        setShowForm(false);
        loadAccounts();
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.error || "Erro ao salvar conta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error saving account:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar conta.",
        variant: "destructive"
      });
    }
  };

  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'asset': return 'bg-blue-100 text-blue-800';
      case 'liability': return 'bg-orange-100 text-orange-800';
      case 'equity': return 'bg-purple-100 text-purple-800';
      case 'revenue': return 'bg-green-100 text-green-800';
      case 'expense': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccountTypeLabel = (type) => {
    switch (type) {
      case 'asset': return 'Ativo';
      case 'liability': return 'Passivo';
      case 'equity': return 'Patrimônio';
      case 'revenue': return 'Receita';
      case 'expense': return 'Despesa';
      default: return type;
    }
  };

  const filteredAccounts = accounts.filter(account => 
    !activeSegmentId || account.segment_id === activeSegmentId
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Plano de Contas
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie o plano de contas contábeis da empresa.</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Conta
          </Button>
        </div>
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
              {isEditing ? 'Editar Conta Contábil' : 'Nova Conta Contábil'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="accountCode" className="block text-sm font-medium mb-1">Código da Conta</label>
                <input
                  id="accountCode"
                  type="text"
                  value={formData.account_code}
                  onChange={(e) => setFormData({...formData, account_code: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Ex: 1.1.1.01"
                />
              </div>
              <div>
                <label htmlFor="accountName" className="block text-sm font-medium mb-1">Nome da Conta</label>
                <input
                  id="accountName"
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Caixa"
                />
              </div>
              <div>
                <label htmlFor="accountType" className="block text-sm font-medium mb-1">Tipo</label>
                <select
                  id="accountType"
                  value={formData.account_type}
                  onChange={(e) => setFormData({...formData, account_type: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="asset">Ativo</option>
                  <option value="liability">Passivo</option>
                  <option value="equity">Patrimônio Líquido</option>
                  <option value="revenue">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              </div>
              <div>
                <label htmlFor="accountCategory" className="block text-sm font-medium mb-1">Categoria</label>
                <input
                  id="accountCategory"
                  type="text"
                  value={formData.account_category}
                  onChange={(e) => setFormData({...formData, account_category: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Ex: Disponível"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Descrição da conta"
                  rows="3"
                />
              </div>
              <div>
                <label htmlFor="parentAccount" className="block text-sm font-medium mb-1">Conta Pai (Opcional)</label>
                <select
                  id="parentAccount"
                  value={formData.parent_account_id}
                  onChange={(e) => setFormData({...formData, parent_account_id: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Nenhuma (Conta raiz)</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.account_code} - {account.account_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="segmentId" className="block text-sm font-medium mb-1">Segmento (Opcional)</label>
                <select
                  id="segmentId"
                  value={formData.segment_id}
                  onChange={(e) => setFormData({...formData, segment_id: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todos os segmentos</option>
                  {segments.map(segment => (
                    <option key={segment.id} value={segment.id}>{segment.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-3">
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Salvar Alterações' : 'Criar Conta'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-effect rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4">Lista de Contas Contábeis</h3>
        {filteredAccounts.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma conta contábil cadastrada.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Código</th>
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Tipo</th>
                  <th className="text-left p-3">Categoria</th>
                  <th className="text-left p-3">Segmento</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map(account => (
                  <motion.tr key={account.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-mono text-sm">{account.account_code}</td>
                    <td className="p-3 font-medium">{account.account_name}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.account_type)}`}>
                        {getAccountTypeLabel(account.account_type)}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{account.account_category}</td>
                    <td className="p-3 text-sm">{account.segment_name || 'Todos'}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(account)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Excluir" onClick={() => handleDelete(account.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ChartOfAccountsModule; 