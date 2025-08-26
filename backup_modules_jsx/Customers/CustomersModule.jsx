import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import Modal from '@/components/ui/modal';
import { usePartners } from '../Partners/hooks/usePartners';
import { useAppData } from '@/hooks/useAppData';
import { formatCurrency, formatDate } from '@/lib/utils.js';
import { useRouter } from 'next/navigation';

const CustomersModule = () => {
  const router = useRouter();
  const { activeSegmentId, data, metrics } = useAppData();
  const { partners: customers, loading, remove } = usePartners({ 
    role: 'customer', 
    segmentId: activeSegmentId 
  });

  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const handleCreateCustomer = () => {
    router.push('/customer-form');
  };

  const handleEditCustomer = (customer) => {
    router.push(`/customer-form/${customer.id}`);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleDeleteCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await remove(selectedCustomer.id);
      setShowDeleteConfirm(false);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
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

  const customerHeaders = ['name', 'email', 'phone', 'tax_id', 'status', 'segmentId'];
  const filteredCustomers = customers.filter(c => {
    if (!activeSegmentId || activeSegmentId === 0) {
      return true;
    }
    return c.segment_id === activeSegmentId;
  });
  const segments = data.segments || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie seu cadastro de clientes</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={(parsedData) => {
              // TODO: Implementar importação
              console.log('Import data:', parsedData);
            }}
            moduleName="Clientes"
            expectedHeaders={customerHeaders}
          />
          <Button id="customers-new-button" onClick={handleCreateCustomer} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold text-blue-400">{metrics?.totalCustomers || filteredCustomers.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
        </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clientes Ativos</p>
              <p className="text-2xl font-bold text-green-400">
                {filteredCustomers.filter(c => c.status === 'active').length}
              </p>
      </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} className="glass-effect rounded-xl p-6 gradient-card border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatCurrency(metrics?.totalCustomerValue || 0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>
      </div>

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
            <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando clientes...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
            <Button onClick={handleCreateCustomer} className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Cliente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table id="customers-table" className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Cliente</th>
                  <th className="text-left p-3">Contato</th>
                  <th className="text-left p-3">Segmento</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Valor</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <motion.tr
                    key={customer.id}
                    id={`customers-row-${customer.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
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
                          <span className="text-sm">{customer.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-muted-foreground">
                        {segments.find(s => s.id === customer.segment_id)?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {getStatusIcon(customer.status)}
                        <span className="ml-1 capitalize">{customer.status}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <p className="font-medium">{formatCurrency(customer.total_value || 0)}</p>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button id={`customers-view-${customer.id}`} variant="ghost" size="sm" title="Visualizar" onClick={() => handleViewCustomer(customer)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button id={`customers-edit-${customer.id}`} variant="ghost" size="sm" title="Editar" onClick={() => handleEditCustomer(customer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button id={`customers-delete-${customer.id}`} variant="ghost" size="sm" title="Excluir" onClick={() => handleDeleteCustomer(customer)}>
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

      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalhes do Cliente"
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Informações Básicas</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Nome</label>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">CPF/CNPJ</label>
                    <p className="font-medium">{selectedCustomer.tax_id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Segmento</label>
                    <p className="font-medium">{segments.find(s => s.id === selectedCustomer.segment_id)?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Status</label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status)}`}>
                      {getStatusIcon(selectedCustomer.status)}
                      <span className="ml-1 capitalize">{selectedCustomer.status}</span>
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Contato</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Telefone</label>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Endereço</label>
                    <p className="font-medium">{selectedCustomer.address || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-3">Informações Financeiras</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(selectedCustomer.total_value || 0)}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Pedidos</p>
                  <p className="text-xl font-bold text-blue-600">{selectedCustomer.orders_count || 0}</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Última Compra</p>
                  <p className="text-xl font-bold text-purple-600">{selectedCustomer.last_order_date ? formatDate(selectedCustomer.last_order_date) : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmar Exclusão"
        size="sm"
      >
        <div className="space-y-4">
          <p>Tem certeza que deseja excluir o cliente <strong>{selectedCustomer?.name}</strong>?</p>
          <p className="text-sm text-muted-foreground">Esta ação não pode ser desfeita.</p>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
              Cancelar
            </Button>
            <Button id="customers-confirm-delete" onClick={confirmDelete} variant="destructive" className="flex-1">
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CustomersModule;