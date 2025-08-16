import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Search, Filter, FileDown, Eye } from 'lucide-react';
import ImportDataButton from '@/components/ui/ImportDataButton';
import Modal from '@/components/ui/modal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppDataRefactored } from '@/hooks/useAppDataRefactored.jsx';
import { formatCurrency, formatDate } from '@/lib/utils.js';

const AccountsPayableModule = () => {
  const { data, activeSegmentId, loadFinancialDocuments, loadPartners, toast, addFinancialDocument, updateFinancialDocument, deleteFinancialDocument, importData } = useAppDataRefactored();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [periodType, setPeriodType] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  
  const [formData, setFormData] = useState({
    supplierId: '',
    numeroNotaFiscal: '',
    descricao: '',
    valor: '',
    dataVencimento: '',
    dataPagamento: '',
    status: 'pendente',
    categoriaId: '',
    formaPagamento: 'boleto',
    observacoes: '',
    responsavelPagamento: '',
    numeroParcela: 1,
    totalParcelas: 1,
    segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
  });

  const segments = data.segments || [];
  const suppliers = (data.partners || []).filter(p => (p.roles || p.partner_roles || []).some(r => r.role === 'supplier'));
  const accountCategories = data.accountCategories || [];

  // Load financial documents (payables) and partners when component mounts and when segment changes
  useEffect(() => {
    const params = {};
    if (activeSegmentId && activeSegmentId !== 0) {
      params.segment_id = activeSegmentId;
    }
    // SEMPRE buscar dados frescos da API
    loadFinancialDocuments(params).catch(() => {});
    loadPartners(params).catch(() => {});
  }, [activeSegmentId, loadFinancialDocuments, loadPartners]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      numeroNotaFiscal: '',
      descricao: '',
      valor: '',
      dataVencimento: '',
      dataPagamento: '',
      status: 'pendente',
      categoriaId: '',
      formaPagamento: 'boleto',
      observacoes: '',
      responsavelPagamento: '',
      numeroParcela: 1,
      totalParcelas: 1,
      segmentId: activeSegmentId || (data.segments.length > 0 ? data.segments[0].id : '')
    });
    setCurrentAccount(null);
    setShowCreateModal(false);
    setShowEditModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId || !formData.descricao || !formData.valor || !formData.dataVencimento || !formData.segmentId) {
      toast({ title: "Erro", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }
    
    const docPayload = {
      partner_id: formData.supplierId,
      direction: 'payable',
      doc_no: formData.numeroNotaFiscal || null,
      description: formData.descricao,
      amount: parseFloat(formData.valor),
      due_date: formData.dataVencimento,
      status: formData.status,
      category_id: formData.categoriaId || null,
      payment_method: formData.formaPagamento || null,
      notes: formData.observacoes || null,
      segment_id: parseInt(formData.segmentId)
    };

    if (currentAccount) {
      await updateFinancialDocument(currentAccount.id, docPayload);
    } else {
      await addFinancialDocument(docPayload);
    }
    await loadFinancialDocuments();
    resetForm();
    toast({ title: "Sucesso", description: currentAccount ? "Conta atualizada!" : "Conta adicionada!" });
  };

  const handleEdit = (account) => {
      setCurrentAccount(account);
      setFormData({
      supplierId: account.partner_id || '',
      numeroNotaFiscal: account.doc_no || '',
      descricao: account.description || '',
      valor: account.amount || '',
      dataVencimento: account.due_date || '',
      dataPagamento: account.payment_date || '',
      status: account.status || 'pendente',
      categoriaId: account.category_id || '',
      formaPagamento: account.payment_method || 'boleto',
      observacoes: account.notes || '',
      responsavelPagamento: account.responsavel_pagamento || '',
      numeroParcela: account.numero_parcela || 1,
      totalParcelas: account.total_parcelas || 1,
      segmentId: account.segment_id || ''
    });
    setShowEditModal(true);
  };

  const handleView = (account) => {
    setCurrentAccount(account);
    setShowViewModal(true);
  };

  const handleDelete = (account) => {
    setCurrentAccount(account);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (currentAccount) {
      await deleteFinancialDocument(currentAccount.id);
      await loadFinancialDocuments();
      setShowDeleteConfirm(false);
      setCurrentAccount(null);
      toast({ title: "Sucesso", description: "Conta excluída!" });
    }
  };

  // Função para atualizar status pendente para vencido se necessário
  function getStatusWithDueDate(account) {
    if ((account.status || '').toLowerCase() === 'pendente') {
      const due = new Date(account.due_date || account.data_vencimento || account.dueDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (!isNaN(due.getTime()) && due < today) {
        return 'vencida';
      }
    }
    return account.status;
  }

  // Filtro de período
  function isWithinPeriod(account) {
    const due = new Date(account.data_vencimento || account.due_date || account.dueDate);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (periodType === 'day') {
      return due.toDateString() === today.toDateString();
    }
    if (periodType === 'week') {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return due >= weekStart && due <= weekEnd;
    }
    if (periodType === 'month') {
      return due.getMonth() === today.getMonth() && due.getFullYear() === today.getFullYear();
    }
    if (periodType === 'custom') {
      if (!customStart && !customEnd) return true;
      const start = customStart ? new Date(customStart) : null;
      const end = customEnd ? new Date(customEnd) : null;
      if (start && end) return due >= start && due <= end;
      if (start) return due >= start;
      if (end) return due <= end;
      return true;
    }
    return true;
  }

  // Usar status calculado em toda a renderização e nos filtros
  const filteredAccounts = (data.financialDocuments || [])
    .filter(doc => doc.direction === 'payable')
    .map(account => ({ ...account, status: getStatusWithDueDate(account) }))
    .filter(account => {
      // Se activeSegmentId é 0 ou null (Todos os Segmentos), mostrar todas as contas
      if (!activeSegmentId || activeSegmentId === 0) {
        return true;
      }
      // Se há um segmento específico selecionado, filtrar por esse segmento
      return (account.segment_id || account.segmentId) === activeSegmentId;
    })
    .filter(account => {
      const supplierName = suppliers.find(s => s.id === (account.partner_id || account.supplier_id))?.name || '';
      const description = account.description || '';
      return supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             description.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .filter(account => {
      if (filterStatus === 'all') return true;
      // Mapear status antigos para novos
      const statusMap = {
        'pending': 'pendente',
        'paid': 'paga',
        'overdue': 'vencida'
      };
      const mappedStatus = statusMap[filterStatus] || filterStatus;
      return account.status === mappedStatus;
    })
    .filter(isWithinPeriod);

  const handleImport = (parsedData) => {
    importData(parsedData, 'accountsPayable', activeSegmentId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paga': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pendente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'vencida': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelada': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'paga': return 'Paga';
      case 'pendente': return 'Pendente';
      case 'vencida': return 'Vencida';
      case 'cancelada': return 'Cancelada';
      default: return status;
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
  const totalPaga = filteredAccounts.filter(a => a.status === 'paga').reduce((sum, a) => sum + Number(a.valor || a.amount || 0), 0);
  const totalVencida = filteredAccounts.filter(a => a.status === 'vencida').reduce((sum, a) => sum + Number(a.valor || a.amount || 0), 0);
  const totalPendente = filteredAccounts.filter(a => a.status === 'pendente').reduce((sum, a) => sum + Number(a.valor || a.amount || 0), 0);

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
          <ImportDataButton id="accountsPayable-import-button" onImport={handleImport} moduleName="Contas a Pagar" expectedHeaders={['supplier', 'description', 'amount', 'dueDate', 'status', 'segmentId']} />
           <Button id="accountsPayable-export-button" onClick={exportData} variant="outline" className="bg-slate-800 hover:bg-slate-700 border-slate-700">
            <FileDown className="mr-2 h-4 w-4" /> Exportar JSON
          </Button>
          <Button id="accountsPayable-new-button" onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
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
        <div className="flex flex-col gap-2">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 pl-10 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
            <option value="all">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="paga">Paga</option>
              <option value="vencida">Vencida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div className="relative mt-2">
            <label className="block text-xs text-gray-400 mb-1">Período</label>
            <select value={periodType} onChange={e => setPeriodType(e.target.value)} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
              <option value="all">Todos</option>
              <option value="day">Dia</option>
              <option value="week">Semana</option>
              <option value="month">Mês</option>
              <option value="custom">Personalizado</option>
          </select>
          </div>
          {periodType === 'custom' && (
            <div className="flex gap-2 mt-2">
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-1/2 p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="De" />
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-1/2 p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Até" />
            </div>
          )}
        </div>
      </div>

      <div className="overflow-x-auto glass-effect p-4 rounded-lg border border-white/10">
        <table id="accountsPayable-table" className="w-full min-w-max text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="p-3">Fornecedor</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Segmento</th>
              <th className="p-3 text-right">Valor (R$)</th>
              <th className="p-3 text-center">Vencimento</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccounts.map((account) => (
              <motion.tr key={account.id} id={`accountsPayable-row-${account.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="border-b border-slate-800 hover:bg-slate-800/60">
                <td className="p-3">
                  <div>
                    <div className="font-medium">{suppliers.find(s => s.id === (account.partner_id || account.supplier_id))?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-400 truncate max-w-48">{account.description || ''}</div>
                  </div>
                </td>
                <td className="p-3">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                    {accountCategories.find(c => c.id === account.categoria_id)?.name || 'Outros'}
                  </span>
                </td>
                <td className="p-3">{segments.find(s => s.id === (account.segment_id || account.segmentId))?.name || 'N/A'}</td>
                <td className="p-3 text-right font-medium">{formatCurrency(account.amount)}</td>
                <td className="p-3 text-center">{formatDate(account.due_date || account.data_vencimento || account.dueDate)}</td>
                <td className="p-3 text-center">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(account.status)}`}>
                    {getStatusLabel(account.status)}
                  </span>
                </td>
                <td className="p-3 text-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleView(account)} className="text-green-400 hover:text-green-300">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(account)} className="text-blue-400 hover:text-blue-300">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(account)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </motion.tr>
            ))}
             {filteredAccounts.length === 0 && (<tr><td colSpan="7" className="text-center p-6 text-gray-400">Nenhuma conta a pagar encontrada.</td></tr>)}
          </tbody>
        </table>
      </div>

      {/* Modal de Criar */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Adicionar Nova Conta a Pagar"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Segmento *</label>
              <select id="accountsPayable-segment-select" name="segmentId" value={formData.segmentId} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option value="">Selecione um segmento</option>
                {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fornecedor *</label>
              <select id="accountsPayable-supplier-select" name="supplierId" value={formData.supplierId} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option value="">Selecione um fornecedor</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Número da NF</label>
              <input id="accountsPayable-docno-input" type="text" name="numeroNotaFiscal" value={formData.numeroNotaFiscal} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
              <select id="accountsPayable-category-select" name="categoriaId" value={formData.categoriaId} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option value="">Selecione uma categoria</option>
                {accountCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descrição *</label>
            <textarea id="accountsPayable-description-input" name="descricao" value={formData.descricao} onChange={handleInputChange} required rows={2} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Valor (R$) *</label>
              <input id="accountsPayable-amount-input" type="number" step="0.01" name="valor" value={formData.valor} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento *</label>
              <input id="accountsPayable-dueDate-input" type="date" name="dataVencimento" value={formData.dataVencimento} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Data de Pagamento</label>
              <input id="accountsPayable-paymentDate-input" type="date" name="dataPagamento" value={formData.dataPagamento} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select id="accountsPayable-status-select" name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option value="pendente">Pendente</option>
                <option value="paga">Paga</option>
                <option value="vencida">Vencida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Forma de Pagamento</label>
              <select id="accountsPayable-paymentMethod-select" name="formaPagamento" value={formData.formaPagamento} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option value="boleto">Boleto</option>
                <option value="pix">PIX</option>
                <option value="transferencia">Transferência</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Responsável</label>
              <input type="text" name="responsavelPagamento" value={formData.responsavelPagamento} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Parcela</label>
              <input type="number" min="1" name="numeroParcela" value={formData.numeroParcela} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Total de Parcelas</label>
              <input type="number" min="1" name="totalParcelas" value={formData.totalParcelas} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Observações</label>
            <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={3} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button id="accountsPayable-cancel-button" type="button" variant="outline" onClick={resetForm} className="border-slate-600 hover:bg-slate-700">Cancelar</Button>
            <Button id="accountsPayable-submit-button" type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">Adicionar Conta</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Editar */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Conta a Pagar"
        size="lg"
      >
            <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Segmento *</label>
                <select id="accountsPayable-edit-segment-select" name="segmentId" value={formData.segmentId} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                  <option value="">Selecione um segmento</option>
                  {segments.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Fornecedor *</label>
              <select id="accountsPayable-edit-supplier-select" name="supplierId" value={formData.supplierId} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option value="">Selecione um fornecedor</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Número da NF</label>
               <input id="accountsPayable-edit-docno-input" type="text" name="numeroNotaFiscal" value={formData.numeroNotaFiscal} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Categoria</label>
               <select id="accountsPayable-edit-category-select" name="categoriaId" value={formData.categoriaId} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option value="">Selecione uma categoria</option>
                {accountCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Descrição *</label>
             <textarea id="accountsPayable-edit-description-input" name="descricao" value={formData.descricao} onChange={handleInputChange} required rows={2} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Valor (R$) *</label>
               <input id="accountsPayable-edit-amount-input" type="number" step="0.01" name="valor" value={formData.valor} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento *</label>
               <input id="accountsPayable-edit-dueDate-input" type="date" name="dataVencimento" value={formData.dataVencimento} onChange={handleInputChange} required className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Data de Pagamento</label>
               <input id="accountsPayable-edit-paymentDate-input" type="date" name="dataPagamento" value={formData.dataPagamento} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
               <select id="accountsPayable-edit-status-select" name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option value="pendente">Pendente</option>
                <option value="paga">Paga</option>
                <option value="vencida">Vencida</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Forma de Pagamento</label>
               <select id="accountsPayable-edit-paymentMethod-select" name="formaPagamento" value={formData.formaPagamento} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none">
                <option value="boleto">Boleto</option>
                <option value="pix">PIX</option>
                <option value="transferencia">Transferência</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Responsável</label>
              <input type="text" name="responsavelPagamento" value={formData.responsavelPagamento} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Parcela</label>
              <input type="number" min="1" name="numeroParcela" value={formData.numeroParcela} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Total de Parcelas</label>
              <input type="number" min="1" name="totalParcelas" value={formData.totalParcelas} onChange={handleInputChange} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Observações</label>
            <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={3} className="w-full p-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button id="accountsPayable-edit-cancel-button" type="button" variant="outline" onClick={resetForm} className="border-slate-600 hover:bg-slate-700">Cancelar</Button>
            <Button id="accountsPayable-update-button" type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">Salvar Alterações</Button>
          </div>
        </form>
      </Modal>

      {/* Modal de Visualizar */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Detalhes da Conta a Pagar"
        size="lg"
      >
        {currentAccount && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Fornecedor</label>
                  <p className="text-white">{suppliers.find(s => s.id === currentAccount.supplier_id)?.name || currentAccount.supplier || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Segmento</label>
                  <p className="text-white">{segments.find(s => s.id === currentAccount.segment_id)?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Categoria</label>
                  <p className="text-white">{accountCategories.find(c => c.id === currentAccount.categoria_id)?.name || 'Outros'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Número da NF</label>
                  <p className="text-white">{currentAccount.numero_nota_fiscal || 'N/A'}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Valor</label>
                  <p className="text-white font-semibold text-lg">{formatCurrency(currentAccount.valor || currentAccount.amount)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data de Vencimento</label>
                  <p className="text-white">{formatDate(currentAccount.data_vencimento || currentAccount.due_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Data de Pagamento</label>
                  <p className="text-white">{currentAccount.data_pagamento ? formatDate(currentAccount.data_pagamento) : 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(currentAccount.status)}`}>
                    {getStatusLabel(currentAccount.status)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
              <p className="text-white">{currentAccount.descricao || currentAccount.description || 'N/A'}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Forma de Pagamento</label>
                <p className="text-white capitalize">{currentAccount.forma_pagamento || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Parcela</label>
                <p className="text-white">{currentAccount.numero_parcela || 1} de {currentAccount.total_parcelas || 1}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Responsável</label>
                <p className="text-white">{currentAccount.responsavel_pagamento || 'N/A'}</p>
              </div>
            </div>

            {currentAccount.observacoes && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Observações</label>
                <p className="text-white">{currentAccount.observacoes}</p>
              </div>
            )}

              <div className="flex justify-end space-x-3 pt-4">
              <Button onClick={() => setShowViewModal(false)} variant="outline" className="border-slate-600 hover:bg-slate-700">Fechar</Button>
              <Button onClick={() => { setShowViewModal(false); handleEdit(currentAccount); }} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">Editar</Button>
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
          <p className="text-gray-300">
            Tem certeza que deseja excluir esta conta a pagar?
          </p>
          {currentAccount && (
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-white font-medium">{suppliers.find(s => s.id === currentAccount.supplier_id)?.name || currentAccount.supplier}</p>
              <p className="text-gray-400 text-sm">{currentAccount.descricao || currentAccount.description}</p>
              <p className="text-white font-semibold">{formatCurrency(currentAccount.valor || currentAccount.amount)}</p>
              </div>
          )}
          <p className="text-red-400 text-sm">Esta ação não pode ser desfeita.</p>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="border-slate-600 hover:bg-slate-700">Cancelar</Button>
            <Button onClick={confirmDelete} variant="destructive" className="bg-red-600 hover:bg-red-700">Excluir</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AccountsPayableModule;
