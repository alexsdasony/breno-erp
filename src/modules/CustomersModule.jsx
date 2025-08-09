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

const CustomersModule = ({ metrics, addCustomer, updateCustomer, deleteCustomer, toast, importData }) => {
  const { data, activeSegmentId, loadPartners } = useAppData();
  
  // Carregar partners (clientes) quando o componente for montado
  useEffect(() => {
    if (!data.partners || data.partners.length === 0) {
      console.log('🔄 Carregando partners...');
      loadPartners();
    }
  }, [loadPartners, data.partners]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado inicial do formulário
  const [formData, setFormData] = useState({
    name: '',
    tipoPessoa: 'pf',
    cpf: '',
    cnpj: '',
    rg: '',
    dataNascimento: '',
    estadoCivil: '',
    profissao: '',
    empresa: '',
    cargo: '',
    dataAdmissao: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    cep: '',
    numero: '',
    complemento: '',
    bairro: '',
    tipoImovel: '',
    celular: '',
    telefoneComercial: '',
    possuiPatrimonio: false,
    valorPatrimonio: '',
    descricaoPatrimonio: '',
    status: 'pendente',
    observacoes: '',
    responsavelCadastro: '',
    dataCadastro: new Date().toISOString().split('T')[0],
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

  // Atualizar segmentId quando activeSegmentId ou segments mudarem
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
    }));
  }, [activeSegmentId, data.segments]);

  const resetForm = () => {
    setFormData({
      name: '',
      tipoPessoa: 'pf',
      cpf: '',
      cnpj: '',
      rg: '',
      dataNascimento: '',
      estadoCivil: '',
      profissao: '',
      empresa: '',
      cargo: '',
      dataAdmissao: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      cep: '',
      numero: '',
      complemento: '',
      bairro: '',
      tipoImovel: '',
      celular: '',
      telefoneComercial: '',
      possuiPatrimonio: false,
      valorPatrimonio: '',
      descricaoPatrimonio: '',
      status: 'pendente',
      observacoes: '',
      responsavelCadastro: '',
      dataCadastro: new Date().toISOString().split('T')[0],
      segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
    });
    setIsEditing(false);
    setSelectedCustomer(null);
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const validateForm = () => {
    if (!formData.name || formData.name.length < 2) {
      toast({ title: 'Erro', description: 'O nome deve ter pelo menos 2 caracteres.', variant: 'destructive' });
        return false;
      }
    if (!formData.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      toast({ title: 'Erro', description: 'Informe um e-mail válido.', variant: 'destructive' });
        return false;
      }
      return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      if (isEditing && selectedCustomer) {
        await updateCustomer(selectedCustomer.id, formData);
        toast({ title: 'Sucesso', description: 'Cliente atualizado com sucesso!' });
      } else {
        await addCustomer(formData);
        toast({ title: 'Sucesso', description: 'Cliente cadastrado com sucesso!' });
      }
        await loadCustomers();
        resetForm();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
    }
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      tipoPessoa: customer.tipo_pessoa || 'pf',
      cpf: customer.cpf || '',
      cnpj: customer.cnpj || '',
      rg: customer.rg || '',
      dataNascimento: customer.data_nascimento || '',
      estadoCivil: customer.estado_civil || '',
      profissao: customer.profissao || '',
      empresa: customer.empresa || '',
      cargo: customer.cargo || '',
      dataAdmissao: customer.data_admissao || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      cep: customer.cep || '',
      numero: customer.numero || '',
      complemento: customer.complemento || '',
      bairro: customer.bairro || '',
      tipoImovel: customer.tipo_imovel || '',
      celular: customer.celular || '',
      telefoneComercial: customer.telefone_comercial || '',
      possuiPatrimonio: customer.possui_patrimonio || false,
      valorPatrimonio: customer.valor_patrimonio || '',
      descricaoPatrimonio: customer.descricao_patrimonio || '',
      status: customer.status || 'pendente',
      observacoes: customer.observacoes || '',
      responsavelCadastro: customer.responsavel_cadastro || '',
      dataCadastro: customer.data_cadastro || new Date().toISOString().split('T')[0],
      segmentId: customer.segment_id || activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
    });
    setIsEditing(true);
    setShowEditModal(true);
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
      await loadCustomers();
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
          <Button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
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
              <p className="text-2xl font-bold text-blue-400">{metrics.totalCustomers || filteredCustomers.length}</p>
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
          <table className="w-full">
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
                <motion.tr key={customer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-border hover:bg-muted/50 transition-colors">
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

      {/* Modal de Criação */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Novo Cliente"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Segmento</label>
            <select value={formData.segmentId} onChange={(e) => setFormData({...formData, segmentId: e.target.value})} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
              <option value="">Selecione um segmento</option>
              {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                <input
                  type="text"
                  value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="Nome completo"
              required
                />
              </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Pessoa *</label>
            <select
              value={formData.tipoPessoa}
              onChange={(e) => setFormData({...formData, tipoPessoa: e.target.value, cpf: '', cnpj: ''})}
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
              required
            >
              <option value="pf">Pessoa Física (CPF)</option>
              <option value="pj">Pessoa Jurídica (CNPJ)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {formData.tipoPessoa === 'pf' ? 'CPF *' : 'CNPJ *'}
            </label>
                <input
                  type="text"
                value={formData.tipoPessoa === 'pf' ? formData.cpf : formData.cnpj}
                onChange={(e) => {
                  if (formData.tipoPessoa === 'pf') {
                    setFormData({...formData, cpf: e.target.value});
                  } else {
                    setFormData({...formData, cnpj: e.target.value});
                  }
                }}
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder={formData.tipoPessoa === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
                required
              />
              </div>
          <div>
            <label className="block text-sm font-medium mb-2">E-mail *</label>
                <input
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="cliente@email.com" 
                required
                />
              </div>
          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
                <input
              type="tel" 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="(11) 1234-5678" 
                />
              </div>
          <div>
            <label className="block text-sm font-medium mb-2">Endereço</label>
                <input
                  type="text"
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="Rua, Avenida, etc." 
                />
              </div>
          <div>
            <label className="block text-sm font-medium mb-2">Cidade</label>
            <input
              type="text"
              value={formData.city} 
              onChange={(e) => setFormData({...formData, city: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="Nome da cidade" 
            />
              </div>
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione...</option>
              <option value="AC">Acre</option>
              <option value="AL">Alagoas</option>
              <option value="AP">Amapá</option>
              <option value="AM">Amazonas</option>
              <option value="BA">Bahia</option>
              <option value="CE">Ceará</option>
              <option value="DF">Distrito Federal</option>
              <option value="ES">Espírito Santo</option>
              <option value="GO">Goiás</option>
              <option value="MA">Maranhão</option>
              <option value="MT">Mato Grosso</option>
              <option value="MS">Mato Grosso do Sul</option>
              <option value="MG">Minas Gerais</option>
              <option value="PA">Pará</option>
              <option value="PB">Paraíba</option>
              <option value="PR">Paraná</option>
              <option value="PE">Pernambuco</option>
              <option value="PI">Piauí</option>
              <option value="RJ">Rio de Janeiro</option>
              <option value="RN">Rio Grande do Norte</option>
              <option value="RS">Rio Grande do Sul</option>
              <option value="RO">Rondônia</option>
              <option value="RR">Roraima</option>
              <option value="SC">Santa Catarina</option>
              <option value="SP">São Paulo</option>
              <option value="SE">Sergipe</option>
              <option value="TO">Tocantins</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
          <select
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="suspended">Suspenso</option>
          </select>
          </div>
          <div className="md:col-span-2 flex space-x-3">
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600">Salvar Cliente</Button>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
        </div>
        </form>
      </Modal>

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

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Cliente"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Segmento</label>
            <select value={formData.segmentId} onChange={(e) => setFormData({...formData, segmentId: e.target.value})} required className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary">
              <option value="">Selecione um segmento</option>
              {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
                </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nome Completo *</label>
          <input
            type="text"
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="Nome completo" 
              required
          />
                  </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tipo de Pessoa *</label>
          <select
              value={formData.tipoPessoa}
              onChange={(e) => setFormData({...formData, tipoPessoa: e.target.value, cpf: '', cnpj: ''})}
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
            required
          >
              <option value="pf">Pessoa Física (CPF)</option>
              <option value="pj">Pessoa Jurídica (CNPJ)</option>
          </select>
                </div>
                <div>
            <label className="block text-sm font-medium mb-2">
              {formData.tipoPessoa === 'pf' ? 'CPF *' : 'CNPJ *'}
            </label>
                  <input
                    type="text"
              value={formData.tipoPessoa === 'pf' ? formData.cpf : formData.cnpj}
            onChange={(e) => {
                if (formData.tipoPessoa === 'pf') {
                  setFormData({...formData, cpf: e.target.value});
                } else {
                  setFormData({...formData, cnpj: e.target.value});
                }
              }}
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder={formData.tipoPessoa === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}
            required
                  />
                </div>
                <div>
            <label className="block text-sm font-medium mb-2">E-mail *</label>
                  <input
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="cliente@email.com" 
            required
                  />
                </div>
                <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
                  <input
              type="tel" 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="(11) 1234-5678" 
                  />
                </div>
                <div>
            <label className="block text-sm font-medium mb-2">Endereço</label>
                  <input
            type="text"
              value={formData.address} 
              onChange={(e) => setFormData({...formData, address: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="Rua, Avenida, etc." 
                  />
                </div>
                <div>
            <label className="block text-sm font-medium mb-2">Cidade</label>
                  <input
                    type="text"
              value={formData.city} 
              onChange={(e) => setFormData({...formData, city: e.target.value})} 
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary" 
              placeholder="Nome da cidade" 
                  />
                </div>
                <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
                  <select
              value={formData.state}
              onChange={(e) => setFormData({...formData, state: e.target.value})}
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">Selecione...</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
        <div>
            <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="suspended">Suspenso</option>
          </select>
        </div>
          <div className="md:col-span-2 flex space-x-3">
            <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600">
              Atualizar Cliente
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
              Cancelar
            </Button>
        </div>
        </form>
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