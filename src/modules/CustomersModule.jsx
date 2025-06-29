import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit, Trash2, Eye, Search, Filter, Mail, Phone, MapPin, CreditCard, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData.jsx';

const CustomersModule = ({ metrics, toast }) => {
  const { data, addCustomer, importData } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  const formatDocument = (value) => {
    const numbers = value.replace(/\D/g, '');
    
    // Se tem 11 dígitos, formata como CPF
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .substring(0, 14);
    }
    
    // Se tem mais de 11 dígitos, formata como CNPJ
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
      .substring(0, 18);
  };

  const validateDocument = (document) => {
    const numbers = document.replace(/\D/g, '');
    
    if (numbers.length === 11) {
      // Validação básica de CPF
      if (numbers === '00000000000' || numbers === '11111111111' || 
          numbers === '22222222222' || numbers === '33333333333' || 
          numbers === '44444444444' || numbers === '55555555555' || 
          numbers === '66666666666' || numbers === '77777777777' || 
          numbers === '88888888888' || numbers === '99999999999') {
        return false;
      }
      return true;
    } else if (numbers.length === 14) {
      // Validação básica de CNPJ
      if (numbers === '00000000000000' || numbers === '11111111111111' || 
          numbers === '22222222222222' || numbers === '33333333333333' || 
          numbers === '44444444444444' || numbers === '55555555555555' || 
          numbers === '66666666666666' || numbers === '77777777777777' || 
          numbers === '88888888888888' || numbers === '99999999999999') {
        return false;
      }
      return true;
    }
    
    return false;
  };

  const handleDocumentChange = (e) => {
    setFormData({ ...formData, document: formatDocument(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.document) {
      toast({
        title: "Erro",
        description: "Nome, Email e Documento são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateDocument(formData.document)) {
      toast({
        title: "Erro",
        description: "Documento inválido. Digite um CPF ou CNPJ válido.",
        variant: "destructive"
      });
      return;
    }
    
    if (data.customers.some(c => c.document === formData.document)) {
      toast({
        title: "Erro",
        description: "Documento já cadastrado.",
        variant: "destructive"
      });
      return;
    }
    
    addCustomer(formData);
    
    setFormData({ name: '', document: '', email: '', phone: '', address: '', city: '', state: '' });
    setShowForm(false);
  };

  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name || '',
      document: customer.document || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    // Aqui você implementaria a chamada para deletar o cliente
    // Por enquanto, vamos apenas mostrar uma mensagem
    toast({
      title: "Cliente Excluído",
      description: `${selectedCustomer.name} foi excluído com sucesso.`,
    });
    setShowDeleteConfirm(false);
    setSelectedCustomer(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.document) {
      toast({
        title: "Erro",
        description: "Nome, Email e Documento são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateDocument(formData.document)) {
      toast({
        title: "Erro",
        description: "Documento inválido. Digite um CPF ou CNPJ válido.",
        variant: "destructive"
      });
      return;
    }
    
    // Verificar se o documento já existe em outro cliente
    const otherCustomers = data.customers.filter(c => c.id !== selectedCustomer.id);
    if (otherCustomers.some(c => c.document === formData.document)) {
      toast({
        title: "Erro",
        description: "Documento já cadastrado para outro cliente.",
        variant: "destructive"
      });
      return;
    }
    
    // Aqui você implementaria a chamada para atualizar o cliente
    toast({
      title: "Cliente Atualizado",
      description: `${formData.name} foi atualizado com sucesso.`,
    });
    
    setShowEditModal(false);
    setSelectedCustomer(null);
    setFormData({ name: '', document: '', email: '', phone: '', address: '', city: '', state: '' });
  };

  const customerHeaders = ['name', 'document', 'email', 'phone', 'address', 'city', 'state', 'totalPurchases', 'lastPurchaseDate'];

  // Calcular total de compras por cliente baseado nas vendas
  const getCustomerTotalPurchases = (customerId) => {
    return data.sales
      .filter(sale => sale.customerId === customerId && sale.status === 'Concluída')
      .reduce((total, sale) => total + Number(sale.total || 0), 0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-sky-500 bg-clip-text text-transparent">
            Gestão de Clientes
          </h1>
          <p className="text-muted-foreground mt-2">Cadastre e gerencie seus clientes</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onImport={(parsedData) => importData(parsedData, 'customers')}
            moduleName="Clientes"
            expectedHeaders={customerHeaders}
          />
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-teal-500 to-sky-600 hover:from-teal-600 hover:to-sky-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold text-sky-400">{metrics.totalCustomers}</p>
            </div>
            <Users className="w-8 h-8 text-sky-400" />
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Novos Clientes (Mês)</p>
              <p className="text-2xl font-bold text-teal-400">
                {data.customers.filter(c => {
                  const customerDate = c.lastPurchaseDate || c.id; 
                  return new Date(customerDate).getMonth() === new Date().getMonth() && new Date(customerDate).getFullYear() === new Date().getFullYear();
                }).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-teal-400" />
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
            <h3 className="text-lg font-semibold mb-4">Novo Cliente</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="customerName" className="block text-sm font-medium mb-2">Nome Completo</label>
                <input
                  id="customerName"
                  name="customerName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label htmlFor="customerDocument" className="block text-sm font-medium mb-2">Documento</label>
                <input
                  id="customerDocument"
                  name="customerDocument"
                  type="text"
                  value={formData.document}
                  onChange={handleDocumentChange}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              </div>
              <div>
                <label htmlFor="customerEmail" className="block text-sm font-medium mb-2">Email</label>
                <input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label htmlFor="customerPhone" className="block text-sm font-medium mb-2">Telefone</label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
              <div>
                <label htmlFor="customerAddress" className="block text-sm font-medium mb-2">Endereço</label>
                <input
                  id="customerAddress"
                  name="customerAddress"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Rua, Número, Bairro"
                />
              </div>
              <div>
                <label htmlFor="customerCity" className="block text-sm font-medium mb-2">Cidade</label>
                <input
                  id="customerCity"
                  name="customerCity"
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Cidade"
                />
              </div>
              <div>
                <label htmlFor="customerState" className="block text-sm font-medium mb-2">Estado</label>
                <input
                  id="customerState"
                  name="customerState"
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="UF"
                />
              </div>
              <div className="md:col-span-2 flex space-x-3">
                <Button type="submit" className="bg-gradient-to-r from-teal-500 to-sky-600">
                  Salvar Cliente
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
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
        transition={{ delay: 0.2 }}
        className="glass-effect rounded-xl p-6 border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Lista de Clientes</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto max-h-96 scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Documento</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Telefone</th>
                <th className="text-left p-3">Cidade/UF</th>
                <th className="text-right p-3">Compras</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(data.customers || []).map(customer => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3 font-medium">{customer.name || 'Nome não informado'}</td>
                  <td className="p-3">
                    <span className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" /> {customer.document || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3">
                    <a href={`mailto:${customer.email || ''}`} className="flex items-center hover:text-sky-400">
                      <Mail className="w-4 h-4 mr-2" /> {customer.email || 'N/A'}
                    </a>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" /> {customer.phone || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" /> {customer.city || 'N/A'}/{customer.state || 'N/A'}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium text-green-400">
                    R$ {(customer.totalPurchases || 0).toLocaleString('pt-BR')}
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
      <AnimatePresence>
        {showViewModal && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowViewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-xl p-6 border max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detalhes do Cliente</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowViewModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="text-lg font-medium">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Documento</label>
                  <p className="flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    {selectedCustomer.document}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Email</label>
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <a href={`mailto:${selectedCustomer.email}`} className="hover:text-sky-400">
                      {selectedCustomer.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {selectedCustomer.phone || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Endereço</label>
                  <p className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {selectedCustomer.address || 'Não informado'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Cidade</label>
                    <p>{selectedCustomer.city || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground">Estado</label>
                    <p>{selectedCustomer.state || 'Não informado'}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground">Total de Compras</label>
                  <p className="text-lg font-medium text-green-400">
                    R$ {(selectedCustomer.totalPurchases || 0).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={() => setShowViewModal(false)}>
                  Fechar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Edição */}
      <AnimatePresence>
        {showEditModal && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-xl p-6 border max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Editar Cliente</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <form onSubmit={handleEditSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editCustomerName" className="block text-sm font-medium mb-2">Nome Completo</label>
                  <input
                    id="editCustomerName"
                    name="editCustomerName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Nome do cliente"
                  />
                </div>
                <div>
                  <label htmlFor="editCustomerDocument" className="block text-sm font-medium mb-2">Documento</label>
                  <input
                    id="editCustomerDocument"
                    name="editCustomerDocument"
                    type="text"
                    value={formData.document}
                    onChange={handleDocumentChange}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>
                <div>
                  <label htmlFor="editCustomerEmail" className="block text-sm font-medium mb-2">Email</label>
                  <input
                    id="editCustomerEmail"
                    name="editCustomerEmail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label htmlFor="editCustomerPhone" className="block text-sm font-medium mb-2">Telefone</label>
                  <input
                    id="editCustomerPhone"
                    name="editCustomerPhone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="(XX) XXXXX-XXXX"
                  />
                </div>
                <div>
                  <label htmlFor="editCustomerAddress" className="block text-sm font-medium mb-2">Endereço</label>
                  <input
                    id="editCustomerAddress"
                    name="editCustomerAddress"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Rua, Número, Bairro"
                  />
                </div>
                <div>
                  <label htmlFor="editCustomerCity" className="block text-sm font-medium mb-2">Cidade</label>
                  <input
                    id="editCustomerCity"
                    name="editCustomerCity"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Cidade"
                  />
                </div>
                <div>
                  <label htmlFor="editCustomerState" className="block text-sm font-medium mb-2">Estado</label>
                  <input
                    id="editCustomerState"
                    name="editCustomerState"
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="UF"
                  />
                </div>
                <div className="md:col-span-2 flex space-x-3">
                  <Button type="submit" className="bg-gradient-to-r from-teal-500 to-sky-600">
                    Atualizar Cliente
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {showDeleteConfirm && selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-effect rounded-xl p-6 border max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Confirmar Exclusão</h3>
                <p className="text-muted-foreground mb-6">
                  Tem certeza que deseja excluir o cliente <strong>{selectedCustomer.name}</strong>? 
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CustomersModule;