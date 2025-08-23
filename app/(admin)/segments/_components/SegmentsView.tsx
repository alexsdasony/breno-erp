'use client'

import React, { useMemo, useState } from 'react'
import { Plus, Save, XCircle, Edit, Trash2 } from 'lucide-react'
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

  const title = useMemo(() => (isEditing ? 'Editar Segmento' : 'Novo Segmento'), [isEditing])

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Gerenciar Segmentos de Negócio
          </h1>
          <p className="text-muted-foreground mt-2">Adicione, edite ou remova segmentos.</p>
        </div>
        <Button id="segments-new-button" onClick={handleAddNew} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Segmento
        </Button>
      </div>

      {showForm && (
        <div className="glass-effect rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="segmentName" className="block text-sm font-medium mb-1">Nome do Segmento</label>
              <input
                id="segmentName"
                data-testid="segments-name-input"
                type="text"
                value={formData.name ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Ex: Comércio, Serviços"
              />
            </div>
            <div>
              <label htmlFor="segmentDescription" className="block text-sm font-medium mb-1">Descrição</label>
              <textarea
                id="segmentDescription"
                data-testid="segments-description-input"
                value={(formData.description as string) ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="Breve descrição do segmento"
                rows={3}
              />
            </div>
            <div className="flex space-x-3">
              <Button id="segments-submit-button" type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Salvar Alterações' : 'Adicionar Segmento'}
              </Button>
              <Button id="segments-cancel-button" type="button" variant="outline" onClick={() => setShowForm(false)}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-effect rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4">Lista de Segmentos</h3>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando segmentos...</p>
          </div>
        ) : segments.length === 0 ? (
          <p className="text-muted-foreground">Nenhum segmento cadastrado.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 scrollbar-hide">
            <table id="segments-table" className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">Descrição</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {segments.map((segment) => (
                  <tr key={segment.id} id={`segments-row-${segment.id}`} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium">{segment.name}</td>
                    <td className="p-3 text-muted-foreground">{segment.description}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button id={`segments-edit-${segment.id}`} variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(segment)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button id={`segments-delete-${segment.id}`} variant="ghost" size="sm" title="Excluir">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente o segmento.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction id={`segments-confirm-delete-${segment.id}`} onClick={() => remove(segment.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
