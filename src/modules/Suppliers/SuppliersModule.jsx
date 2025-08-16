import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Plus, 
  Edit, 
  Trash2,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Building,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { usePartners } from './hooks/usePartners';
import { useAppData } from '@/hooks/useAppData';
import { formatCurrency } from '@/lib/utils.js';

const SuppliersModule = () => {
  const { activeSegmentId, data } = useAppData();
  const { partners: suppliers, loading, create, update, remove } = usePartners({ 
    role: 'supplier', 
    segmentId: activeSegmentId 
  });

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSupplier, setCurrentSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    tax_id: '',
    segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
  });

  const filteredSuppliers = suppliers.filter(s => {
    if (!activeSegmentId || activeSegmentId === 0) {
      return true;
    }
    return s.segment_id === activeSegmentId;
  });
  const segments = data.segments || [];

  const handleAddNew = () => {
    setIsEditing(false);
    setCurrentSupplier(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      tax_id: '',
      segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
    });
    setShowForm(true);
  };

  const handleEdit = (supplier) => {
    setIsEditing(true);
    setCurrentSupplier(supplier);
    setFormData({
      name: supplier.name || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      tax_id: supplier.tax_id || '',
      segmentId: supplier.segment_id || activeSegmentId || (data.segments?.[0]?.id || '')
    });
    setShowForm(true);
  };

  const handleDelete = async (supplier) => {
    try {
      await remove(supplier.id);
    } catch (error) {
      console.error('Erro ao excluir fornecedor:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }

    try {
      const supplierData = {
        ...formData,
        roles: ['supplier'],
        segment_id: formData.segmentId
      };

      if (isEditing && currentSupplier) {
        await update(currentSupplier.id, supplierData);
      } else {
        await create(supplierData);
      }

      setShowForm(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        tax_id: '',
        segmentId: activeSegmentId || (data.segments?.[0]?.id || '')
      });
      setCurrentSupplier(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
    }
  };

  const getStatusIcon = (status) => {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'suspended':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            Gestão de Fornecedores
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie seu cadastro de fornecedores</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={(rows) => {
              // TODO: Implementar importação
              console.log('Import data:', rows);
            }} 
            moduleName="Fornecedores" 
            expectedHeaders={['name', 'email', 'phone', 'address', 'city', 'state', 'tax_id', 'segmentId']}
          />
          <Button id="suppliers-new-button" onClick={handleAddNew} className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Fornecedor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Fornecedores</p>
              <p className="text-2xl font-bold text-orange-400">{filteredSuppliers.length}</p>
            </div>
            <Truck className="w-8 h-8 text-orange-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Fornecedores Ativos</p>
              <p className="text-2xl font-bold text-green-400">
                {filteredSuppliers.filter(s => s.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-red-400">
                {formatCurrency(filteredSuppliers.reduce((sum, s) => sum + (Number(s.total_value || 0)), 0))}
              </p>
            </div>
            <Building className="w-8 h-8 text-red-400" />
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
              {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="supplierName" className="block text-sm font-medium mb-1">Nome do Fornecedor</label>
                  <input
                    id="supplierName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Nome da empresa"
                  />
                </div>
                <div>
                  <label htmlFor="supplierEmail" className="block text-sm font-medium mb-1">Email</label>
                  <input
                    id="supplierEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="email@empresa.com"
                  />
                </div>
                <div>
                  <label htmlFor="supplierPhone" className="block text-sm font-medium mb-1">Telefone</label>
                  <input
                    id="supplierPhone"
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                <div>
                  <label htmlFor="supplierTaxId" className="block text-sm font-medium mb-1">CNPJ</label>
                  <input
                    id="supplierTaxId"
                    type="text"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label htmlFor="supplierAddress" className="block text-sm font-medium mb-1">Endereço</label>
                  <input
                    id="supplierAddress"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Rua, número"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label htmlFor="supplierCity" className="block text-sm font-medium mb-1">Cidade</label>
                    <input
                      id="supplierCity"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="São Paulo"
                    />
                  </div>
                  <div>
                    <label htmlFor="supplierState" className="block text-sm font-medium mb-1">Estado</label>
                    <input
                      id="supplierState"
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="SP"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="supplierSegment" className="block text-sm font-medium mb-1">Segmento</label>
                  <select
                    id="supplierSegment"
                    value={formData.segmentId}
                    onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button id="suppliers-submit-button" type="submit" className="bg-gradient-to-r from-orange-500 to-red-600">
                  {isEditing ? 'Salvar Alterações' : 'Adicionar Fornecedor'}
                </Button>
                <Button id="suppliers-cancel-button" type="button" variant="outline" onClick={() => setShowForm(false)}>
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
          <h3 className="text-lg font-semibold">Lista de Fornecedores</h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar fornecedores..."
                className="pl-10 pr-4 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando fornecedores...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum fornecedor encontrado.</p>
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Fornecedor
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="suppliers-table" className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Fornecedor</th>
                  <th className="text-left p-3">Contato</th>
                  <th className="text-left p-3">Localização</th>
                  <th className="text-left p-3">Segmento</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map(supplier => (
                  <motion.tr
                    key={supplier.id}
                    id={`suppliers-row-${supplier.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <Building className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{supplier.name}</p>
                          <p className="text-sm text-muted-foreground">{supplier.tax_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{supplier.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{supplier.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{supplier.city}, {supplier.state}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{supplier.address}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground">
                        {segments.find(s => s.id === supplier.segment_id)?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                        {getStatusIcon(supplier.status)}
                        <span className="ml-1 capitalize">{supplier.status}</span>
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button id={`suppliers-edit-${supplier.id}`} variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(supplier)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button id={`suppliers-delete-${supplier.id}`} variant="ghost" size="sm" title="Excluir" onClick={() => handleDelete(supplier)}>
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

export default SuppliersModule;


