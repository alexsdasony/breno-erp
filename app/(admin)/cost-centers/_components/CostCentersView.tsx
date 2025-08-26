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
  TrendingUp
} from 'lucide-react';
import { useCostCenters } from '../_hooks/useCostCenters';
import { useAppData } from '@/hooks/useAppData';
import { Button } from '@/components/ui/button';

interface CostCenter {
  id: string;
  name: string;
  description?: string;
  segment_id?: string | null;
  budget?: number;
  status: 'active' | 'inactive';
  manager_id?: string | null;
  code?: string;
}

export default function CostCentersView() {
  const { items, loading, hasMore, loadMore, create, update, remove } = useCostCenters();
  const { segments, data } = useAppData();
  const users = data?.users || [];

  // State management
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    segment_id: '',
    budget: '',
    status: 'active' as 'active' | 'inactive',
    manager_id: ''
  });

  // Legacy form state for compatibility
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [segmentId, setSegmentId] = React.useState<string>('');
  const [budget, setBudget] = React.useState<string>('');
  const [status, setStatus] = React.useState<'active' | 'inactive'>('active');
  const [managerId, setManagerId] = React.useState<string>('');
  const [nameError, setNameError] = React.useState<string | null>(null);
  const [segmentError, setSegmentError] = React.useState<string | null>(null);
  const [budgetError, setBudgetError] = React.useState<string | null>(null);
  const [managerError, setManagerError] = React.useState<string | null>(null);

  // Search/filter
  const [query, setQuery] = React.useState('');

  // Filtered cost centers
  const filteredCostCenters = useMemo(() => {
    return items.filter((cc: any) => {
      const matchesSearch = cc.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           cc.code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || cc.status === statusFilter;
      const matchesQuery = !query.trim() || 
                          (cc.name || '').toLowerCase().includes(query.trim().toLowerCase()) ||
                          (cc.description || '').toLowerCase().includes(query.trim().toLowerCase()) ||
                          (cc.code || '').toLowerCase().includes(query.trim().toLowerCase());
      
      return matchesSearch && matchesStatus && matchesQuery;
    });
  }, [items, searchTerm, statusFilter, query]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalCostCenters = filteredCostCenters.length;
    const activeCostCenters = filteredCostCenters.filter((cc: any) => cc.status === 'active').length;
    const inactiveCostCenters = filteredCostCenters.filter((cc: any) => cc.status === 'inactive').length;
    const totalBudget = filteredCostCenters.reduce((sum: number, cc: any) => sum + (cc.budget || 0), 0);
    const averageBudget = totalCostCenters > 0 ? totalBudget / totalCostCenters : 0;
    
    return {
      totalCostCenters,
      activeCostCenters,
      inactiveCostCenters,
      totalBudget,
      averageBudget
    };
  }, [filteredCostCenters]);

  // Utility functions
  const formatCurrency = (val?: number) => {
    const n = typeof val === 'number' ? val : 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

  // Event handlers
  const handleAddNew = () => {
    setIsEditing(false);
    setSelectedCostCenter(null);
    setFormData({
      name: '',
      description: '',
      segment_id: '',
      budget: '',
      status: 'active',
      manager_id: ''
    });
    // Reset legacy form state
    setName('');
    setDescription('');
    setSegmentId('');
    setBudget('');
    setStatus('active');
    setManagerId('');
    setShowForm(true);
  };

  const handleEdit = (costCenter: CostCenter) => {
    setIsEditing(true);
    setSelectedCostCenter(costCenter);
    setFormData({
      name: costCenter.name || '',
      description: costCenter.description || '',
      segment_id: costCenter.segment_id?.toString() || '',
      budget: costCenter.budget?.toString() || '',
      status: costCenter.status || 'active',
      manager_id: costCenter.manager_id || ''
    });
    // Set legacy form state
    setName(costCenter.name || '');
    setDescription(costCenter.description || '');
    setSegmentId(costCenter.segment_id?.toString() || '');
    setBudget(costCenter.budget?.toString() || '');
    setStatus(costCenter.status || 'active');
    setManagerId(costCenter.manager_id || '');
    setShowForm(true);
  };

  const handleView = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setShowViewModal(true);
  };

  const handleDelete = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedCostCenter) {
      try {
        await remove(selectedCostCenter.id);
        setShowDeleteConfirm(false);
        setSelectedCostCenter(null);
      } catch (error) {
        console.error('Erro ao excluir centro de custo:', error);
      }
    }
  };

  // Edit mode (reutiliza o formulário superior)
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Ref do formulário para submit programático (atalho Enter)
  const formRef = React.useRef<HTMLFormElement | null>(null);

  // Ref para foco automático no campo Nome
  const nameInputRef = React.useRef<HTMLInputElement | null>(null);

  // Atalhos de teclado quando modal/form estiver aberto
  React.useEffect(() => {
    if (!showForm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelAndReset();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement | null;
        const tag = (target?.tagName || '').toUpperCase();
        const isTextArea = tag === 'TEXTAREA';
        const isButton = tag === 'BUTTON';
        if (!isTextArea && !isButton) {
          e.preventDefault();
          formRef.current?.requestSubmit();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showForm]);

  // Foco inicial no campo Nome ao abrir a modal
  React.useEffect(() => {
    if (!showForm) return;
    const t = window.setTimeout(() => {
      if (nameInputRef.current) {
        nameInputRef.current.focus();
        if (editingId) nameInputRef.current.select();
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [showForm, editingId]);

  // Delete confirmation
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validações
    const trimmed = name.trim();
    let valid = true;
    if (!trimmed || trimmed.length < 2) {
      setNameError('Informe um nome com pelo menos 2 caracteres.');
      valid = false;
    } else {
      setNameError(null);
    }
    if (segmentId && !isUuid(segmentId)) {
      setSegmentError('Segmento inválido.');
      valid = false;
    } else {
      setSegmentError(null);
    }
    if (budget) {
      const b = parseFloat(budget);
      if (isNaN(b) || b < 0) {
        setBudgetError('Orçamento inválido.');
        valid = false;
      } else {
        setBudgetError(null);
      }
    } else {
      setBudgetError(null);
    }
    if (managerId && !isUuid(managerId)) {
      setManagerError('Responsável inválido.');
      valid = false;
    } else {
      setManagerError(null);
    }
    if (!valid) return;

    if (editingId) {
      await update(editingId, {
        name: trimmed,
        description: description || null,
        // Não alterar segmento no update pelo formulário de edição
        budget: budget ? parseFloat(budget) : 0,
        status,
        manager_id: managerId || null,
      });
    } else {
      await create({
        name: trimmed,
        description: description || null,
        segment_id: segmentId || null,
        budget: budget ? parseFloat(budget) : 0,
        status,
        manager_id: managerId || null,
      });
    }
    // Reset
    setEditingId(null);
    setName('');
    setDescription('');
    setSegmentId('');
    setBudget('');
    setStatus('active');
    setManagerId('');
    setShowForm(false);
  };

  const startEdit = (cc: any, ev?: React.MouseEvent) => {
    ev?.preventDefault();
    ev?.stopPropagation();
    setEditingId(cc.id);
    setName(cc.name || '');
    setDescription(cc.description || '');
    setSegmentId(cc.segment_id || '');
    setBudget(cc.budget ? String(cc.budget) : '');
    setStatus((cc.status as any) || 'active');
    setManagerId(cc.manager_id || '');
    // Defer para evitar que o mesmo clique feche a modal via backdrop
    window.setTimeout(() => setShowForm(true), 0);
  };

  // Função auxiliar para cancelar e limpar o formulário
  const cancelAndReset = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setSegmentId('');
    setBudget('');
    setStatus('active');
    setManagerId('');
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Gestão de Centros de Custo</h1>
            <p className="text-gray-400 mt-1">Gerencie e monitore seus centros de custo</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Centro de Custo
          </motion.button>
        </motion.div>

        {/* KPIs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{kpis.totalCostCenters}</p>
              </div>
              <Building className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ativos</p>
                <p className="text-2xl font-bold text-green-400">{kpis.activeCostCenters}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-yellow-500/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Inativos</p>
                <p className="text-2xl font-bold text-yellow-400">{kpis.inactiveCostCenters}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-400" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Orçamento Total</p>
                <p className="text-2xl font-bold text-purple-400">{formatCurrency(kpis.totalBudget)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Orçamento Médio</p>
                <p className="text-2xl font-bold text-indigo-400">{formatCurrency(kpis.averageBudget)}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 p-6 rounded-xl border border-gray-700"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nome, descrição ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>
          </div>
        </motion.div>

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
            <div className="absolute inset-0 bg-black/60" onClick={cancelAndReset} />
            {/* Modal panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              className="relative glass-effect border rounded-xl w-[95vw] max-w-4xl max-h-[85vh] overflow-auto p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{editingId ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}</h2>
                <button aria-label="Fechar" className="px-2 py-1 rounded-md border border-white/10" onClick={cancelAndReset}>Esc</button>
              </div>
              <form ref={formRef} className="grid grid-cols-1 md:grid-cols-12 gap-4" onSubmit={onSubmit} noValidate>
              <div className="md:col-span-8">
                <label htmlFor="costCenterName" className="block text-sm font-medium mb-1">Nome<span className="text-red-500">*</span></label>
                <input
                  id="costCenterName"
                  ref={nameInputRef}
                  className={`w-full p-3 bg-muted border rounded-lg focus:ring-2 focus:ring-primary ${nameError ? 'border-red-500 focus:ring-red-500' : 'border-border'}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => {
                    const trimmed = name.trim();
                    setNameError(!trimmed || trimmed.length < 2 ? 'Informe um nome com pelo menos 2 caracteres.' : null);
                  }}
                  placeholder="Centro de Custo"
                  aria-invalid={!!nameError}
                  aria-describedby="costCenterName-error"
                />
                {nameError && (
                  <p id="costCenterName-error" className="mt-1 text-xs text-red-400">{nameError}</p>
                )}
              </div>
              <div className="md:col-span-4">
                <label htmlFor="costCenterSegment" className="block text-sm font-medium mb-1">Segmento{editingId ? ' (não alterável na edição)' : ''}</label>
                <select
                  id="costCenterSegment"
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                  onBlur={() => setSegmentError(segmentId && !isUuid(segmentId) ? 'Segmento inválido.' : null)}
                  className={`w-full p-3 bg-muted border rounded-lg focus:ring-2 ${segmentError ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
                  disabled={!!editingId}
                  aria-invalid={!!segmentError}
                  aria-describedby="costCenterSegment-error"
                >
                  <option value="">Selecione...</option>
                  {segments.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                {segmentError && (
                  <p id="costCenterSegment-error" className="mt-1 text-xs text-red-400">{segmentError}</p>
                )}
              </div>
              <div className="md:col-span-12">
                <label htmlFor="costCenterDescription" className="block text-sm font-medium mb-1">Descrição <span className="text-xs text-muted-foreground">(opcional)</span></label>
                <textarea
                  id="costCenterDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Descrição do centro de custo"
                  rows={3}
                />
              </div>
              <div className="md:col-span-4">
                <label htmlFor="costCenterBudget" className="block text-sm font-medium mb-1">Orçamento (R$)</label>
                <input
                  id="costCenterBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  onBlur={() => {
                    if (budget) {
                      const b = parseFloat(budget);
                      setBudgetError(isNaN(b) || b < 0 ? 'Orçamento inválido.' : null);
                    } else setBudgetError(null);
                  }}
                  className={`w-full p-3 bg-muted border rounded-lg focus:ring-2 ${budgetError ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
                  aria-invalid={!!budgetError}
                  aria-describedby="costCenterBudget-error"
                  placeholder="0,00"
                />
                {budgetError && (
                  <p id="costCenterBudget-error" className="mt-1 text-xs text-red-400">{budgetError}</p>
                )}
              </div>
              <div className="md:col-span-4">
                <label htmlFor="costCenterStatus" className="block text-sm font-medium mb-1">Status</label>
                <select
                  id="costCenterStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-3 bg-muted border rounded-lg focus:ring-2 border-border focus:ring-primary"
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <div className="md:col-span-4">
                <label htmlFor="costCenterManager" className="block text-sm font-medium mb-1">Responsável</label>
                <select
                  id="costCenterManager"
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  onBlur={() => setManagerError(managerId && !isUuid(managerId) ? 'Responsável inválido.' : null)}
                  className={`w-full p-3 bg-muted border rounded-lg focus:ring-2 ${managerError ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'}`}
                  aria-invalid={!!managerError}
                  aria-describedby="costCenterManager-error"
                >
                  <option value="">Selecione...</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name || u.email}</option>
                  ))}
                </select>
                {managerError && (
                  <p id="costCenterManager-error" className="mt-1 text-xs text-red-400">{managerError}</p>
                )}
              </div>
              <div className="flex items-center gap-3 md:col-span-12">
                <Button id="cost-centers-submit-button" type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600" disabled={loading || !!nameError || !!segmentError}>
                  {loading ? 'Salvando...' : editingId ? 'Salvar Alterações (Enter)' : 'Adicionar Centro de Custo (Enter)'}
                </Button>
                <Button id="cost-centers-cancel-button" type="button" variant="outline" onClick={cancelAndReset}>
                  {editingId ? 'Cancelar Edição (Esc)' : 'Cancelar (Esc)'}
                </Button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

        {/* Cost Centers Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Centro de Custo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Descrição</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Gestor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Segmento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Orçamento</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredCostCenters.map((cc: any, index: number) => (
                  <motion.tr 
                    key={cc.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Building className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-white">{cc.name}</div>
                          {cc.code && <div className="text-sm text-gray-400">{cc.code}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300">{cc.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      {cc.manager_id ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-300" />
                          </div>
                          <span className="text-sm text-gray-300">
                            {users.find((u: any) => u.id === cc.manager_id)?.name || 'Gestor não encontrado'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-300">
                        {cc.segment_id ? (
                          segments.find((s: any) => s.id === cc.segment_id)?.name || 'Segmento não encontrado'
                        ) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="font-semibold text-green-400">{formatCurrency(cc.budget)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(cc.status)}
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(cc.status)}`}>
                          {cc.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleView(cc)}
                          className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startEdit(cc)}
                          className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-all duration-200"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(cc)}
                          className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="p-6 border-t border-gray-700">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={loadMore}
                disabled={loading}
                className="w-full py-3 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Carregando...' : 'Carregar mais'}
              </motion.button>
            </div>
          )}

          {/* Empty State */}
          {filteredCostCenters.length === 0 && (
            <div className="p-12 text-center">
              <Building className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">Nenhum centro de custo encontrado</h3>
              <p className="text-gray-500 mb-6">Comece criando seu primeiro centro de custo</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddNew}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Criar Centro de Custo
              </motion.button>
            </div>
          )}
        </motion.div>

      <div className="flex gap-2">
        <Button disabled={loading || !hasMore} onClick={() => void loadMore()}>
          {loading ? 'Carregando...' : hasMore ? 'Carregar mais' : 'Fim da lista'}
        </Button>
      </div>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && selectedCostCenter && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-black/60" onClick={() => setShowDeleteConfirm(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Confirmar Exclusão</h3>
                    <p className="text-sm text-gray-400">Esta ação não pode ser desfeita</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-300 mb-2">
                    Tem certeza que deseja excluir o centro de custo:
                  </p>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <p className="font-semibold text-white">{selectedCostCenter.name}</p>
                    {selectedCostCenter.description && (
                      <p className="text-sm text-gray-400">{selectedCostCenter.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legacy Delete Confirmation Modal */}
        {confirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-neutral-900 border border-white/10 rounded-md p-6 max-w-sm w-full">
              <div className="text-lg font-medium mb-2">Você tem certeza?</div>
              <p className="text-sm text-gray-400 mb-4">Esta ação não poderá ser desfeita.</p>
              <div className="flex justify-end gap-2">
                <button className="px-3 py-2 rounded-md border border-white/10" onClick={() => setConfirmId(null)}>Cancelar</button>
                <button className="px-3 py-2 rounded-md border border-red-500 text-red-400" onClick={async () => { await remove(confirmId); setConfirmId(null); }}>Excluir</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
