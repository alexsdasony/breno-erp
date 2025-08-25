'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, Building, Edit, Trash2, Users } from 'lucide-react';
import { useCostCenters } from '../_hooks/useCostCenters';
import { useAppData } from '@/hooks/useAppData';
import { Button } from '@/components/ui/button';

export default function CostCentersView() {
  const { items, loading, hasMore, loadMore, create, update, remove } = useCostCenters();
  const { segments } = useAppData();

  // Create form state
  const [showForm, setShowForm] = React.useState(false);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [budget, setBudget] = React.useState<string>('');
  const [manager, setManager] = React.useState(''); // Somente visual (não persiste no backend)
  const [code, setCode] = React.useState('');
  const [status, setStatus] = React.useState<'active' | 'inactive'>('active');
  const [segmentId, setSegmentId] = React.useState<string>('');

  // Search/filter
  const [query, setQuery] = React.useState('');

  const filteredCostCenters = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((cc: any) =>
      (cc.name || '').toLowerCase().includes(q) ||
      (cc.description || '').toLowerCase().includes(q) ||
      (cc.code || '').toLowerCase().includes(q)
    );
  }, [items, query]);

  const formatCurrency = (val?: number) => {
    const n = typeof val === 'number' ? val : 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Edit inline state (opcional)
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');
  const [editDescription, setEditDescription] = React.useState('');
  const [editCode, setEditCode] = React.useState('');
  const [editBudget, setEditBudget] = React.useState<string>('');
  const [editStatus, setEditStatus] = React.useState<'active' | 'inactive'>('active');

  // Delete confirmation
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    await create({
      name,
      description,
      code: code || null,
      budget: budget ? parseFloat(budget) : 0,
      status,
      segment_id: segmentId || null,
    });
    setName('');
    setDescription('');
    setBudget('');
    setManager('');
    setCode('');
    setStatus('active');
    setSegmentId('');
    setShowForm(false);
  };

  const startEdit = (cc: any) => {
    setEditingId(cc.id);
    setEditName(cc.name || '');
    setEditDescription(cc.description || '');
    setEditCode(cc.code || '');
    setEditBudget(cc.budget ? String(cc.budget) : '');
    setEditStatus((cc.status as any) || 'active');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditDescription('');
    setEditCode('');
    setEditBudget('');
    setEditStatus('active');
  };

  const onSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName) return;
    await update(editingId, {
      name: editName,
      description: editDescription,
      code: editCode || null,
      budget: editBudget ? parseFloat(editBudget) : 0,
      status: editStatus,
    });
    cancelEdit();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Centros de Custo</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar centros de custo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button id="cost-centers-new-button" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancelar' : 'Novo'}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass-effect rounded-xl p-6 border"
          >
            <form className="grid grid-cols-1 md:grid-cols-12 gap-4" onSubmit={onSubmit}>
              <div className="md:col-span-4">
                <label htmlFor="costCenterName" className="block text-sm font-medium mb-1">Nome</label>
                <input
                  id="costCenterName"
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Centro de Custo"
                  required
                />
              </div>
              <div>
                <label htmlFor="costCenterManager" className="block text-sm font-medium mb-1">Responsável</label>
                <input
                  id="costCenterManager"
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  value={manager}
                  onChange={(e) => setManager(e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
              <div>
                <label htmlFor="costCenterBudget" className="block text-sm font-medium mb-1">Orçamento</label>
                <input
                  id="costCenterBudget"
                  type="number"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label htmlFor="costCenterSegment" className="block text-sm font-medium mb-1">Segmento</label>
                <select
                  id="costCenterSegment"
                  value={segmentId}
                  onChange={(e) => setSegmentId(e.target.value)}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione...</option>
                  {segments.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-12">
                <label htmlFor="costCenterDescription" className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  id="costCenterDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Descrição do centro de custo"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-3 md:col-span-12">
                <Button id="cost-centers-submit-button" type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600" disabled={loading}>
                  {loading ? 'Salvando...' : 'Adicionar Centro de Custo'}
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
        transition={{ delay: 0.05 }}
        className="glass-effect rounded-xl p-6 border overflow-x-auto"
      >
        {filteredCostCenters.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum centro de custo encontrado.</p>
            <Button onClick={() => setShowForm(true)} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Centro de Custo
            </Button>
          </div>
        ) : (
          <table id="cost-centers-table" className="w-full text-sm">
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
              {filteredCostCenters.map((cc: any) => (
                <motion.tr
                  key={cc.id}
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
                        <p className="font-medium">{cc.name}</p>
                        <p className="text-sm text-muted-foreground">{cc.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{(cc as any).manager || '-'}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-muted-foreground">
                      {segments.find((s: any) => s.id === cc.segment_id)?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3">
                    <p className="font-medium">{formatCurrency((cc as any).budget)}</p>
                  </td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (cc as any).status === 'inactive' ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {(cc as any).status === 'inactive' ? 'Inativo' : 'Ativo'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-1">
                      <Button id={`cost-centers-edit-${cc.id}`} variant="ghost" size="sm" title="Editar" onClick={() => startEdit(cc)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button id={`cost-centers-delete-${cc.id}`} variant="ghost" size="sm" title="Excluir" onClick={() => setConfirmId(cc.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>

      <div className="flex gap-2">
        <Button disabled={loading || !hasMore} onClick={() => void loadMore()}>
          {loading ? 'Carregando...' : hasMore ? 'Carregar mais' : 'Fim da lista'}
        </Button>
      </div>

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
  );
}
