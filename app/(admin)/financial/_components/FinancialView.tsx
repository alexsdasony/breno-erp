'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useFinancialDocuments } from '../_hooks/useFinancialDocuments';
import { Plus, Filter, FileDown } from 'lucide-react';
import { listSegments } from '@/services/segmentsService';
import { usePaymentMethodsContext } from '@/contexts/PaymentMethodsContext';
import { useAppData } from '@/hooks/useAppData';
import FinancialDetailsDialog from './FinancialDetailsDialog';
import ConfirmDelete from './ConfirmDelete';
import FinancialFilters from './FinancialFilters';
import FinancialTable from './FinancialTable';
import FinancialFormModal from './FinancialFormModal';

export default function FinancialView() {
  const { items, loading, refetching, hasMore, loadMore, create, update, remove } = useFinancialDocuments();
  const { paymentMethods } = usePaymentMethodsContext();
  const { activeSegmentId } = useAppData();

  // UI state - filtros (somente UI por enquanto)
  const [dateStart, setDateStart] = React.useState<string>('');
  const [dateEnd, setDateEnd] = React.useState<string>('');
  const [type, setType] = React.useState<string>(''); // receita, despesa, transferencia
  const [partner, setPartner] = React.useState<string>('');
  const [segment, setSegment] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');

  // Modal state (criar/editar)
  const [showForm, setShowForm] = React.useState(false);
  const [editingDoc, setEditingDoc] = React.useState<any | null>(null);

  // Form state movido para FinancialFormModal

  // Validações movidas para FinancialFormModal

  // Ref do campo de busca (filtros)
  const filterSearchRef = React.useRef<HTMLInputElement | null>(null);

  const cancelAndReset = React.useCallback(() => {
    setEditingDoc(null);
    setShowForm(false);
  }, []);

  // Atalhos e foco do form movidos para FinancialFormModal

  // Foco do formulário movido para FinancialFormModal

  // Foco inicial na página: campo de parceiro nos filtros
  React.useEffect(() => {
    const t = window.setTimeout(() => {
      filterSearchRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  // KPIs simples a partir de items filtrados por segmento
  const { entradas, saidas, saldo } = React.useMemo(() => {
    // Filtrar por segmento ativo
    const filteredItems = items.filter(item => {
      const matchesSegment = !activeSegmentId || activeSegmentId === '0' ||
                            (item.segment_id && item.segment_id === activeSegmentId);
      return matchesSegment;
    });

    let inSum = 0;
    let outSum = 0;
    for (const it of filteredItems) {
      const val = Number(it.amount || 0);
      if (val >= 0) inSum += val; else outSum += val; // valores negativos contam como saída
    }
    return { entradas: inSum, saidas: outSum, saldo: inSum + outSum };
  }, [items, activeSegmentId]);

  // Funções auxiliares
  const currency = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const pmMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const pm of paymentMethods) map[pm.id] = pm.name;
    return map;
  }, [paymentMethods]);

  // Details dialog state
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [detailsDoc, setDetailsDoc] = React.useState<any | null>(null);
  const openDetails = (doc: any) => { setDetailsDoc(doc); setDetailsOpen(true); };

  // Delete confirm state
  const [confirmId, setConfirmId] = React.useState<string | null>(null);

  // Segments (para o select)
  const [segments, setSegments] = React.useState<Array<{ id: string; name?: string; code?: string }>>([]);

  // Carregar segmentos (uma vez ao montar)

  // Carregar segmentos para os filtros ao montar a página
  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await listSegments({ page: 1, pageSize: 100 });
        if (active && response.data?.segments) {
          setSegments(response.data.segments);
        }
      } catch {
        // silencioso
      }
    })();
    return () => { active = false; };
  }, []);

  // Autocomplete de parceiros movido para FinancialFormModal

  const openNew = () => {
    setEditingDoc(null);
    setShowForm(true);
  };

  const openEdit = (doc: any, ev?: React.MouseEvent) => {
    ev?.preventDefault();
    ev?.stopPropagation();
    setEditingDoc(doc);
    window.setTimeout(() => setShowForm(true), 0);
  };

  // Submissão do formulário movida para FinancialFormModal

  // Filtro em memória (somente UI) - incluindo segmento
  const filtered = React.useMemo(() => {
    const p = partner.trim().toLowerCase();
    return items.filter((it) => {
      const matchesPartner = !p || `${it.partner_name || it.partner?.name || ''}`.toLowerCase().includes(p) || `${it.partner_id || ''}`.toLowerCase().includes(p);
      const matchesType = !type || (it.direction || '') === type;
      const matchesStatus = !status || (it.status || '') === status;
      const matchesSegment = !activeSegmentId || activeSegmentId === '0' ||
                            (it.segment_id && it.segment_id === activeSegmentId);
      // Datas como UI por enquanto (não aplicados)
      return matchesPartner && matchesType && matchesStatus && matchesSegment;
    });
  }, [items, partner, type, status, activeSegmentId]);

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
      <FinancialFilters
        dateStart={dateStart}
        setDateStart={setDateStart}
        dateEnd={dateEnd}
        setDateEnd={setDateEnd}
        type={type}
        setType={setType}
        status={status}
        setStatus={setStatus}
        segment={segment}
        setSegment={setSegment}
        partner={partner}
        setPartner={setPartner}
        segments={segments}
        filterSearchRef={filterSearchRef}
      />

      {/* Tabela */}
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <FinancialTable
            items={filtered as any[]}
            currency={currency}
            pmMap={pmMap}
            onDetails={openDetails}
            onEdit={openEdit}
            onAskDelete={(id) => setConfirmId(id)}
          />
        </motion.div>
      </AnimatePresence>

      {/* Loading durante refetch */}
      {refetching && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span>Atualizando dados...</span>
          </div>
        </div>
      )}

      {/* Paginação */}
      <div className="flex gap-2">
        <Button disabled={loading || !hasMore} onClick={() => void loadMore()}>
          {loading ? 'Carregando...' : hasMore ? 'Carregar mais' : 'Fim da lista'}
        </Button>
      </div>

      {/* Modal de Criar/Editar */}
      <FinancialFormModal
        open={showForm}
        onClose={cancelAndReset}
        loading={loading}
        editingDoc={editingDoc}
        segments={segments}
        paymentMethods={paymentMethods}
        onCreate={async (payload) => { return await create(payload); }}
        onUpdate={async (id, payload) => { return await update(id, payload); }}
      />

      {/* Confirmação de exclusão */}
      <ConfirmDelete
        open={!!confirmId}
        onCancel={() => setConfirmId(null)}
        onConfirm={async () => { if (confirmId) { await remove(confirmId); setConfirmId(null); } }}
      />

      {/* Detalhes do documento */}
      <FinancialDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        doc={detailsDoc}
        pmMap={pmMap}
        currency={currency}
        onEdit={(e) => { setDetailsOpen(false); openEdit(detailsDoc, e as any); }}
      />

      {/* (Inline helpers removidos – usamos ConfirmDelete externo) */}
    </div>
  );
}
