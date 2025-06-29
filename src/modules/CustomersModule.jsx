import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Edit, Trash2, Eye, Search, Filter, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { useAppData } from '@/hooks/useAppData.jsx';

const CustomersModule = ({ metrics, toast }) => {
  const { data, addCustomer, importData } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  });

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
  };

  const handleCPFChange = (e) => {
    setFormData({ ...formData, cpf: formatCPF(e.target.value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.cpf) {
      toast({
        title: "Erro",
        description: "Nome, Email e CPF são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    if (data.customers.some(c => c.cpf === formData.cpf)) {
      toast({
        title: "Erro",
        description: "CPF já cadastrado.",
        variant: "destructive"
      });
      return;
    }
    
    addCustomer(formData);
    
    setFormData({ name: '', cpf: '', email: '', phone: '', address: '', city: '', state: '' });
    setShowForm(false);
  };

  const customerHeaders = ['name', 'cpf', 'email', 'phone', 'address', 'city', 'state', 'totalPurchases', 'lastPurchaseDate'];

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
                <label className="block text-sm font-medium mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CPF</label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Endereço</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Rua, Número, Bairro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cidade</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Cidade"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <input
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
                <th className="text-left p-3">CPF</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Telefone</th>
                <th className="text-left p-3">Cidade/UF</th>
                <th className="text-right p-3">Compras</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.customers.map(customer => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3 font-medium">{customer.name}</td>
                  <td className="p-3">
                    <span className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" /> {customer.cpf}
                    </span>
                  </td>
                  <td className="p-3">
                    <a href={`mailto:${customer.email}`} className="flex items-center hover:text-sky-400">
                      <Mail className="w-4 h-4 mr-2" /> {customer.email}
                    </a>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" /> {customer.phone}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" /> {customer.city}/{customer.state}
                    </span>
                  </td>
                  <td className="p-3 text-right font-medium text-green-400">
                    R$ {getCustomerTotalPurchases(customer.id).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
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
    </motion.div>
  );
};

export default CustomersModule;