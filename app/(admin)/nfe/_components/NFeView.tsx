'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNFe } from '../_hooks/useNFe'
import { useENotas } from '../_hooks/useENotas'
import { enotasService } from '@/services/enotasService'
import type { NFePayload } from '@/types'
import { Button } from '@/components/ui/button'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Receipt,
  TrendingUp,
  Calendar,
  Send,
  Download,
  Eye,
  Ban
} from 'lucide-react'

const statusConfig = {
  pending: { label: 'Pendente', color: 'text-yellow-400', bgColor: 'bg-yellow-400/10', icon: Clock },
  issued: { label: 'Emitida', color: 'text-green-400', bgColor: 'bg-green-400/10', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'text-red-400', bgColor: 'bg-red-400/10', icon: XCircle }
}

export default function NFeView() {
  const { nfes, loading, create, update, remove, loadMore, hasMore } = useNFe({ pageSize: 20 })
  const { 
    emitindo, 
    consultando, 
    cancelando, 
    emitirNFe, 
    consultarNFe, 
    cancelarNFe, 
    baixarXML, 
    baixarDANFE 
  } = useENotas()

  const [form, setForm] = useState<NFePayload>({
    customer_name: '',
    invoice_number: '',
    issue_date: new Date().toISOString().split('T')[0],
    total_amount: 0,
    tax_amount: 0,
    status: 'pending',
    notes: ''
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filtros e busca
  const filteredNFes = useMemo(() => {
    return nfes.filter(nfe => {
      const customerName = (nfe as any).customer_name || (nfe as any).customerName || ''
      const invoiceNumber = (nfe as any).invoice_number || (nfe as any).invoiceNumber || ''
      
      const matchesSearch = 
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
      
      const nfeStatus = (nfe as any).status || 'pending'
      const matchesStatus = statusFilter === 'all' || nfeStatus === statusFilter
      
      return matchesSearch && matchesStatus
    })
  }, [nfes, searchTerm, statusFilter])

  // Cálculo dos KPIs
  const kpis = useMemo(() => {
    const total = nfes.length
    const issued = nfes.filter(nfe => (nfe as any).status === 'issued').length
    const totalValue = nfes.reduce((sum, nfe) => sum + ((nfe as any).total_amount ?? (nfe as any).totalAmount ?? 0), 0)
    const avgValue = total > 0 ? totalValue / total : 0

    return {
      total,
      issued,
      totalValue,
      avgValue
    }
  }, [nfes])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await update(editingId, form)
      setEditingId(null)
    } else {
      await create(form)
    }
    setForm({ customer_name: '', invoice_number: '', issue_date: new Date().toISOString().split('T')[0], total_amount: 0, tax_amount: 0, status: 'pending', notes: '' })
    setShowForm(false)
  }

  const handleEmitirNFe = async (nfeId: string) => {
    const nfe = nfes.find(n => String(n.id) === nfeId)
    if (!nfe) return

    // Dados fictícios para demonstração - em produção, estes dados viriam do sistema
    const emitente = {
      cnpj: '12.345.678/0001-90',
      inscricao_estadual: '123456789',
      razao_social: 'Empresa Exemplo LTDA',
      nome_fantasia: 'Empresa Exemplo',
      endereco: 'Rua das Flores, 123',
      numero: '123',
      bairro: 'Centro',
      cidade: 'Manaus',
      uf: 'AM',
      cep: '69000-000',
      telefone: '(92) 3333-4444',
      email: 'contato@empresa.com'
    }

    const destinatario = {
      nome: (nfe as any).customer_name || (nfe as any).customerName || 'Cliente',
      cpf: '123.456.789-00',
      endereco: 'Rua do Cliente, 456',
      numero: '456',
      bairro: 'Bairro do Cliente',
      cidade: 'Manaus',
      uf: 'AM',
      cep: '69000-001',
      telefone: '(92) 9999-8888',
      email: 'cliente@email.com'
    }

    const itens = [{
      codigo: '001',
      descricao: 'Produto/Serviço',
      quantidade: 1,
      valor_unitario: (nfe as any).total_amount || (nfe as any).totalAmount || 0,
      cfop: '5102',
      unidade: 'UN',
      ncm: '00000000'
    }]

    const enotasNFe = enotasService.convertToENotas(nfe, emitente, destinatario, itens)
    const response = await emitirNFe(enotasNFe)
    
    if (response) {
      // Atualizar o status da NFe no sistema local
      await update(nfeId, {
        customer_name: (nfe as any).customer_name || (nfe as any).customerName || '',
        invoice_number: (nfe as any).invoice_number || (nfe as any).invoiceNumber || '',
        issue_date: (nfe as any).issue_date || (nfe as any).issueDate || '',
        total_amount: (nfe as any).total_amount || (nfe as any).totalAmount || 0,
        tax_amount: (nfe as any).tax_amount || (nfe as any).taxAmount || 0,
        status: 'issued',
        notes: (nfe as any).notes || ''
      })
    }
  }

  const handleConsultarNFe = async (nfeId: string) => {
    // Em produção, você salvaria o ID da e-Notas na NFe local
    const enotasId = 'id-da-enota' // Este ID viria do banco de dados
    await consultarNFe(enotasId)
  }

  const handleCancelarNFe = async (nfeId: string) => {
    const motivo = prompt('Digite o motivo do cancelamento:')
    if (!motivo) return

    const enotasId = 'id-da-enota' // Este ID viria do banco de dados
    const response = await cancelarNFe(enotasId, motivo)
    
    if (response) {
      const nfe = nfes.find(n => String(n.id) === nfeId)
      if (nfe) {
        await update(nfeId, {
          customer_name: (nfe as any).customer_name || (nfe as any).customerName || '',
          invoice_number: (nfe as any).invoice_number || (nfe as any).invoiceNumber || '',
          issue_date: (nfe as any).issue_date || (nfe as any).issueDate || '',
          total_amount: (nfe as any).total_amount || (nfe as any).totalAmount || 0,
          tax_amount: (nfe as any).tax_amount || (nfe as any).taxAmount || 0,
          status: 'cancelled',
          notes: (nfe as any).notes || ''
        })
      }
    }
  }

  const handleBaixarXML = async (nfeId: string) => {
    const enotasId = 'id-da-enota' // Este ID viria do banco de dados
    await baixarXML(enotasId, `nfe-${nfeId}.xml`)
  }

  const handleBaixarDANFE = async (nfeId: string) => {
    const enotasId = 'id-da-enota' // Este ID viria do banco de dados
    await baixarDANFE(enotasId, `danfe-${nfeId}.pdf`)
  }

  const startEdit = (id: string) => {
    const item = nfes.find((n) => n.id === id)
    if (!item) return
    setEditingId(id)
    setForm({
      customer_name: (item as any).customer_name || (item as any).customerName || '',
      invoice_number: (item as any).invoice_number || (item as any).invoiceNumber || '',
      issue_date: (item as any).issue_date || (item as any).issueDate || new Date().toISOString().split('T')[0],
      total_amount: (item as any).total_amount ?? (item as any).totalAmount ?? 0,
      tax_amount: (item as any).tax_amount ?? (item as any).taxAmount ?? 0,
      status: (item as any).status || 'pending',
      notes: (item as any).notes || ''
    })
    setShowForm(true)
  }

  const handleCancel = () => {
    setForm({ customer_name: '', invoice_number: '', issue_date: new Date().toISOString().split('T')[0], total_amount: 0, tax_amount: 0, status: 'pending', notes: '' })
    setEditingId(null)
    setShowForm(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Notas Fiscais Eletrônicas</h1>
              <p className="text-slate-400">Gerencie suas NFes de forma eficiente</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            Nova NFe
          </motion.button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total de NFes</p>
              <p className="text-2xl font-bold text-white mt-1">{kpis.total}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">NFes Emitidas</p>
              <p className="text-2xl font-bold text-white mt-1">{kpis.issued}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Valor Total</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(kpis.totalValue)}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">Valor Médio</p>
              <p className="text-2xl font-bold text-white mt-1">{formatCurrency(kpis.avgValue)}</p>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Busca e Filtros */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 mb-8"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente ou número da fatura..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="text-slate-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="issued">Emitida</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Modal do Formulário */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Editar NFe' : 'Nova NFe'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Cliente</label>
                    <input 
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50" 
                      placeholder="Nome do cliente" 
                      value={form.customer_name || ''} 
                      onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Número da Fatura</label>
                    <input 
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50" 
                      placeholder="Número da fatura" 
                      value={form.invoice_number || ''} 
                      onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Data de Emissão</label>
                    <input 
                      type="date" 
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50" 
                      value={form.issue_date || ''} 
                      onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                    <select 
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50" 
                      value={form.status || ''} 
                      onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    >
                      <option value="pending">Pendente</option>
                      <option value="issued">Emitida</option>
                      <option value="cancelled">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Valor Total</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50" 
                      placeholder="0,00" 
                      value={form.total_amount ?? 0} 
                      onChange={(e) => setForm((f) => ({ ...f, total_amount: parseFloat(e.target.value) || 0 }))} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Valor do Imposto</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50" 
                      placeholder="0,00" 
                      value={form.tax_amount ?? 0} 
                      onChange={(e) => setForm((f) => ({ ...f, tax_amount: parseFloat(e.target.value) || 0 }))} 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Observações</label>
                  <textarea 
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50" 
                    placeholder="Observações adicionais..." 
                    rows={3}
                    value={form.notes || ''} 
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} 
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {editingId ? 'Atualizar' : 'Criar'} NFe
                  </Button>
                  <Button type="button" variant="secondary" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de NFes - Tabela Responsiva */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden"
      >
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-lg font-semibold text-white">NFes Cadastradas</h2>
          <p className="text-slate-400 text-sm mt-1">{filteredNFes.length} de {nfes.length} NFes</p>
        </div>

        {/* Tabela Desktop */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/30">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Cliente</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Número</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Data</th>
                <th className="text-left p-4 text-sm font-medium text-slate-300">Status</th>
                <th className="text-right p-4 text-sm font-medium text-slate-300">Valor Total</th>
                <th className="text-right p-4 text-sm font-medium text-slate-300">Impostos</th>
                <th className="text-center p-4 text-sm font-medium text-slate-300">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredNFes.map((nfe, index) => {
                const customerName = (nfe as any).customer_name || (nfe as any).customerName || ''
                const invoiceNumber = (nfe as any).invoice_number || (nfe as any).invoiceNumber || ''
                const issueDate = (nfe as any).issue_date || (nfe as any).issueDate || ''
                const totalAmount = (nfe as any).total_amount ?? (nfe as any).totalAmount ?? 0
                const taxAmount = (nfe as any).tax_amount ?? (nfe as any).taxAmount ?? 0
                const status = (nfe as any).status || 'pending'
                const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock
                
                return (
                  <motion.tr
                    key={String(nfe.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-slate-700/30 transition-all duration-200"
                  >
                    <td className="p-4">
                      <div className="text-white font-medium truncate max-w-[200px]">{customerName}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300">{invoiceNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-300">{formatDate(issueDate)}</div>
                    </td>
                    <td className="p-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status as keyof typeof statusConfig]?.bgColor} ${statusConfig[status as keyof typeof statusConfig]?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[status as keyof typeof statusConfig]?.label || status}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-white font-medium">{formatCurrency(totalAmount)}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="text-slate-300">{formatCurrency(taxAmount)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        {status === 'pending' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEmitirNFe(String(nfe.id))}
                            disabled={emitindo}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-200 disabled:opacity-50"
                            title="Emitir NFe"
                          >
                            <Send className="w-4 h-4" />
                          </motion.button>
                        )}
                        {status === 'issued' && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleConsultarNFe(String(nfe.id))}
                              disabled={consultando}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200 disabled:opacity-50"
                              title="Consultar NFe"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleBaixarXML(String(nfe.id))}
                              className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all duration-200"
                              title="Baixar XML"
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCancelarNFe(String(nfe.id))}
                              disabled={cancelando}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200 disabled:opacity-50"
                              title="Cancelar NFe"
                            >
                              <Ban className="w-4 h-4" />
                            </motion.button>
                          </>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => startEdit(String(nfe.id))}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => remove(String(nfe.id))}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Cards Mobile */}
        <div className="lg:hidden divide-y divide-slate-700/50">
          {filteredNFes.map((nfe, index) => {
            const customerName = (nfe as any).customer_name || (nfe as any).customerName || ''
            const invoiceNumber = (nfe as any).invoice_number || (nfe as any).invoiceNumber || ''
            const issueDate = (nfe as any).issue_date || (nfe as any).issueDate || ''
            const totalAmount = (nfe as any).total_amount ?? (nfe as any).totalAmount ?? 0
            const taxAmount = (nfe as any).tax_amount ?? (nfe as any).taxAmount ?? 0
            const status = (nfe as any).status || 'pending'
            const notes = (nfe as any).notes || ''
            const StatusIcon = statusConfig[status as keyof typeof statusConfig]?.icon || Clock
            
            return (
              <motion.div
                key={String(nfe.id)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-slate-700/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{customerName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status as keyof typeof statusConfig]?.bgColor} ${statusConfig[status as keyof typeof statusConfig]?.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig[status as keyof typeof statusConfig]?.label || status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {status === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEmitirNFe(String(nfe.id))}
                        disabled={emitindo}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-all duration-200 disabled:opacity-50"
                        title="Emitir NFe"
                      >
                        <Send className="w-4 h-4" />
                      </motion.button>
                    )}
                    {status === 'issued' && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleConsultarNFe(String(nfe.id))}
                          disabled={consultando}
                          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Consultar NFe"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBaixarXML(String(nfe.id))}
                          className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all duration-200"
                          title="Baixar XML"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCancelarNFe(String(nfe.id))}
                          disabled={cancelando}
                          className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200 disabled:opacity-50"
                          title="Cancelar NFe"
                        >
                          <Ban className="w-4 h-4" />
                        </motion.button>
                      </>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startEdit(String(nfe.id))}
                      className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all duration-200"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => remove(String(nfe.id))}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-all duration-200"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Receipt className="w-4 h-4" />
                      <span>Número</span>
                    </div>
                    <div className="text-white font-medium">{invoiceNumber}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <Calendar className="w-4 h-4" />
                      <span>Data</span>
                    </div>
                    <div className="text-white font-medium">{formatDate(issueDate)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span>Total</span>
                    </div>
                    <div className="text-white font-medium">{formatCurrency(totalAmount)}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                      <span>Impostos</span>
                    </div>
                    <div className="text-white font-medium">{formatCurrency(taxAmount)}</div>
                  </div>
                </div>
                
                {notes && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">Observações</div>
                    <div className="text-slate-300 text-sm">{notes}</div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {filteredNFes.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg font-medium">Nenhuma NFe encontrada</p>
            <p className="text-slate-500 text-sm mt-1">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de busca' 
                : 'Comece criando sua primeira NFe'
              }
            </p>
          </div>
        )}

        {hasMore && filteredNFes.length > 0 && (
          <div className="p-6 border-t border-slate-700/50">
            <Button 
              onClick={loadMore} 
              disabled={loading}
              variant="secondary" 
              className="w-full"
            >
              {loading ? 'Carregando...' : 'Carregar mais'}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
