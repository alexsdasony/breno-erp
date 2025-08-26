'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useFinancialDocuments } from '../_hooks/useFinancialDocuments';
import { Plus, Filter, FileDown, Edit, Trash2, Search } from 'lucide-react';

export default function FinancialView() {
  const { items, loading, hasMore, loadMore, create, update, remove } = useFinancialDocuments();

  // UI state - filtros (somente UI por enquanto)
  const [query, setQuery] = React.useState('');
  const [dateStart, setDateStart] = React.useState<string>('');
  const [dateEnd, setDateEnd] = React.useState<string>('');
  const [type, setType] = React.useState<string>(''); // receita, despesa, transferencia
  const [partner, setPartner] = React.useState<string>('');
  const [segment, setSegment] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');

  // Modal state (criar/editar)
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  // Campos do documento (somente os que existem hoje + extras UI-only)
  const [fType, setFType] = React.useState<string>('');
  const [fDescription, setFDescription] = React.useState<string>('');
  const [fAmount, setFAmount] = React.useState<string>('');
  const [fDate, setFDate] = React.useState<string>('');
  const [fDueDate, setFDueDate] = React.useState<string>('');
  const [fStatus, setFStatus] = React.useState<string>('pending');
  const [fPartnerId, setFPartnerId] = React.useState<string>('');
  const [fSegmentId, setFSegmentId] = React.useState<string>('');
  // Extras do legado (UI-only, ignorados no submit por enquanto)
  const [fPaymentMethod, setFPaymentMethod] = React.useState<string>('');
  const [fNotes, setFNotes] = React.useState<string>('');
  const [fDocumentNumber, setFDocumentNumber] = React.useState<string>('');

  // Erros simples
  const [descError, setDescError] = React.useState<string | null>(null);
  const [amountError, setAmountError] = React.useState<string | null>(null);

  // Refs para atalhos e foco
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const firstInputRef = React.useRef<HTMLInputElement | null>(null);
  const filterSearchRef = React.useRef<HTMLInputElement | null>(null);

  // Helpers colocados antes dos efeitos para evitar TDZ (cancelAndReset é usado no deps do efeito)
  const resetFields = () => {
    setFType('');
    setFDescription('');
    setFAmount('');
    setFDate('');
    setFDueDate('');
    setFStatus('pending');
    setFPartnerId('');
    setFSegmentId('');
    setFPaymentMethod('');
    setFNotes('');
    setFDocumentNumber('');
    setDescError(null);
    setAmountError(null);
  };

  const cancelAndReset = React.useCallback(() => {
    setEditingId(null);
    resetFields();
    setShowForm(false);
  }, []);

  // Atalhos: Enter para salvar, Esc para fechar
  React.useEffect(() => {
    if (!showForm) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        cancelAndReset();
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        const target = e.target as HTMLElement | null;
        const tag = (target?.tagName || '').toUpperCase();
        const isTextArea = tag === 'TEXTAREA';
        const isButton = tag === 'BUTTON';
        if (!isTextArea && !isButton) {
          e.preventDefault();
          formRef.current?.requestSubmit();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showForm, cancelAndReset]);

  // Foco inicial ao abrir modal
  React.useEffect(() => {
    if (!showForm) return;
    const t = window.setTimeout(() => {
      const el: any = firstInputRef.current;
      el?.focus?.();
      if (editingId && typeof el?.select === 'function') {
        el.select();
      }
    }, 0);
    return () => window.clearTimeout(t);
  }, [showForm, editingId]);

  // Foco inicial na página: campo de busca dos filtros
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      filterSearchRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  // KPIs simples a partir de items (temporário)
  const { entradas, saidas, saldo } = React.useMemo(() => {
    let inSum = 0;
    let outSum = 0;
    for (const it of items) {
      const val = Number(it.amount || 0);
      if (val >= 0) inSum += val; else outSum += val; // valores negativos contam como saída
    }
    return { entradas: inSum, saidas: outSum, saldo: inSum + outSum };
  }, [items]);

  // Funções auxiliares
  const currency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  

  const openNew = () => {
    setEditingId(null);
    resetFields();
    setShowForm(true);
  };

  const openEdit = (doc: any, ev?: React.MouseEvent) => {
    ev?.preventDefault();
    ev?.stopPropagation();
    setEditingId(doc.id);
    setFType(doc.type || '');
    setFDescription(doc.description || '');
    setFAmount(doc.amount != null ? String(doc.amount) : '');
    setFDate(doc.date || '');
    setFDueDate(doc.due_date || '');
    setFStatus(doc.status || 'pending');
    setFPartnerId(doc.partner_id || '');
    setFSegmentId(doc.segment_id || '');
    // Extras (mantidos apenas visualmente)
    setFPaymentMethod('');
    setFNotes('');
    setFDocumentNumber('');
    window.setTimeout(() => setShowForm(true), 0);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // validações simples
    let valid = true;
    const amountNum = fAmount ? parseFloat(fAmount) : 0;
    if (!fDescription || fDescription.trim().length < 2) {
      setDescError('Informe uma descrição válida.');
      valid = false;
    } else setDescError(null);
    if (isNaN(amountNum)) {
      setAmountError('Valor inválido.');
      valid = false;
    } else setAmountError(null);
    if (!valid) return;

    const payload = {
      type: fType || null,
      description: fDescription || null,
      amount: amountNum,
      date: fDate || null,
      due_date: fDueDate || null,
      status: fStatus || null,
      partner_id: fPartnerId || null,
      segment_id: fSegmentId || null,
      // payment_method, notes, document_number são ignorados por enquanto
    } as any;

    if (editingId) {
      await update(editingId, payload);
    } else {
      await create(payload);
    }
    cancelAndReset();
  };

  // Filtro em memória (somente UI)
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      const matchesQ = !q || `${it.description || ''}`.toLowerCase().includes(q) || `${it.partner_name || ''}`.toLowerCase().includes(q);
      const matchesType = !type || (it.type || '') === type;
      const matchesStatus = !status || (it.status || '') === status;
      // Datas/segment/partner como UI por enquanto
      return matchesQ && matchesType && matchesStatus;
    });
  }, [items, query, type, status]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filtros</Button>
          <Button variant="outline" disabled><FileDown className="w-4 h-4 mr-2" />Exportar</Button>
          <Button id="financial-new" onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novo</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect rounded-lg p-4 border">
          <div className="text-sm text-muted-foreground">Entradas</div>
          <div className="text-xl font-semibold text-green-400">{currency(entradas)}</div>
        </div>
        <div className="glass-effect rounded-lg p-4 border">
          <div className="text-sm text-muted-foreground">Saídas</div>
          <div className="text-xl font-semibold text-red-400">{currency(Math.abs(saidas))}</div>
        </div>
        <div className="glass-effect rounded-lg p-4 border">
          <div className="text-sm text-muted-foreground">Saldo</div>
          <div className="text-xl font-semibold">{currency(saldo)}</div>
        </div>
      </div>

      {/* Filtros avançados (UI-only) */}
      <div className="glass-effect rounded-xl p-4 border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-3">
            <label className="block text-sm mb-1">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input ref={filterSearchRef} className="pl-9 pr-3 py-2 w-full bg-muted border rounded-lg" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Descrição ou parceiro" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Data Inicial</label>
            <input type="date" className="w-full bg-muted border rounded-lg p-2" value={dateStart} onChange={(e) => setDateStart(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Data Final</label>
            <input type="date" className="w-full bg-muted border rounded-lg p-2" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Tipo</label>
            <select className="w-full bg-muted border rounded-lg p-2" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="">Todos</option>
              <option value="receipt">Receita</option>
              <option value="expense">Despesa</option>
              <option value="transfer">Transferência</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Status</label>
            <select className="w-full bg-muted border rounded-lg p-2" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="pending">Pendente</option>
              <option value="paid">Pago</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm mb-1">Segmento</label>
            <input className="w-full bg-muted border rounded-lg p-2" value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="#segment" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Parceiro</label>
            <input className="w-full bg-muted border rounded-lg p-2" value={partner} onChange={(e) => setPartner(e.target.value)} placeholder="Nome ou ID" />
          </div>
        </div>
      </div>

      {/* Tabela */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-effect rounded-xl p-0 border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 border-b">
              <tr>
                <th className="text-left p-3">Data</th>
                <th className="text-left p-3">Vencimento</th>
                <th className="text-left p-3">Tipo</th>
                <th className="text-left p-3">Parceiro</th>
                <th className="text-left p-3">Descrição</th>
                <th className="text-right p-3">Valor</th>
                <th className="text-left p-3">Status</th>
                <th className="text-center p-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3">{d.date || '-'}</td>
                  <td className="p-3">{d.due_date || '-'}</td>
                  <td className="p-3">{d.type || '-'}</td>
                  <td className="p-3">{d.partner_name || '-'}</td>
                  <td className="p-3">{d.description || '-'}</td>
                  <td className="p-3 text-right">{currency(Number(d.amount || 0))}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      d.status === 'paid' ? 'bg-green-500/20 text-green-400' : d.status === 'canceled' ? 'bg-gray-500/20 text-gray-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {d.status === 'paid' ? 'Pago' : d.status === 'canceled' ? 'Cancelado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1">
                      <Button variant="ghost" size="sm" title="Editar" onClick={(e) => openEdit(d, e)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" title="Excluir" onClick={() => setConfirmId(d.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">Nenhum documento encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Paginação */}
      <div className="flex gap-2">
        <Button disabled={loading || !hasMore} onClick={() => void loadMore()}>
          {loading ? 'Carregando...' : hasMore ? 'Carregar mais' : 'Fim da lista'}
        </Button>
      </div>

      {/* Modal de Criar/Editar */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
            <div className="absolute inset-0 bg-black/60" onClick={cancelAndReset} />
            <motion.div initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 8 }} className="relative glass-effect border rounded-xl w-[95vw] max-w-3xl max-h-[85vh] overflow-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{editingId ? 'Editar Documento' : 'Novo Documento'}</h2>
                <button className="px-2 py-1 rounded-md border border-white/10" onClick={cancelAndReset}>Esc</button>
              </div>
              <form ref={formRef} onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4" noValidate>
                <div className="md:col-span-3">
                  <label className="block text-sm mb-1">Tipo</label>
                  <select className="w-full bg-muted border rounded-lg p-2" value={fType} onChange={(e) => setFType(e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="receipt">Receita</option>
                    <option value="expense">Despesa</option>
                    <option value="transfer">Transferência</option>
                  </select>
                </div>
                <div className="md:col-span-5">
                  <label className="block text-sm mb-1">Descrição</label>
                  <input ref={firstInputRef} className={`w-full bg-muted border rounded-lg p-2 ${descError ? 'border-red-500' : ''}`} value={fDescription} onChange={(e) => setFDescription(e.target.value)} placeholder="Descrição" />
                  {descError && <p className="mt-1 text-xs text-red-400">{descError}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Valor</label>
                  <input type="number" step="0.01" className={`w-full bg-muted border rounded-lg p-2 ${amountError ? 'border-red-500' : ''}`} value={fAmount} onChange={(e) => setFAmount(e.target.value)} placeholder="0,00" />
                  {amountError && <p className="mt-1 text-xs text-red-400">{amountError}</p>}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1">Status</label>
                  <select className="w-full bg-muted border rounded-lg p-2" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                    <option value="pending">Pendente</option>
                    <option value="paid">Pago</option>
                    <option value="canceled">Cancelado</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm mb-1">Data</label>
                  <input type="date" className="w-full bg-muted border rounded-lg p-2" value={fDate} onChange={(e) => setFDate(e.target.value)} />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm mb-1">Vencimento</label>
                  <input type="date" className="w-full bg-muted border rounded-lg p-2" value={fDueDate} onChange={(e) => setFDueDate(e.target.value)} />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm mb-1">Parceiro (ID)</label>
                  <input className="w-full bg-muted border rounded-lg p-2" value={fPartnerId} onChange={(e) => setFPartnerId(e.target.value)} placeholder="UUID opcional" />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm mb-1">Segmento (ID)</label>
                  <input className="w-full bg-muted border rounded-lg p-2" value={fSegmentId} onChange={(e) => setFSegmentId(e.target.value)} placeholder="UUID opcional" />
                </div>

                {/* Extras do legado (UI-only) */}
                <div className="md:col-span-4">
                  <label className="block text-sm mb-1">Método de Pagamento</label>
                  <input className="w-full bg-muted border rounded-lg p-2" value={fPaymentMethod} onChange={(e) => setFPaymentMethod(e.target.value)} placeholder="ex: PIX, Boleto" />
                </div>
                <div className="md:col-span-4">
                  <label className="block text-sm mb-1">Nº Documento</label>
                  <input className="w-full bg-muted border rounded-lg p-2" value={fDocumentNumber} onChange={(e) => setFDocumentNumber(e.target.value)} placeholder="ex: NF 123" />
                </div>
                <div className="md:col-span-12">
                  <label className="block text-sm mb-1">Observações</label>
                  <textarea className="w-full bg-muted border rounded-lg p-2" rows={3} value={fNotes} onChange={(e) => setFNotes(e.target.value)} placeholder="Notas internas (UI-only)" />
                </div>

                <div className="md:col-span-12 flex items-center gap-3">
                  <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600" disabled={loading}>
                    {loading ? 'Salvando...' : editingId ? 'Salvar Alterações (Enter)' : 'Adicionar Documento (Enter)'}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelAndReset}>{editingId ? 'Cancelar Edição (Esc)' : 'Cancelar (Esc)'}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmação de exclusão */}
      <ConfirmDelete remove={remove} />
    </div>
  );
}

// Componente interno simples de confirmação para manter o arquivo abaixo de 500 linhas
function ConfirmDelete({ remove }: { remove: (id: string) => Promise<boolean> }) {
  const [confirmId, setConfirmId] = React.useState<string | null>(null);
  // Expor setter ao escopo pai via efeito global simplificado
  (globalThis as any).setFinancialConfirmId = setConfirmId; // uso interno apenas

  return (
    <>
      {confirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 border border-white/10 rounded-md p-6 max-w-sm w-full">
            <div className="text-lg font-medium mb-2">Você tem certeza?</div>
            <p className="text-sm text-gray-400 mb-4">Esta ação não poderá ser desfeita.</p>
            <div className="flex justify-end gap-2">
              <button className="px-3 py-2 rounded-md border border-white/10" onClick={() => setConfirmId(null)}>Cancelar</button>
              <button className="px-3 py-2 rounded-md border border-red-500 text-red-400" onClick={async () => { await remove(confirmId); setConfirmId(null); }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Helper para abrir confirmação do escopo da tabela
function setConfirmId(id: string) {
  const setter = (globalThis as any).setFinancialConfirmId as React.Dispatch<React.SetStateAction<string | null>> | undefined;
  setter?.(id);
}
