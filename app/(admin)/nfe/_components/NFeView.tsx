'use client'

import React, { useState } from 'react'
import { useNFe } from '../_hooks/useNFe'
import type { NFePayload } from '@/types'
import { Button } from '@/components/ui/button'

export default function NFeView() {
  const { nfes, loading, create, update, remove, loadMore, hasMore } = useNFe({ pageSize: 20 })

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      await update(editingId, form)
      setEditingId(null)
    } else {
      await create(form)
    }
    setForm({ customer_name: '', invoice_number: '', issue_date: new Date().toISOString().split('T')[0], total_amount: 0, tax_amount: 0, status: 'pending', notes: '' })
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
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">NF-e</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input className="border p-2 rounded" placeholder="Cliente" value={form.customer_name || ''} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} />
        <input className="border p-2 rounded" placeholder="Número" value={form.invoice_number || ''} onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))} />
        <input type="date" className="border p-2 rounded" value={form.issue_date || ''} onChange={(e) => setForm((f) => ({ ...f, issue_date: e.target.value }))} />
        <input type="number" step="0.01" className="border p-2 rounded" placeholder="Total" value={form.total_amount ?? 0} onChange={(e) => setForm((f) => ({ ...f, total_amount: parseFloat(e.target.value) || 0 }))} />
        <input type="number" step="0.01" className="border p-2 rounded" placeholder="Imposto" value={form.tax_amount ?? 0} onChange={(e) => setForm((f) => ({ ...f, tax_amount: parseFloat(e.target.value) || 0 }))} />
        <input className="border p-2 rounded" placeholder="Status" value={form.status || ''} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
        <div className="md:col-span-3 flex gap-2">
          <Button type="submit" disabled={loading}>{editingId ? 'Atualizar' : 'Adicionar'}</Button>
          {editingId && (
            <Button type="button" variant="secondary" onClick={() => { setEditingId(null); }}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {nfes.map((nfe) => (
          <div key={String(nfe.id)} className="border rounded p-3 flex items-center justify-between">
            <div className="space-y-1">
              <div className="font-medium">{(nfe as any).customer_name || (nfe as any).customerName} • {(nfe as any).invoice_number || (nfe as any).invoiceNumber}</div>
              <div className="text-sm text-gray-500">{(nfe as any).issue_date || (nfe as any).issueDate} • Total: {(nfe as any).total_amount ?? (nfe as any).totalAmount}</div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => startEdit(String(nfe.id))}>Editar</Button>
              <Button variant="destructive" onClick={() => remove(String(nfe.id))}>Excluir</Button>
            </div>
          </div>
        ))}
        {hasMore && (
          <div className="pt-2">
            <Button onClick={loadMore} disabled={loading}>Carregar mais</Button>
          </div>
        )}
      </div>
    </div>
  )
}
