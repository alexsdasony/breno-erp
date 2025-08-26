import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Filter,
  DollarSign,
  Users,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData';
import { useCostCenters } from '@/modules/CostCenters/hooks/useCostCenters';
import { formatCurrency } from '@/lib/utils.js';

const CostCentersModule = () => {
  const { data, activeSegmentId, toast } = useAppData();
  const { costCenters, loading, create, update, remove, loadMore, hasMore } = useCostCenters({ 
    segmentId: activeSegmentId 
  });
  
  // Cost centers are loaded via useCostCenters hook

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCostCenter, setCurrentCostCenter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    manager: '',
    segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
  });

  const filteredCostCenters = (costCenters || []).filter(cc => {
    if (!activeSegmentId || activeSegmentId === 0) {
      return true;
    }
    return cc.segment_id === activeSegmentId;
  });
  const segments = data.segments || [];

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentCostCenter(null);
    setFormData({
      name: '',
      description: '',
      budget: '',
      manager: '',
      segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
    });
    setShowForm(true);
  };

  const handleEdit = (costCenter) => {
    setIsEditing(true);
    setCurrentCostCenter(costCenter);
    setFormData({
      name: costCenter.name || '',
      description: costCenter.description || '',
      budget: costCenter.budget || '',
      manager: costCenter.manager || '',
      segmentId: costCenter.segment_id || activeSegmentId || (data.segments?.[0]?.id || '')
    });
    setShowForm(true);
  };

  const handleDelete = async (costCenter) => {
    if (window.confirm('Tem certeza que deseja excluir este centro de custo?')) {
      await remove(costCenter.id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Erro", description: "O nome do centro de custo é obrigatório.", variant: "destructive" });
      return;
    }

    try {
      const costCenterData = {
        ...formData,
        budget: parseFloat(formData.budget) || 0,
        segment_id: formData.segmentId
      };

      if (isEditing && currentCostCenter) {
        await update(currentCostCenter.id, costCenterData);
      } else {
        await create(costCenterData);
      }
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        budget: '',
        manager: '',
        segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
      });
      setCurrentCostCenter(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar centro de custo:', error);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Centros de Custo
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie os centros de custo da sua empresa</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={(rows) => importData(rows, 'cost-centers', activeSegmentId)} 
            moduleName="Centros de Custo" 
            expectedHeaders={['name', 'description', 'budget', 'manager', 'segmentId']}
          />
          <Button id="cost-centers-new-button" onClick={handleAddNew} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Centro de Custo
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Centros</p>
              <p className="text-2xl font-bold text-indigo-400">{filteredCostCenters.length}</p>
            </div>
            <Building className="w-8 h-8 text-indigo-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Orçamento Total</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(filteredCostCenters.reduce((sum, cc) => sum + (cc.budget || 0), 0))}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold text-purple-400">
                {filteredCostCenters.filter(cc => cc.status === 'active').length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
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
              {isEditing ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="costCenterName" className="block text-sm font-medium mb-1">Nome do Centro</label>
                  <input
                    id="costCenterName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Nome do centro de custo"
                  />
                </div>
                <div>
                  <label htmlFor="costCenterManager" className="block text-sm font-medium mb-1">Responsável</label>
                  <input
                    id="costCenterManager"
                    type="text"
                    value={formData.manager}
                    onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Nome do responsável"
                  />
                </div>
                <div>
                  <label htmlFor="costCenterBudget" className="block text-sm font-medium mb-1">Orçamento</label>
                  <input
                    id="costCenterBudget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label htmlFor="costCenterSegment" className="block text-sm font-medium mb-1">Segmento</label>
                  <select
                    id="costCenterSegment"
                    value={formData.segmentId}
                    onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="costCenterDescription" className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  id="costCenterDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Descrição do centro de custo"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <Button id="cost-centers-submit-button" type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Centro de Custo'}
                </Button>
                <Button id="cost-centers-cancel-button" type="button" variant="outline" onClick={() => setShowForm(false)}>
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
          <h3 className="text-lg font-semibold">Lista de Centros de Custo</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar centros de custo..."
                className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {filteredCostCenters.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum centro de custo encontrado.</p>
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Centro de Custo
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="cost-centers-table" className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Centro de Custo</th>
                  <th className="text-left p-3">Responsável</th>
                  <th className="text-left p-3">Segmento</th>
                  <th className="text-left p-3">Orçamento</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCostCenters.map(costCenter => (
                  <motion.tr
                    key={costCenter.id}
                    id={`cost-centers-row-${costCenter.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{costCenter.name}</p>
                          <p className="text-sm text-muted-foreground">{costCenter.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{costCenter.manager}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground">
                        {segments.find(s => s.id === costCenter.segment_id)?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{formatCurrency(costCenter.budget)}</p>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        costCenter.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {costCenter.status === 'active' ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button id={`cost-centers-edit-${costCenter.id}`} variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(costCenter)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button id={`cost-centers-delete-${costCenter.id}`} variant="ghost" size="sm" title="Excluir" onClick={() => handleDelete(costCenter)}>
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

export default CostCentersModule;
