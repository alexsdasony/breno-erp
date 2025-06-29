import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, Plus, Edit, Trash2, Save, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData.jsx';

const CostCentersModule = ({ addCostCenter, updateCostCenter, deleteCostCenter, toast, importData }) => {
  const { data, activeSegmentId, ensureCostCentersLoaded } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCostCenter, setCurrentCostCenter] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

  const segments = data.segments || [];

  // Lazy load costCenters when component mounts
  useEffect(() => {
    console.log('🔄 CostCentersModule: Ensuring costCenters are loaded...');
    ensureCostCentersLoaded();
  }, [ensureCostCentersLoaded]);

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
      updateCostCenter({ ...currentCostCenter, name: formData.name, segmentId: parseInt(formData.segmentId) });
    } else {
      addCostCenter({ name: formData.name, segmentId: parseInt(formData.segmentId) });
    }

    setShowForm(false);
    setFormData({ name: '', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
    setCurrentCostCenter(null);
    setIsEditing(false);
  };

  const costCenterHeaders = ['name', 'segmentId'];
  const filteredCostCenters = data.costCenters.filter(cc => !activeSegmentId || cc.segmentId === activeSegmentId);

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
          <p className="text-muted-foreground mt-2">Adicione, edite ou remova centros de custo.</p>
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
                <select id="segmentId" value={formData.segmentId} onChange={(e) => setFormData({...formData, segmentId: e.target.value})} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
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
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCostCenters.map(cc => (
                  <motion.tr key={cc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{cc.name}</td>
                    <td className="p-3">{segments.find(s => s.id === cc.segmentId)?.name || 'N/A'}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(cc)}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" title="Excluir" onClick={() => handleDelete(cc.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
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
