'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Search,
  Filter,
  X,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Building,
  User
} from 'lucide-react';
import { useCustomers } from '@/hooks/usePartners';
import { updateCustomer, createCustomer } from '@/services/customersService';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData';
import { useRouter } from 'next/navigation';
import type { Customer } from '@/types';

export default function CustomersView() {
  const { items, loading, hasMore, loadMore, create, update, remove } = useCustomers();
  const { segments, activeSegmentId } = useAppData();
  const router = useRouter();

  // State management
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    segment_id: '',
    name: '',
    tipo_pessoa: 'pf',
    tax_id: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  const segmentOptions = useMemo(() => (segments || []).map((s: any) => ({ value: String(s.id), label: s.name })), [segments]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return items.filter((customer: any) => {
      const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           customer.tax_id?.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
      const matchesSegment = !activeSegmentId || activeSegmentId === '0' || 
                            (customer.segment_id && customer.segment_id === activeSegmentId);
      
      return matchesSearch && matchesStatus && matchesSegment;
    });
  }, [items, searchTerm, statusFilter, activeSegmentId]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalCustomers = filteredCustomers.length;
    const activeCustomers = filteredCustomers.filter((c: any) => c.status === 'active').length;
    const inactiveCustomers = filteredCustomers.filter((c: any) => c.status === 'inactive').length;
    const totalValue = filteredCustomers.reduce((sum: number, c: any) => sum + (c.total_value || 0), 0);
    const averageValue = totalCustomers > 0 ? totalValue / totalCustomers : 0;
    
    return {
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      totalValue,
      averageValue
    };
  }, [filteredCustomers]);

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
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'suspended':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
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
      case 'suspended':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  // Event handlers
  const handleAddNew = () => {
    setIsEditing(false);
    setSelectedCustomer(null);
    setFormData({
      segment_id: '',
      name: '',
      tipo_pessoa: 'pf',
      tax_id: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: ''
    });
    setShowForm(true);
  };

  const handleCompleteRegistration = () => {
    router.push('/customers/new');
  };

  const handleEdit = (customer: Customer) => {
    router.push(`/customers/${customer.id}/edit`);
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleDelete = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (selectedCustomer) {
      try {
        await remove(selectedCustomer.id);
        setShowDeleteConfirm(false);
        setSelectedCustomer(null);
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowViewModal(false);
    setShowDeleteConfirm(false);
    setSelectedCustomer(null);
    setIsEditing(false);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        segment_id: formData.segment_id ? formData.segment_id : null,
        tax_id: formData.tax_id || null,
        tipo_pessoa: formData.tipo_pessoa,
        status: 'active',
        roles: ['customer']
      };

      console.log('Payload para cliente:', payload);
      
      let result;
      if (isEditing && selectedCustomer) {
        console.log('Atualizando cliente:', selectedCustomer.id);
        const response = await updateCustomer(selectedCustomer.id, payload);
        result = response.success ? response.data?.customer : null;
      } else {
        console.log('Criando novo cliente');
        const response = await createCustomer(payload);
        result = response.success ? response.data?.customer : null;
      }

      console.log('Resultado da operação:', result);

      if (result) {
        setShowForm(false);
        setFormData({
          segment_id: '',
          name: '',
          tipo_pessoa: 'pf',
          tax_id: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: ''
        });
        setSelectedCustomer(null);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie seu cadastro de clientes</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            id="customers-simple-button" 
            onClick={handleAddNew} 
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Cadastro Simples
          </Button>
          <Button 
            id="customers-complete-button" 
            onClick={handleCompleteRegistration} 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Cadastro Completo
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold text-blue-400">{kpis.totalCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-2xl font-bold text-green-400">{kpis.activeCustomers}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clientes Inativos</p>
              <p className="text-2xl font-bold text-yellow-400">{kpis.inactiveCustomers}</p>
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
          <h3 className="text-lg font-semibold">Lista de Clientes</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar clientes..."
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
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
              <option value="suspended">Suspensos</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum cliente encontrado</h3>
            <p className="text-muted-foreground mb-4">Comece adicionando seu primeiro cliente</p>
            <div className="flex space-x-2 justify-center mt-4">
              <Button onClick={handleAddNew} variant="outline" className="border-blue-500 text-blue-500 hover:bg-blue-50">
                <Plus className="w-4 h-4 mr-2" />
                Cadastro Simples
              </Button>
              <Button onClick={handleCompleteRegistration} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Cadastro Completo
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="customers-table" className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Contato</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Localização</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Segmento</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Valor Total</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer: any) => (
                  <motion.tr
                    key={customer.id}
                    id={`customers-row-${customer.id}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.tax_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{customer.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{customer.phone || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{customer.city && customer.state ? `${customer.city}, ${customer.state}` : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                       {segments.find((s: any) => Number(s.id) === Number(customer.segment_id))?.name || 'N/A'}
                     </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                        {getStatusIcon(customer.status)}
                        <span className="ml-1 capitalize">{customer.status}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{formatCurrency(customer.total_value || 0)}</p>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          id={`customers-view-${customer.id}`} 
                          variant="ghost" 
                          size="sm" 
                          title="Visualizar" 
                          onClick={() => handleView(customer)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          id={`customers-edit-${customer.id}`} 
                          variant="ghost" 
                          size="sm" 
                          title="Editar" 
                          onClick={() => handleEdit(customer)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          id={`customers-delete-${customer.id}`} 
                          variant="ghost" 
                          size="sm" 
                          title="Excluir" 
                          onClick={() => handleDelete(customer)}
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
                  {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
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
                      id="customers-name-input"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="Nome do cliente"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      id="customers-email-input"
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
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Pessoa</label>
                    <select
                      id="customers-person-type-select"
                      value={formData.tipo_pessoa}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo_pessoa: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="pf">Pessoa Física</option>
                      <option value="pj">Pessoa Jurídica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">CPF/CNPJ</label>
                    <input
                      id="customers-doc-input"
                      type="text"
                      value={formData.tax_id || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Segmento</label>
                    <select
                      id="customers-segment-select"
                      value={formData.segment_id}
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
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="São Paulo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Estado</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="SP"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Endereço</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={handleCancel} className="bg-gray-100 text-gray-800 hover:bg-gray-200" id="customers-cancel-button">
                    Cancelar
                  </Button>
                  <Button id="customers-submit-button" type="submit">
                    {isEditing ? 'Atualizar' : 'Criar'} Cliente
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {showViewModal && selectedCustomer && (
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
                <h2 className="text-xl font-semibold">Detalhes do Cliente</h2>
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
                        <span className="font-medium">Nome:</span> {selectedCustomer.name}
                      </div>
                      <div>
                        <span className="font-medium">CPF/CNPJ:</span> {selectedCustomer.tax_id || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Segmento:</span> {segments.find((s: any) => Number(s.id) === Number(selectedCustomer.segment_id))?.name || 'N/A'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedCustomer.status || 'pendente')}`}>
                          {getStatusIcon(selectedCustomer.status || 'pendente')}
                          <span className="ml-1 capitalize">{selectedCustomer.status || 'pendente'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-2">Contato</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Email:</span> {selectedCustomer.email || 'N/A'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Telefone:</span> {selectedCustomer.phone || 'N/A'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Endereço:</span> {selectedCustomer.address || 'N/A'}
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
        {showDeleteConfirm && selectedCustomer && (
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
                  Tem certeza que deseja excluir o cliente <strong>{selectedCustomer.name}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-center gap-3">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                  <Button 
                    id="customers-confirm-delete" 
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
    </motion.div>
  );
}
