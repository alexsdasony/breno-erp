'use client'

import React, { useMemo, useState } from 'react'
import { Plus, Save, XCircle, Edit, Trash2, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { usePaymentMethods } from '../_hooks/usePaymentMethods'
import type { PaymentMethod, PaymentMethodPayload } from '@/types'

export default function PaymentMethodsView() {
  const { methods, loading, create, update, remove } = usePaymentMethods()
  const [showForm, setShowForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [current, setCurrent] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState<PaymentMethodPayload>({ name: '', nfe_code: null })

  const title = useMemo(() => (isEditing ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'), [isEditing])

  const handleAddNew = () => {
    setIsEditing(false)
    setCurrent(null)
    setFormData({ name: '', nfe_code: null })
    setShowForm(true)
  }

  const handleEdit = (item: PaymentMethod) => {
    setIsEditing(true)
    setCurrent(item)
    setFormData({ name: item.name, nfe_code: item.nfe_code ?? null })
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
    setFormData({ name: '', nfe_code: null })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
            Formas de Pagamento
          </h1>
          <p className="text-muted-foreground mt-2">Gerencie os métodos aceitos para pagamentos e notas fiscais.</p>
        </div>
        <Button id="pm-new-button" onClick={handleAddNew} className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Forma
        </Button>
      </div>

      {showForm && (
        <div className="glass-effect rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4">{title}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <label htmlFor="pmName" className="block text-sm font-medium mb-1">Nome</label>
                <input
                  id="pmName"
                  data-testid="pm-name-input"
                  type="text"
                  value={formData.name ?? ''}
                  onChange={(e) => setFormData((prev: PaymentMethodPayload) => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Ex: DINHEIRO, CARTAO CREDITO"
                />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label htmlFor="pmNfeCode" className="block text-sm font-medium mb-1">Código NF-e (opcional)</label>
                <input
                  id="pmNfeCode"
                  data-testid="pm-nfe-code-input"
                  type="text"
                  value={(formData as any).nfe_code ?? ''}
                  onChange={(e) => setFormData((prev: PaymentMethodPayload) => ({ ...prev, nfe_code: e.target.value || null }))}
                  className="w-full p-3 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary"
                  placeholder="Ex: 01 para Dinheiro, 03 para Cartão de Crédito"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Button id="pm-submit-button" type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Salvar Alterações' : 'Adicionar Forma'}
              </Button>
              <Button id="pm-cancel-button" type="button" variant="outline" onClick={() => setShowForm(false)}>
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-effect rounded-xl p-6 border">
        <h3 className="text-lg font-semibold mb-4">Lista de Formas de Pagamento</h3>
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando...</p>
          </div>
        ) : methods.length === 0 ? (
          <p className="text-muted-foreground">Nenhuma forma cadastrada.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 scrollbar-hide">
            <table id="pm-table" className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Nome</th>
                  <th className="text-left p-3">NF-e</th>
                  <th className="text-center p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {methods.map((item) => (
                  <tr key={item.id} id={`pm-row-${item.id}`} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium flex items-center gap-2"><CreditCard className="w-4 h-4" /> {item.name}</td>
                    <td className="p-3 text-muted-foreground">{item.nfe_code ?? '-'}</td>
                    <td className="p-3 text-center">
                      <div className="flex justify-center space-x-1">
                        <Button id={`pm-edit-${item.id}`} variant="ghost" size="sm" title="Editar" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button id={`pm-delete-${item.id}`} variant="ghost" size="sm" title="Excluir">
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Isso excluirá permanentemente a forma de pagamento.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction id={`pm-confirm-delete-${item.id}`} onClick={() => remove(item.id)}>Excluir</AlertDialogAction>
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
