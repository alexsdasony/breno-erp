import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileSpreadsheet, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  Send,
  Printer,
  Download,
  FileText 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import ImportDataButton from '@/components/ui/ImportDataButton';

const NFeModule = ({ data, metrics, addNFe, toast, importData }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    number: '',
    customerId: '',
    customerName: '',
    total: '', 
    status: 'Pendente'
  });

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = data.customers.find(c => c.id === parseInt(customerId));
    if (selectedCustomer) {
      setFormData({ ...formData, customerId: selectedCustomer.id, customerName: selectedCustomer.name });
    } else {
      setFormData({ ...formData, customerId: '', customerName: '' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.number || !formData.customerId || !formData.total) {
      toast({
        title: "Erro",
        description: "Número NF-e, Cliente e Total são obrigatórios.",
        variant: "destructive"
      });
      return;
    }
    
    addNFe(formData);
    
    setFormData({ number: '', customerId: '', customerName: '', total: '', status: 'Pendente' });
    setShowForm(false);
  };

  const nfeHeaders = ['number', 'customerName', 'date', 'total', 'status'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Emissão de NF-e
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie e emita suas Notas Fiscais Eletrônicas</p>
        </div>
        <div className="flex space-x-2">
          <ImportDataButton 
            onDataImported={importData} 
            expectedHeaders={nfeHeaders}
            moduleName="NF-es"
            importAction="nfeList"
          />
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova NF-e
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de NF-es</p>
              <p className="text-2xl font-bold text-indigo-400">{metrics.totalNFe}</p>
            </div>
            <FileSpreadsheet className="w-8 h-8 text-indigo-400" />
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">NF-es Emitidas</p>
              <p className="text-2xl font-bold text-green-400">
                {data.nfeList.filter(nfe => nfe.status === 'Emitida').length}
              </p>
            </div>
            <Send className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="glass-effect rounded-xl p-6 gradient-card border"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">NF-es Pendentes</p>
              <p className="text-2xl font-bold text-yellow-400">
                {data.nfeList.filter(nfe => nfe.status === 'Pendente').length}
              </p>
            </div>
            <FileText className="w-8 h-8 text-yellow-400" />
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
            <h3 className="text-lg font-semibold mb-4">Gerar Nova NF-e</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Número NF-e</label>
                <input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({...formData, number: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="00001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cliente</label>
                <select
                  value={formData.customerId}
                  onChange={handleCustomerSelect}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="">Selecione um cliente</option>
                  {data.customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name} ({customer.cpf})</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Itens da NF-e (Simplificado)</label>
                <textarea
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  rows="3"
                  placeholder="Descreva os produtos/serviços. Em uma aplicação real, isso seria mais complexo."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Valor Total</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.total}
                  onChange={(e) => setFormData({...formData, total: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="0,00"
                />
              </div>
               <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Emitida">Emitida</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-3">
                <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                  Gerar NF-e
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
            <p className="text-xs text-muted-foreground mt-4">
              Nota: A emissão real de NF-e envolve integração com SEFAZ, certificados digitais e estruturas XML complexas. Este é um módulo simplificado para fins demonstrativos.
            </p>
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
          <h3 className="text-lg font-semibold">Lista de NF-es</h3>
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
                <th className="text-left p-3">Número</th>
                <th className="text-left p-3">Cliente</th>
                <th className="text-left p-3">Data Emissão</th>
                <th className="text-right p-3">Valor Total</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.nfeList.map(nfe => (
                <motion.tr
                  key={nfe.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="p-3 font-medium">{nfe.number}</td>
                  <td className="p-3">{nfe.customerName}</td>
                  <td className="p-3">{nfe.date}</td>
                  <td className="p-3 text-right font-medium text-green-400">
                    R$ {parseFloat(nfe.total).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      nfe.status === 'Emitida'
                        ? 'bg-green-500/20 text-green-400'
                        : nfe.status === 'Pendente'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {nfe.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-1">
                      <Button variant="ghost" size="sm" title="Visualizar">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Baixar XML/DANFE (Simulado)">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Imprimir DANFE (Simulado)">
                        <Printer className="w-4 h-4" />
                      </Button>
                       <Button variant="ghost" size="sm" title="Enviar por Email (Simulado)">
                        <Send className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Editar">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Cancelar NF-e (Simulado)">
                        <Trash2 className="w-4 h-4 text-red-500" />
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

export default NFeModule;