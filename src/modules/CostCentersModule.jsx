import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Plus, Edit, Trash2, Save, XCircle, CreditCard, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData.jsx';

const CostCentersModule = ({ toast }) => {
  const { data, activeSegmentId, ensureCostCentersLoaded, addCostCenter, updateCostCenter, deleteCostCenter, importData } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCostCenter, setCurrentCostCenter] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [costCenterAccounts, setCostCenterAccounts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

  const segments = data.segments || [];

  // Lazy load costCenters when component mounts
  useEffect(() => {
  
    ensureCostCentersLoaded();
  }, [ensureCostCentersLoaded]);

  // Load accounts when needed
  useEffect(() => {
    if (showAccountsModal) {
      loadAccounts();
      loadCostCenterAccounts();
    }
  }, [showAccountsModal, currentCostCenter]);

  const loadAccounts = async () => {
    try {
      const response = await fetch('/api/chart-of-accounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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

  const loadCostCenterAccounts = async () => {
    if (!currentCostCenter) return;
    
    try {
      const response = await fetch(`/api/cost-center-accounts/cost-center/${currentCostCenter.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const costCenterAccountsData = await response.json();
        setCostCenterAccounts(costCenterAccountsData);
      }
    } catch (error) {
      console.error('Error loading cost center accounts:', error);
    }
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentCostCenter(null);
    setFormData({ name: '', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
    setShowForm(true);
  };

  const handleEdit = (costCenter) => {
    setIsEditing(true);
    setCurrentCostCenter(costCenter);
    setFormData({ name: costCenter.name, segmentId: costCenter.segmentId });
    setShowForm(true);
  };

  const handleManageAccounts = (costCenter) => {
    setCurrentCostCenter(costCenter);
    setShowAccountsModal(true);
  };

  const handleDelete = (id) => {
    deleteCostCenter(id);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.segmentId) {
      toast({
        title: "Erro",
        description: "Nome e Segmento são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (isEditing && currentCostCenter) {
      updateCostCenter(currentCostCenter.id, { name: formData.name, segmentId: parseInt(formData.segmentId) });
    } else {
      addCostCenter({ name: formData.name, segmentId: parseInt(formData.segmentId) });
    }

    setShowForm(false);
    setFormData({ name: '', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
    setCurrentCostCenter(null);
    setIsEditing(false);
  };

  const handleAddAccount = async (accountId, allocationPercentage = 100, isPrimary = false) => {
    try {
      const response = await fetch('/api/cost-center-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          cost_center_id: currentCostCenter.id,
          account_id: accountId,
          allocation_percentage: allocationPercentage,
          is_primary: isPrimary
        })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Conta adicionada ao centro de custo.",
        });
        loadCostCenterAccounts();
      } else {
        const error = await response.json();
        toast({
          title: "Erro",
          description: error.error || "Erro ao adicionar conta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding account:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar conta.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAccount = async (relationshipId) => {
    try {
      const response = await fetch(`/api/cost-center-accounts/${relationshipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Conta removida do centro de custo.",
        });
        loadCostCenterAccounts();
      } else {
        toast({
          title: "Erro",
          description: "Erro ao remover conta.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error removing account:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover conta.",
        variant: "destructive"
      });
    }
  };

  const handleSegmentChange = (e) => {
    const newSegmentId = e.target.value;
    setFormData({ ...formData, segmentId: newSegmentId });
    if (isEditing && currentCostCenter) {
      // Salvar automaticamente ao alterar o segmento
      updateCostCenter(currentCostCenter.id, { name: formData.name, segmentId: parseInt(newSegmentId) });
    }
  };

  const costCenterHeaders = ['name', 'segmentId'];
  const filteredCostCenters = data.costCenters.filter(cc => {
    // Se activeSegmentId é 0 ou null (Todos os Segmentos), mostrar todos os centros de custo
    if (!activeSegmentId || activeSegmentId === 0) {
      return true;
    }
    // Se há um segmento específico selecionado, filtrar por esse segmento
    return cc.segmentId === activeSegmentId;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-500 bg-clip-text text-transparent">
            Gerenciar Centros de Custo
          </h1>
          <p className="text-muted-foreground mt-2">Adicione, edite ou remova centros de custo e suas contas contábeis.</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={(parsedData) => importData(parsedData, 'costCenters', activeSegmentId)}
            moduleName="Centros de Custo"
            expectedHeaders={costCenterHeaders}
          />
          <Button onClick={handleAddNew} className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Centro de Custo
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
              {isEditing ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="segmentId" className="block text-sm font-medium mb-1">Segmento</label>
                <select id="segmentId" value={formData.segmentId} onChange={handleSegmentChange} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
                  <option value="">Selecione um segmento</option>
                  {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="costCenterName" className="block text-sm font-medium mb-1">Nome do Centro de Custo</label>
                <input id="costCenterName" type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" placeholder="Ex: Administrativo, Vendas" />
              </div>
              <div className="flex space-x-3">
                <Button type="submit" className="bg-gradient-to-r from-teal-500 to-cyan-600">
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Salvar Alterações' : 'Adicionar'}
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
        <h3 className="text-lg font-semibold mb-4">Lista de Centros de Custo</h3>
        {filteredCostCenters.length === 0 ? (
          <p className="text-muted-foreground">Nenhum centro de custo cadastrado para este segmento.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Segmento</th>
                  <th className="text-center p-3">Contas</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCostCenters.map(cc => (
                  <motion.tr key={cc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{cc.name}</td>
                    <td className="p-3">{segments.find(s => String(s.id) === String(cc.segmentId))?.name || 'N/A'}</td>
                    <td className="p-3 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <CreditCard className="w-3 h-3 mr-1" />
                        {costCenterAccounts.filter(cca => cca.cost_center_id === cc.id).length} contas
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title="Gerenciar Contas" 
                          onClick={() => handleManageAccounts(cc)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(cc)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Excluir" onClick={() => handleDelete(cc.id)}>
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

      {/* Modal de Gerenciamento de Contas */}
      <AnimatePresence>
        {showAccountsModal && currentCostCenter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAccountsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-xl p-6 border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Contas Contábeis - {currentCostCenter.name}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAccountsModal(false)}
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Contas Atribuídas */}
                <div>
                  <h4 className="text-md font-semibold mb-3 text-green-600">Contas Atribuídas</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {costCenterAccounts.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Nenhuma conta atribuída</p>
                    ) : (
                      costCenterAccounts.map((cca) => (
                        <div key={cca.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                              <span className="font-medium text-sm">{cca.account_code}</span>
                              {cca.is_primary && (
                                <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                                  Principal
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{cca.account_name}</p>
                            <p className="text-xs text-gray-500">{cca.account_category}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">{cca.allocation_percentage}%</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAccount(cca.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Contas Disponíveis */}
                <div>
                  <h4 className="text-md font-semibold mb-3 text-blue-600">Contas Disponíveis</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {accounts.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Carregando contas...</p>
                    ) : (
                      accounts
                        .filter(account => !costCenterAccounts.some(cca => cca.account_id === account.id))
                        .map((account) => (
                          <div key={account.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                                <span className="font-medium text-sm">{account.account_code}</span>
                                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                                  account.account_type === 'expense' ? 'bg-red-200 text-red-800' :
                                  account.account_type === 'revenue' ? 'bg-green-200 text-green-800' :
                                  account.account_type === 'asset' ? 'bg-blue-200 text-blue-800' :
                                  account.account_type === 'liability' ? 'bg-orange-200 text-orange-800' :
                                  'bg-gray-200 text-gray-800'
                                }`}>
                                  {account.account_type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{account.account_name}</p>
                              <p className="text-xs text-gray-500">{account.account_category}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddAccount(account.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CostCentersModule;
