import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Search, Filter, FileDown } from 'lucide-react';
import ImportDataButton from '@/components/ui/ImportDataButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppData } from '@/hooks/useAppData.jsx';
import { formatCurrency, formatDate } from '@/lib/utils.js';

const AccountsPayableModule = ({ addAccountPayable, updateAccountPayable, deleteAccountPayable, importData, toast }) => {
  const { data, activeSegmentId, ensureAccountsPayableLoaded } = useAppData();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [formData, setFormData] = useState({
    supplier: '',
    description: '',
    amount: '',
    dueDate: '',
    status: 'pending', 
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

  const segments = data.segments || [];

  // Lazy load accountsPayable when component mounts
  useEffect(() => {
    console.log('🔄 AccountsPayableModule: Ensuring accountsPayable are loaded...');
    ensureAccountsPayableLoaded();
  }, [ensureAccountsPayableLoaded]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.supplier || !formData.description || !formData.amount || !formData.dueDate || !formData.segmentId) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    if (currentAccount) {
      updateAccountPayable({ ...formData, id: currentAccount.id, segmentId: parseInt(formData.segmentId) });
    } else {
      addAccountPayable({ ...formData, segmentId: parseInt(formData.segmentId) });
    }
    setIsModalOpen(false);
    setFormData({ supplier: '', description: '', amount: '', dueDate: '', status: 'pending', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
    setCurrentAccount(null);
  };

  const openModal = (account = null) => {
    if (account) {
      setCurrentAccount(account);
      setFormData({
        supplier: account.supplier,
        description: account.description,
        amount: account.amount,
        dueDate: account.due_date || account.dueDate,
        status: account.status,
        segmentId: account.segment_id || account.segmentId
      });
    } else {
      setCurrentAccount(null);
      setFormData({ supplier: '', description: '', amount: '', dueDate: '', status: 'pending', segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '') });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    deleteAccountPayable(id);
  };

  // Função para atualizar status pendente para vencido se necessário
  function getStatusWithDueDate(account) {
    if (account.status === 'pending') {
      const due = new Date(account.due_date || account.dueDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (!isNaN(due.getTime()) && due < today) {
        return 'overdue';
      }
    }
    return account.status;
  }

  // Usar status calculado em toda a renderização e nos filtros
  const filteredAccounts = (data.accountsPayable || [])
    .map(account => ({ ...account, status: getStatusWithDueDate(account) }))
    .filter(account => !activeSegmentId || (account.segment_id || account.segmentId) === activeSegmentId)
    .filter(account => 
      account.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(account => filterStatus === 'all' || account.status === filterStatus);

  const handleImport = (parsedData) => {
    importData(parsedData, 'accountsPayable', activeSegmentId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  
  const exportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredAccounts, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "contas_a_pagar.json";
    link.click();
    toast({ title: "Exportado!", description: "Dados de contas a pagar exportados." });
  };

  // Consolidado de valores por status
  const totalPaga = filteredAccounts.filter(a => a.status === 'paid').reduce((sum, a) => sum + Number(a.amount || 0), 0);
  const totalVencida = filteredAccounts.filter(a => a.status === 'overdue').reduce((sum, a) => sum + Number(a.amount || 0), 0);
  const totalPendente = filteredAccounts.filter(a => a.status === 'pending').reduce((sum, a) => sum + Number(a.amount || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Contas a Pagar
        </h1>
        <div className="flex gap-2">
          <ImportDataButton onImport={handleImport} moduleName="Contas a Pagar" expectedHeaders={['supplier', 'description', 'amount', 'dueDate', 'status', 'segmentId']} />
           <Button onClick={exportData} variant="outline" className="bg-slate-800 hover:bg-slate-700 border-slate-700">
            <FileDown className="mr-2 h-4 w-4" /> Exportar JSON
          </Button>
          <Button onClick={() => openModal()} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Conta
          </Button>
        </div>
      </div>

      {/* Consolidado de valores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="glass-effect rounded-xl p-6 border flex flex-col items-center">
          <span className="text-sm text-muted-foreground mb-1">Total Paga</span>
          <span className="text-2xl font-bold text-green-400">{formatCurrency(totalPaga)}</span>
        </div>
        <div className="glass-effect rounded-xl p-6 border flex flex-col items-center">
          <span className="text-sm text-muted-foreground mb-1">Total Vencida</span>
          <span className="text-2xl font-bold text-red-400">{formatCurrency(totalVencida)}</span>
        </div>
        <div className="glass-effect rounded-xl p-6 border flex flex-col items-center">
          <span className="text-sm text-muted-foreground mb-1">Total Pendente</span>
          <span className="text-2xl font-bold text-yellow-400">{formatCurrency(totalPendente)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            id="searchAccountsPayable"
            name="search"
            type="text" 
            placeholder="Buscar por fornecedor ou descrição..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full p-2 pl-10 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 pl-10 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
            <option value="all">Todos os Status</option>
            <option value="pending">Pendente</option>
            <option value="paid">Paga</option>
            <option value="overdue">Vencida</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto glass-effect p-4 rounded-lg border border-white/10">
        <table className="w-full min-w-max text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-3">Fornecedor</th>
              <th className="p-3">Segmento</th>
              <th className="p-3 text-right">Valor (R$)</th>
              <th className="p-3 text-center">Vencimento</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <motion.tr key={account.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="border-b border-slate-800 hover:bg-slate-800/60">
                <td className="p-3">{account.supplier}</td>
                <td className="p-3">{segments.find(s => s.id === (account.segment_id || account.segmentId))?.name || 'N/A'}</td>
                <td className="p-3 text-right">{formatCurrency(account.amount)}</td>
                <td className="p-3 text-center">{formatDate(account.due_date || account.dueDate)}</td>
                <td className="p-3 text-center"><span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>{account.status === 'pending' ? 'Pendente' : account.status === 'paid' ? 'Paga' : 'Vencida'}</span></td>
                <td className="p-3 text-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => openModal(account)} className="text-blue-400 hover:text-blue-300"><Edit className="h-4 w-4" /></Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Você tem certeza?</AlertDialogTitle><AlertDialogDescription>Essa ação não pode ser desfeita. Isso excluirá permanentemente a conta a pagar.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(account.id)}>Excluir</AlertDialogAction></AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </motion.tr>
            ))}
             {filteredAccounts.length === 0 && (<tr><td colSpan="6" className="text-center p-6 text-gray-400">Nenhuma conta a pagar encontrada.</td></tr>)}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg border border-slate-700">
            <h2 className="text-2xl font-semibold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{currentAccount ? 'Editar Conta a Pagar' : 'Adicionar Nova Conta a Pagar'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Segmento</label>
                <select name="segmentId" value={formData.segmentId} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                  <option value="">Selecione um segmento</option>
                  {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Fornecedor</label>
                <input type="text" name="supplier" value={formData.supplier} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
                <input type="text" name="description" value={formData.description} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Valor (R$)</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                  <option value="pending">Pendente</option>
                  <option value="paid">Paga</option>
                  <option value="overdue">Vencida</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="border-slate-600 hover:bg-slate-700">Cancelar</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">{currentAccount ? 'Salvar Alterações' : 'Adicionar Conta'}</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AccountsPayableModule;
