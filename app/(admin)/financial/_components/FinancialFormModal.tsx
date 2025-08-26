"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import apiService from '@/services/api';

type Segment = { id: string; name?: string; code?: string };

type Props = {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  editingDoc: any | null;
  segments: Segment[];
  paymentMethods: Array<{ id: string; name: string }>;
  onCreate: (payload: any) => Promise<void> | void;
  onUpdate: (id: string, payload: any) => Promise<void> | void;
};

export default function FinancialFormModal({ open, onClose, loading, editingDoc, segments, paymentMethods, onCreate, onUpdate }: Props) {
  const isEditing = !!editingDoc;

  // Form state
  const [fType, setFType] = React.useState<string>('');
  const [fDescription, setFDescription] = React.useState<string>('');
  const [fAmount, setFAmount] = React.useState<string>('');
  const [fDate, setFDate] = React.useState<string>('');
  const [fDueDate, setFDueDate] = React.useState<string>('');
  const [fStatus, setFStatus] = React.useState<string>('pending');
  const [fPartnerId, setFPartnerId] = React.useState<string>('');
  const [fSegmentId, setFSegmentId] = React.useState<string>('');
  const [fPaymentMethodId, setFPaymentMethodId] = React.useState<string>('');
  const [fNotes, setFNotes] = React.useState<string>('');
  const [fDocumentNumber, setFDocumentNumber] = React.useState<string>('');

  const [descError, setDescError] = React.useState<string | null>(null);
  const [amountError, setAmountError] = React.useState<string | null>(null);

  const firstInputRef = React.useRef<HTMLInputElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const partnerInputRef = React.useRef<HTMLInputElement | null>(null);

  // Partner autocomplete
  const [partnerQuery, setPartnerQuery] = React.useState<string>('');
  const [partnerOptions, setPartnerOptions] = React.useState<Array<{ id: string; name: string }>>([]);
  const [showPartnerList, setShowPartnerList] = React.useState(false);
  const [loadingPartners, setLoadingPartners] = React.useState(false);

  // Initialize from editingDoc
  React.useEffect(() => {
    if (!open) return;
    if (isEditing && editingDoc) {
      setFType(editingDoc.type || '');
      setFDescription(editingDoc.description || '');
      setFAmount(editingDoc.amount != null ? String(editingDoc.amount) : '');
      setFDate(editingDoc.date || '');
      setFDueDate(editingDoc.due_date || '');
      setFStatus(editingDoc.status || 'pending');
      setFPartnerId(editingDoc.partner_id || '');
      setPartnerQuery(editingDoc.partner_name || '');
      setFSegmentId(editingDoc.segment_id || '');
      setFPaymentMethodId(editingDoc.payment_method_id || '');
      setFNotes('');
      setFDocumentNumber('');
    } else {
      // defaults for new
      setFType('');
      setFDescription('');
      setFAmount('');
      setFDate('');
      setFDueDate('');
      setFStatus('pending');
      setFPartnerId('');
      setPartnerQuery('');
      setFSegmentId('');
      setFPaymentMethodId('');
      setFNotes('');
      setFDocumentNumber('');
    }
    setDescError(null);
    setAmountError(null);
  }, [open, isEditing, editingDoc]);

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
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
  }, [open, onClose]);

  // Focus first input
  React.useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      const el: any = firstInputRef.current;
      el?.focus?.();
      if (isEditing && typeof el?.select === 'function') el.select();
    }, 0);
    return () => window.clearTimeout(t);
  }, [open, isEditing]);

  // Autocomplete partners
  React.useEffect(() => {
    if (!open) return;
    const q = partnerQuery.trim();
    if (!q) {
      setPartnerOptions([]);
      return;
    }
    setLoadingPartners(true);
    const t = window.setTimeout(async () => {
      try {
        const res: any = await apiService.getPartners({ q, page: 1, pageSize: 10 });
        const list = (res.partners || res.data || []) as Array<any>;
        setPartnerOptions(list.map((p) => ({ id: p.id, name: p.name })));
      } catch {
        setPartnerOptions([]);
      } finally {
        setLoadingPartners(false);
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, [partnerQuery, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      payment_method_id: fPaymentMethodId || null,
    } as any;

    if (isEditing && editingDoc?.id) {
      await onUpdate(editingDoc.id, payload);
    } else {
      await onCreate(payload);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 8 }} className="relative glass-effect border rounded-xl w-[95vw] max-w-3xl max-h-[85vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{isEditing ? 'Editar Documento' : 'Novo Documento'}</h2>
              <button className="px-2 py-1 rounded-md border border-white/10" onClick={onClose}>Esc</button>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4" noValidate>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Tipo</label>
                <select className="w-full bg-muted border rounded-lg p-2" value={fType} onChange={(e) => setFType(e.target.value)}>
                  <option value="">Selecione...</option>
                  <option value="receipt">Receita</option>
                  <option value="expense">Despesa</option>
                  <option value="transfer">Transferência</option>
                </select>
              </div>
              <div className="md:col-span-6">
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
              <div className="md:col-span-6">
                <label className="block text-sm mb-1">Cliente/Fornecedor</label>
                <div className="relative">
                  <input
                    ref={partnerInputRef}
                    className="w-full bg-muted border rounded-lg p-2"
                    value={partnerQuery}
                    onChange={(e) => { setPartnerQuery(e.target.value); setShowPartnerList(true); }}
                    onFocus={() => setShowPartnerList(true)}
                    placeholder="Digite para buscar..."
                  />
                  {showPartnerList && (partnerOptions.length > 0 || loadingPartners) && (
                    <div className="absolute z-10 mt-1 w-full max-h-52 overflow-auto rounded-md border bg-background shadow">
                      {loadingPartners && (
                        <div className="px-3 py-2 text-sm text-muted-foreground">Buscando...</div>
                      )}
                      {!loadingPartners && partnerOptions.map((opt) => (
                        <button
                          type="button"
                          key={opt.id}
                          className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted/50 ${fPartnerId === opt.id ? 'bg-muted/30' : ''}`}
                          onClick={() => {
                            setFPartnerId(opt.id);
                            setPartnerQuery(opt.name);
                            setShowPartnerList(false);
                          }}
                        >
                          <span className="text-sm">{opt.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {fPartnerId && (
                  <p className="mt-1 text-xs text-muted-foreground">Selecionado: {partnerQuery} ({fPartnerId})</p>
                )}
              </div>
              <div className="md:col-span-6">
                <label className="block text-sm mb-1">Segmento</label>
                <select className="w-full bg-muted border rounded-lg p-2" value={fSegmentId} onChange={(e) => setFSegmentId(e.target.value)}>
                  <option value="">Sem segmento</option>
                  {segments.map((s) => (
                    <option key={s.id} value={s.id}>{s.code ? `${s.code} - ` : ''}{s.name || s.id}</option>
                  ))}
                </select>
              </div>

              {/* Método de Pagamento */}
              <div className="md:col-span-4">
                <label className="block text-sm mb-1">Método de Pagamento</label>
                <select
                  className="w-full bg-muted border rounded-lg p-2"
                  value={fPaymentMethodId}
                  onChange={(e) => setFPaymentMethodId(e.target.value)}
                >
                  <option value="">Sem método</option>
                  {paymentMethods.map((pm) => (
                    <option key={pm.id} value={pm.id}>{pm.name}</option>
                  ))}
                </select>
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
                  {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações (Enter)' : 'Adicionar Documento (Enter)'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>{isEditing ? 'Cancelar Edição (Esc)' : 'Cancelar (Esc)'}</Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
