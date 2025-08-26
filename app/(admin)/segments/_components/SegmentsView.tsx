'use client'

import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Save, 
  XCircle, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  Target,
  CheckCircle,
  AlertCircle,
  Building,
  TrendingUp,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useSegments } from '../_hooks/useSegments'
import type { SegmentPayload, Segment } from '@/types'

export default function SegmentsView() {
  const { segments, loading, create, update, remove } = useSegments()
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [current, setCurrent] = useState<Segment | null>(null)
  const [formData, setFormData] = useState<SegmentPayload>({ name: '', description: '' })
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Delete confirmation
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const title = useMemo(() => (isEditing ? 'Editar Segmento' : 'Novo Segmento'), [isEditing])
  
  // Filter segments based on search and status
  const filteredSegments = useMemo(() => {
    return segments.filter(segment => {
      const matchesSearch = segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (segment.description && segment.description.toLowerCase().includes(searchTerm.toLowerCase()))
      return matchesSearch
    })
  }, [segments, searchTerm])
  
  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = segments.length
    const active = segments.filter(s => s.name).length // Assuming all segments with names are active
    const withDescription = segments.filter(s => s.description && s.description.trim()).length
    
    return {
      totalSegments: total,
      activeSegments: active,
      withDescription,
      completionRate: total > 0 ? Math.round((withDescription / total) * 100) : 0
    }
  }, [segments])

  const handleAddNew = () => {
    setIsEditing(false)
    setCurrent(null)
    setFormData({ name: '', description: '' })
    setShowForm(true)
  }

  const handleEdit = (segment: Segment) => {
    setIsEditing(true)
    setCurrent(segment)
    setFormData({ name: segment.name, description: segment.description ?? '' })
    setShowForm(true)
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.name.trim()) return

    if (isEditing && current) {
      await update(current.id, formData)
    } else {
      await create(formData)
    }

    setShowForm(false)
    setIsEditing(false)
    setCurrent(null)
    setFormData({ name: '', description: '' })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Gestão de Segmentos de Negócio
            </h1>
            <p className="text-gray-400 mt-1">Gerencie e monitore seus segmentos de negócio</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddNew}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Novo Segmento
          </motion.button>
        </motion.div>

        {/* KPIs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-effect gradient-card p-6 rounded-xl border border-gray-700 hover:border-indigo-500/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-2xl font-bold text-white">{kpis.totalSegments}</p>
              </div>
              <Target className="w-8 h-8 text-indigo-400" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-effect gradient-card p-6 rounded-xl border border-gray-700 hover:border-green-500/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Ativos</p>
                <p className="text-2xl font-bold text-green-400">{kpis.activeSegments}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-effect gradient-card p-6 rounded-xl border border-gray-700 hover:border-blue-500/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Com Descrição</p>
                <p className="text-2xl font-bold text-blue-400">{kpis.withDescription}</p>
              </div>
              <Building className="w-8 h-8 text-blue-400" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="glass-effect gradient-card p-6 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Taxa de Completude</p>
                <p className="text-2xl font-bold text-purple-400">{kpis.completionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400" />
            </div>
          </motion.div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect p-6 rounded-xl border border-gray-700"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar segmentos..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="with-description">Com Descrição</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Form Modal */}
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
                className="glass-effect gradient-card p-6 rounded-xl border border-gray-700 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">{title}</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="segmentName" className="block text-sm font-medium text-gray-300 mb-2">
                      Nome do Segmento
                    </label>
                    <input
                      id="segmentName"
                      data-testid="segments-name-input"
                      type="text"
                      value={formData.name ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Ex: Comércio, Serviços"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="segmentDescription" className="block text-sm font-medium text-gray-300 mb-2">
                      Descrição
                    </label>
                    <textarea
                      id="segmentDescription"
                      data-testid="segments-description-input"
                      value={(formData.description as string) ?? ''}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                      placeholder="Breve descrição do segmento"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Button 
                      id="segments-submit-button" 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isEditing ? 'Salvar Alterações' : 'Adicionar Segmento'}
                    </Button>
                    <Button 
                      id="segments-cancel-button" 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Segments Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect p-6 rounded-xl border border-gray-700"
        >
          <h3 className="text-xl font-semibold text-white mb-6">Lista de Segmentos</h3>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Carregando segmentos...</p>
            </div>
          ) : filteredSegments.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">
                {searchTerm ? 'Nenhum segmento encontrado para sua busca.' : 'Nenhum segmento cadastrado.'}
              </p>
              {!searchTerm && (
                <Button 
                  onClick={handleAddNew}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Segmento
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Nome</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Descrição</th>
                    <th className="text-center p-4 text-sm font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredSegments.map((segment) => (
                    <motion.tr 
                      key={segment.id} 
                      id={`segments-row-${segment.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-medium text-white">{segment.name}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-400">
                          {segment.description || 'Sem descrição'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <Button 
                            id={`segments-edit-${segment.id}`}
                            variant="ghost" 
                            size="sm" 
                            title="Editar"
                            onClick={() => handleEdit(segment)}
                            className="text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                id={`segments-delete-${segment.id}`}
                                variant="ghost" 
                                size="sm" 
                                title="Excluir"
                                className="text-gray-400 hover:text-red-400 hover:bg-gray-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-800 border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Você tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o segmento.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  id={`segments-confirm-delete-${segment.id}`}
                                  onClick={() => remove(segment.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
