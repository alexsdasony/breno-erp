'use client';

import React, { useMemo, useState } from 'react';
import { usePartners } from '../_hooks/usePartners';
import { Button } from '@/components/ui/button';
import { useAppData } from '@/hooks/useAppData';

export default function CustomersView() {
  const { items, loading, hasMore, loadMore, create } = usePartners();
  const { segments } = useAppData();

  // Modal state
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    segment_id: '',
    name: '',
    person_type: 'pf',
    doc: '',
    email: ''
  });

  const segmentOptions = useMemo(() => (segments || []).map((s: any) => ({ value: String(s.id), label: s.name })), [segments]);

  const onSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Map to expected API payload (camelCase keys will be mapped in api service)
    const payload: any = {
      name: form.name,
      email: form.email || null,
      segmentId: form.segment_id ? Number(form.segment_id) : null,
      // Flexible doc mapping (cpf/cnpj) – backend will handle validation
      taxId: form.doc || null,
      personType: form.person_type,
      status: 'active'
    };
    const created = await create(payload);
    if (created) {
      setOpen(false);
      setForm({ segment_id: '', name: '', person_type: 'pf', doc: '', email: '' });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Button id="customers-new-button" onClick={() => setOpen(true)}>Novo Cliente</Button>
      </div>

      {/* Customers table to satisfy E2E selectors (tbody tr with id) */}
      <div className="border rounded-md bg-white/5 border-white/10 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-800/40 text-gray-300">
            <tr>
              <th className="text-left px-4 py-2">Nome</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Cidade/Estado</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} id={c.id} className="border-t border-white/10">
                <td className="px-4 py-2 font-medium">{c.name}</td>
                <td className="px-4 py-2 text-gray-300">{c.email}</td>
                <td className="px-4 py-2 text-gray-400">{c.city} - {c.state}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="p-6 text-center text-gray-400">Nenhum cliente encontrado.</div>
        )}
      </div>

      <div className="flex gap-2">
        <Button disabled={loading || !hasMore} onClick={() => void loadMore()}>
          {loading ? 'Carregando...' : hasMore ? 'Carregar mais' : 'Fim da lista'}
        </Button>
      </div>

      {/* Simple modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-slate-900 border border-white/10 rounded-lg p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Novo Cliente</h2>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Segmento</label>
                <select
                  id="customers-segment-select"
                  className="w-full p-2 bg-slate-800/50 border border-slate-700 rounded"
                  value={form.segment_id}
                  onChange={(e) => setForm((f) => ({ ...f, segment_id: e.target.value }))}
                >
                  <option value="">Sem segmento</option>
                  {segmentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Nome</label>
                <input
                  id="customers-name-input"
                  className="w-full p-2 bg-slate-800/50 border border-slate-700 rounded text-white"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Nome do cliente"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Tipo de Pessoa</label>
                <select
                  id="customers-person-type-select"
                  className="w-full p-2 bg-slate-800/50 border border-slate-700 rounded"
                  value={form.person_type}
                  onChange={(e) => setForm((f) => ({ ...f, person_type: e.target.value }))}
                >
                  <option value="pf">Pessoa Física</option>
                  <option value="pj">Pessoa Jurídica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Documento (CPF/CNPJ)</label>
                <input
                  id="customers-doc-input"
                  className="w-full p-2 bg-slate-800/50 border border-slate-700 rounded text-white"
                  value={form.doc}
                  onChange={(e) => setForm((f) => ({ ...f, doc: e.target.value }))}
                  placeholder="CPF/CNPJ"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Email</label>
                <input
                  id="customers-email-input"
                  type="email"
                  className="w-full p-2 bg-slate-800/50 border border-slate-700 rounded text-white"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button id="customers-submit-button" type="submit">Salvar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
