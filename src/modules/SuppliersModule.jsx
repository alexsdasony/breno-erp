import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Edit, Eye, Trash2, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData.jsx';

const SuppliersModule = ({ toast, importData, addPartner, updatePartner, deletePartner }) => {
  const { data, activeSegmentId, loadPartners } = useAppData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const params = { role: 'supplier' };
    if (activeSegmentId && activeSegmentId !== 0) {
      params.segment_id = activeSegmentId;
    }
    loadPartners(params).catch(() => {});
  }, [activeSegmentId, loadPartners]);

  const suppliers = (data.partners || []).filter(p => (p.roles || p.partner_roles || []).some(r => r.role === 'supplier'));

  const [formData, setFormData] = useState({
    name: '',
    tax_id: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    status: 'active',
    segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
  });

  const resetForm = () => {
    setFormData({
      name: '', tax_id: '', email: '', phone: '', address: '', city: '', state: '', zip_code: '', status: 'active',
      segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
    });
    setSelected(null);
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const segments = data.segments || [];

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, role: 'supplier' };
      await addPartner(payload);
      toast?.({ title: 'Fornecedor criado!' });
      await loadPartners({ role: 'supplier' });
      resetForm();
    } catch (error) {
      console.error('Create supplier error:', error);
      toast?.({ title: 'Erro!', description: 'Falha ao criar fornecedor.', variant: 'destructive' });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      const payload = { ...formData };
      await updatePartner(selected.id, payload);
      toast?.({ title: 'Fornecedor atualizado!' });
      await loadPartners({ role: 'supplier' });
      resetForm();
    } catch (error) {
      console.error('Update supplier error:', error);
      toast?.({ title: 'Erro!', description: 'Falha ao atualizar fornecedor.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await deletePartner(selected.id);
      toast?.({ title: 'Fornecedor excluído!', variant: 'destructive' });
      await loadPartners({ role: 'supplier' });
      setShowDeleteConfirm(false);
      setSelected(null);
    } catch (error) {
      console.error('Delete supplier error:', error);
      toast?.({ title: 'Erro!', description: 'Falha ao excluir fornecedor.', variant: 'destructive' });
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-500 bg-clip-text text-transparent">Gestão de Fornecedores</h1>
          <p className="text-muted-foreground mt-2">Gerencie seus parceiros com papel de fornecedor</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton onImport={(rows) => importData(rows, 'partners', activeSegmentId)} moduleName="Fornecedores" expectedHeaders={[
            'name','tax_id','email','phone','address','city','state','zip_code','status','segment_id'
          ]} />
          <Button id="suppliers-new-button" onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-emerald-700">
            <Plus className="w-4 h-4 mr-2" />Novo Fornecedor
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Fornecedores</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2"/>Buscar</Button>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2"/>Filtrar</Button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96 scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Fornecedor</th>
                <th className="text-left p-3">Contato</th>
                <th className="text-left p-3">Endereço</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(partner => (
                <tr key={partner.id} id={`suppliers-row-${partner.id}`} data-testid={`suppliers-row-${partner.id}`} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{partner.name}</p>
                      <p className="text-sm text-muted-foreground">{partner.tax_id}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm">{partner.email}</p>
                      <p className="text-xs text-muted-foreground">{partner.phone || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm">{partner.city}, {partner.state}</div>
                    <div className="text-xs text-muted-foreground">{partner.address || 'N/A'}</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${partner.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {partner.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(partner); setShowViewModal(true); }}><Eye className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(partner); setFormData({
                        name: partner.name || '', tax_id: partner.tax_id || '', email: partner.email || '', phone: partner.phone || '',
                        address: partner.address || '', city: partner.city || '', state: partner.state || '', zip_code: partner.zip_code || '',
                        status: partner.status || 'active', segmentId: partner.segment_id || activeSegmentId
                      }); setShowEditModal(true); }}><Edit className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => { setSelected(partner); setShowDeleteConfirm(true); }}><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Create */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Novo Fornecedor" size="lg">
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Segmento</label>
           <select id="suppliers-segment-select" value={formData.segmentId} onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })} required className="w-full p-3 bg-muted border border-border rounded-lg">
              <option value="">Selecione um segmento</option>
              {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nome</label>
            <input id="suppliers-name-input" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CPF/CNPJ</label>
            <input id="suppliers-doc-input" value={formData.tax_id} onChange={(e)=>setFormData({...formData, tax_id:e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">E-mail</label>
            <input id="suppliers-email-input" type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <input value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg" />
          </div>
          <div className="md:col-span-2 flex space-x-3">
            <Button id="suppliers-submit-button" type="submit" className="bg-gradient-to-r from-blue-500 to-emerald-600">Salvar</Button>
            <Button type="button" variant="outline" onClick={()=>setShowCreateModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      {/* View */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Detalhes do Fornecedor" size="md">
        {selected && (
          <div className="space-y-2 text-sm">
            <div><strong>Nome:</strong> {selected.name}</div>
            <div><strong>Documento:</strong> {selected.tax_id || 'N/A'}</div>
            <div><strong>Contato:</strong> {selected.email} {selected.phone ? `• ${selected.phone}` : ''}</div>
            <div><strong>Endereço:</strong> {selected.address || 'N/A'}, {selected.city} - {selected.state}</div>
            <div><strong>Status:</strong> {selected.status}</div>
          </div>
        )}
      </Modal>

      {/* Edit */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Editar Fornecedor" size="lg">
        <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Segmento</label>
            <select value={formData.segmentId} onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })} required className="w-full p-3 bg-muted border border-border rounded-lg">
              <option value="">Selecione um segmento</option>
              {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nome</label>
            <input value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">CPF/CNPJ</label>
            <input value={formData.tax_id} onChange={(e)=>setFormData({...formData, tax_id:e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">E-mail</label>
            <input type="email" value={formData.email} onChange={(e)=>setFormData({...formData, email:e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <input value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} className="w-full p-3 bg-muted border border-border rounded-lg" />
          </div>
          <div className="md:col-span-2 flex space-x-3">
            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-emerald-600">Salvar</Button>
            <Button type="button" variant="outline" onClick={()=>setShowEditModal(false)}>Cancelar</Button>
          </div>
        </form>
      </Modal>

      {/* Delete */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirmar Exclusão" size="sm" showCloseButton={false}>
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-muted-foreground mb-6">Tem certeza que deseja excluir o fornecedor <strong>{selected?.name}</strong>?</p>
          <div className="flex space-x-3 justify-center">
            <Button variant="destructive" onClick={handleDelete}>Sim, Excluir</Button>
            <Button variant="outline" onClick={()=>setShowDeleteConfirm(false)}>Cancelar</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default SuppliersModule;


