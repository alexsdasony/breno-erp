'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Users, CheckCircle, Clock, DollarSign, Search, Eye, Edit, Trash2,
  User, Mail, Phone, MapPin, X, AlertCircle, FileText, Building
} from 'lucide-react';
import { useSuppliers } from '../_hooks/useSuppliers';
import { Supplier } from '@/types';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData';
import SupplierForm from './SupplierForm';

export default function SuppliersView() {
  const { items: suppliers, loading, hasMore, loadMore, create, update, remove, load } = useSuppliers();
  const { segments } = useAppData();
  
  // State management
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Form data
  const [formData, setFormData] = useState({
    razao_social: '',
    nome_fantasia: '',
    tipo_contribuinte: 'PJ' as 'PJ' | 'PF' | 'MEI' | 'Outros',
    cpf_cnpj: '',
    email: '',
    telefone_celular: '',
    status: 'ativo' as 'ativo' | 'inativo',
    data_cadastro: new Date().toISOString().split('T')[0],
    segment_id: '',
    cidade: '',
    uf: '',
    endereco: '',
  });

  // Segment options
  const segmentOptions = useMemo(() => {
    return segments.map((segment: any) => ({
      value: segment.id,
      label: segment.name
    }));
  }, [segments]);

  // KPIs calculation
  const kpis = useMemo(() => {
    const totalSuppliers = suppliers.length;
    const activeSuppliers = suppliers.filter((s: any) => s.status === 'ativo' || s.status === 'active').length;
    const inactiveSuppliers = suppliers.filter((s: any) => s.status === 'inativo' || s.status === 'inactive').length;
    const totalValue = suppliers.reduce((sum: number, s: any) => sum + (s.total_value || 0), 0);
    
    return {
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      totalValue
    };
  }, [suppliers]);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier: any) => {
      const matchesSearch = (supplier.razao_social || supplier.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           (supplier.cpf_cnpj && supplier.cpf_cnpj.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, statusFilter]);

  // Utility functions
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ativo':
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'inativo':
      case 'inactive': return <Clock className="w-3 h-3" />;
      case 'suspended': return <X className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'inativo':
      case 'inactive': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'suspended': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Event handlers
  const handleAddNew = () => {
    setFormData({
      razao_social: '',
      nome_fantasia: '',
      tipo_contribuinte: 'PJ',
      cpf_cnpj: '',
      email: '',
      telefone_celular: '',
      status: 'ativo',
      data_cadastro: new Date().toISOString().split('T')[0],
      segment_id: '',
      cidade: '',
      uf: '',
      endereco: '',
    });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      razao_social: supplier.razao_social || supplier.name || '',
      nome_fantasia: supplier.nome_fantasia || '',
      tipo_contribuinte: supplier.tipo_contribuinte || (supplier.cnpj ? 'PJ' : 'PF'),
      cpf_cnpj: supplier.cpf_cnpj || supplier.cnpj || supplier.cpf || '',
      email: supplier.email || '',
      telefone_celular: supplier.telefone_celular || supplier.telefone || '',
      status: supplier.status || 'ativo',
      data_cadastro: supplier.data_cadastro || new Date().toISOString().split('T')[0],
      segment_id: supplier.segment_id || '',
      cidade: supplier.cidade || '',
      uf: supplier.uf || '',
      endereco: supplier.endereco || '',
    });
    setSelectedSupplier(supplier);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowViewModal(true);
  };

  const handleDelete = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDeleteConfirm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowViewModal(false);
    setShowDeleteConfirm(false);
    setSelectedSupplier(null);
    setIsEditing(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedSupplier) {
        await update(selectedSupplier.id, formData);
      } else {
        await create(formData);
      }
      handleCancel();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
    }
  };

  const confirmDelete = async () => {
    if (selectedSupplier) {
      try {
        console.log('Deleting supplier:', selectedSupplier.id);
        const success = await remove(selectedSupplier.id);
        if (success) {
          console.log('✅ Fornecedor excluído com sucesso');
          
          // Recarregar a lista para mostrar as alterações
          await load(true);
          console.log('🔄 Lista recarregada após exclusão');
          
          handleCancel();
        } else {
          console.error('❌ Falha ao excluir fornecedor');
        }
      } catch (error) {
        console.error('❌ Erro ao excluir fornecedor:', error);
      }
    }
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Gestão de Fornecedores
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie seu cadastro de fornecedores</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            id="suppliers-new-button" 
            onClick={handleAddNew} 
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Fornecedores</p>
              <p className="text-2xl font-bold text-green-400">{kpis.totalSuppliers}</p>
            </div>
            <Building className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fornecedores Ativos</p>
              <p className="text-2xl font-bold text-blue-400">{kpis.activeSuppliers}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fornecedores Inativos</p>
              <p className="text-2xl font-bold text-yellow-400">{kpis.inactiveSuppliers}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-purple-400">{formatCurrency(kpis.totalValue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Lista de Fornecedores</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="all">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
              <option value="active">Ativos (Legado)</option>
              <option value="inactive">Inativos (Legado)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando fornecedores...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum fornecedor encontrado</h3>
            <p className="text-muted-foreground mb-4">Comece adicionando seu primeiro fornecedor</p>
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Fornecedor
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="suppliers-table" className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Fornecedor</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Contato</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Localização</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Valor Total</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier: any) => (
                  <motion.tr
                    key={supplier.id}
                    id={`suppliers-row-${supplier.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                          <Building className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{supplier.razao_social || supplier.name}</p>
                          <p className="text-sm text-muted-foreground">{supplier.cpf_cnpj || supplier.cnpj || supplier.cpf}</p>
                          <p className="text-xs text-muted-foreground">{supplier.nome_fantasia}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{supplier.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{supplier.telefone_celular || supplier.telefone || supplier.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{supplier.cidade && supplier.uf ? `${supplier.cidade}, ${supplier.uf}` : supplier.cidade && supplier.estado ? `${supplier.cidade}, ${supplier.estado}` : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(supplier.status || 'inactive')}`}>
                        {getStatusIcon(supplier.status || 'inactive')}
                        <span className="ml-1 capitalize">{supplier.status === 'ativo' ? 'Ativo' : supplier.status === 'inativo' ? 'Inativo' : supplier.status || 'inactive'}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{formatCurrency(supplier.total_value || 0)}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          id={`suppliers-view-${supplier.id}`} 
                          variant="ghost" 
                          size="sm" 
                          title="Visualizar" 
                          onClick={() => handleView(supplier)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          id={`suppliers-edit-${supplier.id}`} 
                          variant="ghost" 
                          size="sm" 
                          title="Editar" 
                          onClick={() => handleEdit(supplier)}
                          className="text-blue-600 hover:text-blue-800"
                          data-testid="edit-supplier-button"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          id={`suppliers-delete-${supplier.id}`} 
                          variant="ghost" 
                          size="sm" 
                          title="Excluir" 
                          onClick={() => handleDelete(supplier)}
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
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button 
              disabled={loading} 
              onClick={() => void loadMore()}
              variant="outline"
            >
              {loading ? 'Carregando...' : 'Carregar mais'}
            </Button>
          </div>
        )}
      </motion.div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60" onClick={handleCancel} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-background border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
                </h2>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nome *</label>
                    <input
                      id="suppliers-name-input"
                      type="text"
                      required
                      value={formData.razao_social}
                                              onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Nome do fornecedor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      id="suppliers-email-input"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Telefone</label>
                    <input
                      type="tel"
                      value={formData.telefone_celular}
                                              onChange={(e) => setFormData(prev => ({ ...prev, telefone_celular: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Pessoa</label>
                    <select
                      id="suppliers-person-type-select"
                      value={formData.tipo_contribuinte}
                                              onChange={(e) => setFormData(prev => ({ ...prev, tipo_contribuinte: e.target.value as 'PJ' | 'PF' | 'MEI' | 'Outros' }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="PF">Pessoa Física</option>
                      <option value="PJ">Pessoa Jurídica</option>
                      <option value="MEI">MEI</option>
                      <option value="Outros">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">CPF/CNPJ</label>
                    <input
                      id="suppliers-doc-input"
                      type="text"
                      value={formData.cpf_cnpj}
                                              onChange={(e) => setFormData(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Segmento</label>
                    <select
                      id="suppliers-segment-select"
                      value={formData.segment_id || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, segment_id: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Sem segmento</option>
                      {segmentOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.cidade || ''}
                                              onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="São Paulo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <input
                      type="text"
                      value={formData.uf || ''}
                                              onChange={(e) => setFormData(prev => ({ ...prev, uf: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="SP"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Endereço</label>
                  <input
                    type="text"
                    value={formData.endereco || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel} className="bg-gray-100 text-gray-800 hover:bg-gray-200" id="suppliers-cancel-button">
                    Cancelar
                  </Button>
                  <Button id="suppliers-submit-button" type="submit">
                    {isEditing ? 'Atualizar' : 'Criar'} Fornecedor
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedSupplier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60" onClick={handleCancel} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-background border border-border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Detalhes do Fornecedor</h2>
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Informações Básicas</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium">Nome:</span> {selectedSupplier.name}
                      </div>
                      <div>
                        <span className="font-medium">CPF/CNPJ:</span> {selectedSupplier.cnpj || selectedSupplier.cpf || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Segmento:</span> {segments.find((s: any) => s.id === selectedSupplier.segment_id)?.name || 'N/A'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedSupplier.status || 'inactive')}`}>
                          {getStatusIcon(selectedSupplier.status || 'inactive')}
                          <span className="ml-1 capitalize">{selectedSupplier.status}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Contato</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span> {selectedSupplier.email || 'N/A'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Telefone:</span> {selectedSupplier.telefone || 'N/A'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Endereço:</span> {selectedSupplier.endereco || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-muted-foreground mb-4">Estatísticas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-xl font-bold text-green-600">{formatCurrency(0)}</p>
                      <p className="text-sm text-muted-foreground">Valor Total</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <FileText className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-xl font-bold text-blue-600">0</p>
                      <p className="text-sm text-muted-foreground">Pedidos</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 text-center">
                      <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <p className="text-xl font-bold text-purple-600">
                        N/A
                      </p>
                      <p className="text-sm text-muted-foreground">Último Pedido</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && selectedSupplier && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60" onClick={handleCancel} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-background border border-border rounded-xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Confirmar Exclusão</h3>
                <p className="text-muted-foreground mb-6">
                  Tem certeza que deseja excluir o fornecedor <strong>{selectedSupplier.name}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button 
                    id="suppliers-confirm-delete" 
                    onClick={confirmDelete} 
                    variant="destructive"
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Supplier Form Modal */}
      {showForm && (
        <SupplierForm
          supplier={selectedSupplier}
          isOpen={showForm}
          onClose={() => {
            setShowForm(false);
            setSelectedSupplier(null);
          }}
        onSubmit={async (data) => {
          console.log('🚀 SuppliersView onSubmit chamado com dados:', data);
          try {
            if (selectedSupplier) {
              console.log('📝 Atualizando fornecedor:', selectedSupplier.id);
              const result = await update(selectedSupplier.id, data);
              console.log('✅ Fornecedor atualizado:', result);
            } else {
              console.log('🆕 Criando novo fornecedor');
              const result = await create(data);
              console.log('✅ Fornecedor criado:', result);
            }
            
            // Recarregar a lista para mostrar as alterações
            await load(true);
            console.log('🔄 Lista recarregada');
            
            console.log('🎉 onSubmit concluído com sucesso');
          } catch (error) {
            console.error('❌ Erro em onSubmit:', error);
            // Não re-lançar o erro para permitir que o modal feche
          }
        }}
        isLoading={loading}
        />
      )}
    </motion.div>
  );
}
