import React, { useState, useEffect } from 'react';
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
import { useAppData } from '@/hooks/useAppData.jsx';
import { formatCurrency, formatDate } from '@/lib/utils.js';
import { useRouter } from 'next/navigation';

const CustomersModule = () => {
  const router = useRouter();
  const { data, activeSegmentId, loadPartners, metrics, toast, deleteCustomer, importData } = useAppData();
  
  // Carregar clientes (via partners role=customer) ao montar e ao trocar de segmento
  useEffect(() => {
    const params = { role: 'customer' };
    // a API de partners atualmente não filtra por segment_id, mas manteremos padrão
    if (activeSegmentId && activeSegmentId !== 0) {
      params.segment_id = activeSegmentId;
    }
    // SEMPRE buscar dados frescos da API
    loadPartners(params).catch(() => {});
  }, [activeSegmentId, loadPartners]);

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
      await deleteCustomer(selectedCustomer.id);
      toast({ title: 'Cliente excluído!', description: `${selectedCustomer.name} foi excluído com sucesso.` });
      setShowDeleteConfirm(false);
      setSelectedCustomer(null);
      // Sempre buscar dados frescos
      await loadPartners({ role: 'customer' });
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
  const customersFromPartners = (data.partners || []).filter(p => (p.roles || p.partner_roles || []).some(r => r.role === 'customer'));
  const filteredCustomers = customersFromPartners.filter(c => {
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
            onImport={(parsedData) => importData(parsedData, 'partners', activeSegmentId)}
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
              <p className="text-sm text-muted-foreground">Valor Total em Compras</p>
              <p className="text-2xl font-bold text-purple-400">
                {formatCurrency(filteredCustomers.reduce((sum, c) => sum + (Number(c.total_purchases || 0)), 0))}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-400" />
          </div>
        </motion.div>
          </div>
        


      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-effect rounded-xl p-6 border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Clientes Cadastrados</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm"><Search className="w-4 h-4 mr-2" />Buscar</Button>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" />Filtrar</Button>
            </div>
          </div>
        <div className="overflow-x-auto max-h-96 scrollbar-hide">
          <table id="customers-table" className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Documento</th>
                <th className="text-left p-3">Contato</th>
                <th className="text-left p-3">Endereço</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Segmento</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(customer => (
                <motion.tr key={customer.id} id={`customers-row-${customer.id}`} data-testid={`customers-row-${customer.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
      </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm">{customer.tax_id || customer.cpf || customer.cnpj || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">
                        {customer.tax_id ? 'Documento' : customer.cpf ? 'CPF' : customer.cnpj ? 'CNPJ' : ''}
                      </p>
    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm">{customer.phone || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{customer.celular || ''}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p className="text-sm">{customer.city}, {customer.state}</p>
                      <p className="text-xs text-muted-foreground">{customer.address || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      {getStatusIcon(customer.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                        {customer.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="text-sm">
                      {segments.find(s => s.id === customer.segment_id)?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
          <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewCustomer(customer)}
                        title="Visualizar cliente"
                      >
                        <Eye className="w-4 h-4" />
          </Button>
          <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                        title="Editar cliente"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteCustomer(customer)}
                        title="Excluir cliente"
                        className="text-red-500 hover:text-red-700"
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
      </motion.div>



      {/* Modal de Visualização */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalhes do Cliente"
        size="md"
      >
        {selectedCustomer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-lg font-medium">{selectedCustomer.name}</p>
                    </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">E-mail</label>
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  {selectedCustomer.email}
                </p>
                    </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Telefone</label>
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                  {selectedCustomer.phone || 'N/A'}
                </p>
        </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Documento</label>
                <p className="flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                  {selectedCustomer.cpf || selectedCustomer.cnpj || 'N/A'}
                </p>
        </div>
              </div>
              
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Endereço</label>
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  {selectedCustomer.address ? `${selectedCustomer.address}, ${selectedCustomer.city} - ${selectedCustomer.state}` : 'N/A'}
                </p>
                </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Status</label>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedCustomer.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedCustomer.status)}`}>
                    {selectedCustomer.status}
                  </span>
                  </div>
                  </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Segmento</label>
                <p className="flex items-center">
                  <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                  {segments.find(s => s.id === selectedCustomer.segment_id)?.name || 'N/A'}
                </p>
                </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">Total em Compras</label>
                <p className="text-lg font-medium text-green-400">
                  {formatCurrency(selectedCustomer.total_purchases || 0)}
                </p>
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
        showCloseButton={false}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
                </div>
          <p className="text-muted-foreground mb-6">
            Tem certeza que deseja excluir o cliente <strong>{selectedCustomer?.name}</strong>? 
            Esta ação não pode ser desfeita.
          </p>
          
          <div className="flex space-x-3 justify-center">
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              Sim, Excluir
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancelar
            </Button>
      </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CustomersModule;