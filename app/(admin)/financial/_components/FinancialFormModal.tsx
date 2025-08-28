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

  // Console log para abertura e fechamento do modal
  React.useEffect(() => {
    if (open) {
      console.log('🔵 Modal financeiro aberto:', { isEditing, editingDoc });
    } else {
      console.log('🔴 Modal financeiro fechado');
    }
  }, [open, isEditing, editingDoc]);

  // Form state
  const [fDirection, setFDirection] = React.useState<string>('');
  const [fDescription, setFDescription] = React.useState<string>('');
  const [fAmount, setFAmount] = React.useState<string>('');
  const [fIssueDate, setFIssueDate] = React.useState<string>('');
  const [fDueDate, setFDueDate] = React.useState<string>('');
  const [fStatus, setFStatus] = React.useState<string>('draft');
  const [fPartnerId, setFPartnerId] = React.useState<string>('');
  const [fSegmentId, setFSegmentId] = React.useState<string>('');
  const [fPaymentMethodId, setFPaymentMethodId] = React.useState<string>('');
  const [fNotes, setFNotes] = React.useState<string>('');
  const [fDocNo, setFDocNo] = React.useState<string>('');

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
      setFDirection(editingDoc.direction || '');
      setFDescription(editingDoc.description || '');
      setFAmount(editingDoc.amount != null ? String(editingDoc.amount) : '');
      setFIssueDate(editingDoc.issue_date || '');
      setFDueDate(editingDoc.due_date || '');
      setFStatus(editingDoc.status || 'draft');
      setFPartnerId(editingDoc.partner_id || '');
      setPartnerQuery(editingDoc.partner?.name || editingDoc.partner_name || '');
      setFSegmentId(editingDoc.segment_id || '');
      setFPaymentMethodId(editingDoc.payment_method_id || '');
      setFNotes(editingDoc.notes || '');
      setFDocNo(editingDoc.doc_no || '');
    } else {
      // defaults for new
      setFDirection('');
      setFDescription('');
      setFAmount('');
      setFIssueDate('');
      setFDueDate('');
      setFStatus('draft');
      setFPartnerId('');
      setPartnerQuery('');
      setFSegmentId('');
      setFPaymentMethodId('');
      setFNotes('');
      setFDocNo('');
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
        const response = await import('@/services/partnersService').then(module => module.listPartners({ q, page: 1, pageSize: 10 }));
        const partners = response.data?.partners || [];
        setPartnerOptions(partners.map((p) => ({ id: p.id, name: p.name })));
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
      direction: fDirection || null,
      description: fDescription || null,
      amount: amountNum,
      issue_date: fIssueDate || null,
      due_date: fDueDate || null,
      status: fStatus || null,
      partner_id: fPartnerId || null,
      segment_id: fSegmentId || null,
      payment_method_id: fPaymentMethodId || null,
      doc_no: fDocNo || null,
      notes: fNotes || null,
    } as any;

    if (isEditing && editingDoc?.id) {
      console.log('📝 Editando documento financeiro:', { id: editingDoc.id, payload });
      const result = await onUpdate(editingDoc.id, payload);
      console.log('✅ Resposta do backend (update):', result);
    } else {
      console.log('➕ Criando novo documento financeiro:', payload);
      const result = await onCreate(payload);
      console.log('✅ Resposta do backend (create):', result);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.98, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: 8 }} className="relative glass-effect border border-border/30 rounded-xl w-[95vw] max-w-4xl max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-border/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                  {isEditing ? '📝' : '➕'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{isEditing ? 'Editar Documento' : 'Novo Documento'}</h2>
                  <p className="text-sm text-muted-foreground">{isEditing ? 'Modifique as informações do documento financeiro' : 'Preencha os dados do novo documento financeiro'}</p>
                </div>
              </div>
              <button 
                className="p-2 rounded-lg border border-border/50 hover:bg-muted/50 transition-all text-muted-foreground hover:text-foreground" 
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Primeira linha - Informações principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Tipo de Movimentação *</label>
                  <select className="w-full bg-muted/50 border border-border/50 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={fDirection} onChange={(e) => setFDirection(e.target.value)}>
                    <option value="">Selecione...</option>
                    <option value="receivable">💰 Entrada (Recebível)</option>
                    <option value="payable">💸 Saída (Pagável)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Valor *</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className={`w-full bg-muted/50 border rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${amountError ? 'border-red-500 focus:ring-red-500/20' : 'border-border/50'}`} 
                    value={fAmount} 
                    onChange={(e) => setFAmount(e.target.value)} 
                    placeholder="0,00" 
                  />
                  {amountError && <p className="mt-1 text-xs text-red-400">{amountError}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Status</label>
                  <select className="w-full bg-muted/50 border border-border/50 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
                    <option value="draft">📝 Rascunho</option>
                    <option value="open">🔓 Aberto</option>
                    <option value="partially_paid">⏳ Parcialmente Pago</option>
                    <option value="paid">✅ Pago</option>
                    <option value="canceled">❌ Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Segunda linha - Descrição */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Descrição *</label>
                <input 
                  ref={firstInputRef} 
                  className={`w-full bg-muted/50 border rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${descError ? 'border-red-500 focus:ring-red-500/20' : 'border-border/50'}`} 
                  value={fDescription} 
                  onChange={(e) => setFDescription(e.target.value)} 
                  placeholder="Descrição do documento financeiro" 
                />
                {descError && <p className="mt-1 text-xs text-red-400">{descError}</p>}
              </div>

              {/* Terceira linha - Datas e Cliente/Fornecedor */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Data Emissão</label>
                  <input 
                    type="date" 
                    className="w-full bg-muted/50 border border-border/50 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    value={fIssueDate} 
                    onChange={(e) => setFIssueDate(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Vencimento</label>
                  <input 
                    type="date" 
                    className="w-full bg-muted/50 border border-border/50 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    value={fDueDate} 
                    onChange={(e) => setFDueDate(e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Cliente/Fornecedor</label>
                  <div className="relative">
                    <input
                      ref={partnerInputRef}
                      className="w-full bg-muted/50 border border-border/50 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      value={partnerQuery}
                      onChange={(e) => { setPartnerQuery(e.target.value); setShowPartnerList(true); }}
                      onFocus={() => setShowPartnerList(true)}
                      placeholder="Digite para buscar..."
                    />
                    {showPartnerList && (partnerOptions.length > 0 || loadingPartners) && (
                      <div className="absolute z-10 mt-1 w-full max-h-52 overflow-auto rounded-lg border border-border/50 bg-background/95 backdrop-blur-sm shadow-lg">
                        {loadingPartners && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">🔍 Buscando...</div>
                        )}
                        {!loadingPartners && partnerOptions.map((opt) => (
                          <button
                            type="button"
                            key={opt.id}
                            className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-muted/50 transition-colors ${fPartnerId === opt.id ? 'bg-primary/10 text-primary' : ''}`}
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
                    <p className="mt-1 text-xs text-muted-foreground">✓ Selecionado: {partnerQuery}</p>
                  )}
                </div>
              </div>

              {/* Quarta linha - Segmento, Método de Pagamento e Nº Documento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Segmento</label>
                  <select className="w-full bg-muted/50 border border-border/50 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" value={fSegmentId} onChange={(e) => setFSegmentId(e.target.value)}>
                    <option value="">Sem segmento</option>
                    {Array.isArray(segments) && segments.map((s) => (
                      <option key={s.id} value={s.id}>{s.code ? `${s.code} - ` : ''}{s.name || s.id}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Método de Pagamento</label>
                  <select
                    className="w-full bg-muted/50 border border-border/50 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={fPaymentMethodId}
                    onChange={(e) => setFPaymentMethodId(e.target.value)}
                  >
                    <option value="">Sem método</option>
                    {paymentMethods.map((pm) => (
                      <option key={pm.id} value={pm.id}>{pm.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-foreground">Nº Documento</label>
                  <input 
                    className="w-full bg-muted/50 border border-border/50 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" 
                    value={fDocNo} 
                    onChange={(e) => setFDocNo(e.target.value)} 
                    placeholder="ex: NF 123" 
                  />
                </div>
              </div>

              {/* Quinta linha - Observações */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">Observações</label>
                <textarea 
                  className="w-full bg-muted/50 border border-border/50 rounded-lg p-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" 
                  rows={3} 
                  value={fNotes} 
                  onChange={(e) => setFNotes(e.target.value)} 
                  placeholder="Notas internas sobre o documento..." 
                />
              </div>

              {/* Botões de ação */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/20">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="px-6 py-2.5 border-border/50 hover:bg-muted/50 transition-all"
                >
                  {isEditing ? '❌ Cancelar Edição (Esc)' : '❌ Cancelar (Esc)'}
                </Button>
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-6 py-2.5 shadow-lg hover:shadow-xl transition-all" 
                  disabled={loading}
                >
                  {loading ? '⏳ Salvando...' : isEditing ? '💾 Salvar Alterações (Enter)' : '➕ Adicionar Documento (Enter)'}
                </Button>
               </div>
             </form>
             </div>
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
