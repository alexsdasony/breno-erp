'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useFinancialDocuments } from '../_hooks/useFinancialDocuments';
import { Plus, Filter, FileDown, Zap } from 'lucide-react';
import { listSegments } from '@/services/segmentsService';
import { usePaymentMethodsContext } from '@/contexts/PaymentMethodsContext';
import { useAppData } from '@/hooks/useAppData';
import { toast } from '@/components/ui/use-toast';
import FinancialDetailsDialog from './FinancialDetailsDialog';
import ConfirmDelete from './ConfirmDelete';
import FinancialFilters from './FinancialFilters';
import FinancialTable from './FinancialTable';
import FinancialFormModal from './FinancialFormModal';
import FinancialQuickEntryModal from './FinancialQuickEntryModal';
import PluggyConnectButton from '@/components/pluggy/PluggyConnectButton';

export default function FinancialView() {
  const [pageSize, setPageSize] = React.useState<number>(20);
  
  // UI state - filtros
  const [dateStart, setDateStart] = React.useState<string>('');
  const [dateEnd, setDateEnd] = React.useState<string>('');
  
  // Converter datas para formato ISO
  const dateStartISO = React.useMemo(() => {
    if (!dateStart) return '';
    if (dateStart.includes('-') && dateStart.length === 10) return dateStart;
    if (dateStart.includes('/')) {
      const [day, month, year] = dateStart.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return '';
  }, [dateStart]);
  
  const dateEndISO = React.useMemo(() => {
    if (!dateEnd) return '';
    if (dateEnd.includes('-') && dateEnd.length === 10) return dateEnd;
    if (dateEnd.includes('/')) {
      const [day, month, year] = dateEnd.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return '';
  }, [dateEnd]);
  
  const { paymentMethods } = usePaymentMethodsContext();
  const { activeSegmentId, currentUser } = useAppData();
  const [type, setType] = React.useState<string>(''); // receita, despesa, transferencia
  const [partner, setPartner] = React.useState<string>('');
  const [segment, setSegment] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  
  // Quando um segmento específico é selecionado no filtro, usar ele; caso contrário, usar o activeSegmentId global
  const segmentIdForApi = segment || activeSegmentId || '';
  
  const { items, loading, refetching, hasMore, loadMore, create, update, remove, load } = useFinancialDocuments(pageSize, dateStartISO, dateEndISO, segmentIdForApi);

  // Modal state (criar/editar)
  const [showForm, setShowForm] = React.useState(false);
  const [editingDoc, setEditingDoc] = React.useState<any | null>(null);
  
  // Modal state (lançamento avulso)
  const [showQuickEntry, setShowQuickEntry] = React.useState(false);

  // Form state movido para FinancialFormModal

  // Validações movidas para FinancialFormModal

  // Ref do campo de busca (filtros)
  const filterSearchRef = React.useRef<HTMLInputElement | null>(null);

  const cancelAndReset = React.useCallback(() => {
    setEditingDoc(null);
    setShowForm(false);
  }, []);

  // Função para limpar todos os filtros
  const clearFilters = React.useCallback(() => {
    setDateStart('');
    setDateEnd('');
    setType('');
    setPartner('');
    setSegment('');
    setStatus('');
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

  // Ref para controlar sincronização em andamento (evita problemas de stale closure)
  const isSyncingRef = React.useRef(false);

  // Sincronização automática com PLUGGY ao abrir o menu financeiro
  React.useEffect(() => {
    let isMounted = true;
    let syncTimeout: ReturnType<typeof setTimeout> | null = null;

    const syncPluggy = async () => {
      // Evitar múltiplas sincronizações simultâneas
      if (isSyncingRef.current) {
        console.log('⏸️ Sincronização PLUGGY já em andamento, ignorando...');
        return;
      }

      if (!currentUser?.id) {
        console.log('⏸️ Usuário não autenticado, ignorando sincronização PLUGGY...');
        return;
      }

      try {
        isSyncingRef.current = true;
        console.log('🔄 Iniciando sincronização automática com PLUGGY...');
        
        // Criar token base64 para X-User-Token (formato esperado pela API)
        let userToken = null;
        try {
          const tokenPayload = {
            user_id: currentUser.id,
            email: currentUser.email || ''
          };
          // Usar btoa para criar base64 no browser
          userToken = typeof window !== 'undefined' 
            ? btoa(JSON.stringify(tokenPayload))
            : null;
        } catch (error) {
          console.warn('⚠️ Erro ao criar token de usuário:', error);
          return;
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };

        if (userToken) {
          headers['X-User-Token'] = userToken;
        }

        const response = await fetch('/api/pluggy/sync', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            segmentId: segmentIdForApi || null
          })
        });

        if (!isMounted) return;

        let result: any = {};
        try {
          result = await response.json();
        } catch (parseError) {
          console.error('❌ Erro ao parsear resposta:', parseError);
          const text = await response.text();
          console.error('📄 Resposta bruta:', text);
        }
        
        console.log('📥 Resposta completa da sincronização:', {
          status: response.status,
          ok: response.ok,
          result: JSON.stringify(result, null, 2)
        });
        
        if (response.ok && result.success) {
          console.log('✅ Sincronização PLUGGY concluída:', {
            importadas: result.imported || 0,
            atualizadas: result.updated || 0,
            periodo: result.period,
            itemsSincronizados: result.itemsSincronizados || 0,
            syncResults: result.syncResults
          });
          
          // Log detalhado dos resultados
          if (result.syncResults && Array.isArray(result.syncResults)) {
            console.log('📋 Detalhes dos itens sincronizados:');
            result.syncResults.forEach((syncResult: any, index: number) => {
              console.log(`  Item ${index + 1}:`, {
                itemId: syncResult.itemId,
                total: syncResult.total,
                imported: syncResult.imported,
                updated: syncResult.updated,
                period: syncResult.period,
                error: syncResult.error
              });
            });
          }
          
          // Recarregar dados após sincronização bem-sucedida (sempre recarregar para garantir dados atualizados)
          load(true);
          
          // Mostrar toast se houver novas importações
          if (result.imported > 0) {
            toast({
              title: 'Sincronização concluída',
              description: `${result.imported} transação(ões) importada(s) da PLUGGY`
            });
          }
        } else {
          console.warn('⚠️ Sincronização PLUGGY não retornou sucesso:', {
            status: response.status,
            result
          });
          
          // Tratar erro 400 (sem itens conectados) de forma diferente
          if (response.status === 400) {
            console.log('ℹ️ Nenhum item Pluggy encontrado - isso é normal se não houver contas conectadas');
            // Não mostrar erro para o usuário, apenas logar
            // O usuário pode conectar uma conta usando o botão "Conectar Conta Bancária"
          } else {
            // Mostrar erro ao usuário para outros tipos de erro
            const errorMessage = result.error || result.message || 'Erro desconhecido na sincronização';
            toast({
              title: 'Erro na sincronização',
              description: errorMessage,
              variant: 'destructive'
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('❌ Erro ao sincronizar com PLUGGY:', error);
          // Não mostrar erro ao usuário, apenas logar
        }
      } finally {
        if (isMounted) {
          isSyncingRef.current = false;
        }
      }
    };

    // Executar sincronização após um pequeno delay para não bloquear a renderização inicial
    syncTimeout = setTimeout(() => {
      if (isMounted && currentUser) {
        syncPluggy();
      }
    }, 1000); // Delay de 1 segundo após montar o componente

    return () => {
      isMounted = false;
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
    };
  }, [currentUser?.id, segmentIdForApi, load]); // Executar quando usuário ou segmento mudar

  // KPIs reais buscados da API dedicada
  const [kpis, setKpis] = React.useState({ entradas: 0, saidas: 0, saldo: 0 });
  const [kpisLoading, setKpisLoading] = React.useState(false);
  const [totalRecords, setTotalRecords] = React.useState(0);

  // Buscar KPIs reais quando o segmento ou tipo mudar (considerando filtros locais também)
  React.useEffect(() => {
    const fetchKpis = async () => {
      setKpisLoading(true);
      try {
        // Usar segmentIdForApi que considera tanto o filtro local quanto o global
        const segmentIdToUse = segmentIdForApi || 'null';
        
        // Construir query string com filtros
        const params = new URLSearchParams();
        params.set('segment_id', segmentIdToUse);
        
        // Adicionar filtro de tipo se selecionado
        if (type && (type === 'receivable' || type === 'payable')) {
          params.set('direction', type);
        }
        
        const response = await fetch(`/api/financial-kpis?${params.toString()}`);
        const data = await response.json();
        
        if (data.success && data.kpis) {
          setKpis(data.kpis);
          setTotalRecords(data.totalRecords || 0);
          console.log('📊 KPIs carregados:', data.kpis, 'para segmento:', segmentIdToUse, 'tipo:', type || 'todos');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar KPIs:', error);
      } finally {
        setKpisLoading(false);
      }
    };

    fetchKpis();
  }, [segmentIdForApi, type]); // Adicionar 'type' às dependências para atualizar quando o tipo mudar

  // Recarregar dados quando os filtros de data ou segmento mudarem (com debounce)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      console.log('🔄 Filtros alterados, recarregando dados...', { dateStartISO, dateEndISO, segmentIdForApi, segment });
      load(true);
    }, 300); // Aguarda 300ms após parar de digitar
    
    return () => clearTimeout(timer);
  }, [dateStartISO, dateEndISO, segment, segmentIdForApi, load]);

  const { entradas, saidas, saldo } = kpis;

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
    console.log('🔍 openEdit - doc recebido:', doc);
    console.log('🔍 openEdit - doc.id:', doc?.id);
    console.log('🔍 openEdit - tipo do ID:', typeof doc?.id);
    setEditingDoc(doc);
    window.setTimeout(() => setShowForm(true), 0);
  };

  // Submissão do formulário movida para FinancialFormModal

  // Função para converter data BR para ISO
  const formatDateToISO = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('-') && dateStr.length === 10) return dateStr;
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr;
  };

  // Filtro em memória - incluindo todos os filtros
  const filtered = React.useMemo(() => {
    const p = partner.trim().toLowerCase();
    return items.filter((it) => {
      // Filtro por parceiro
      const matchesPartner = !p || `${it.partner_name || it.partner?.name || ''}`.toLowerCase().includes(p) || `${it.partner_id || ''}`.toLowerCase().includes(p);
      
      // Filtro por tipo (direction)
      // O tipo pode ser 'receivable' (Contas a Receber) ou 'payable' (Contas a Pagar)
      const matchesType = !type || (it.direction || '') === type;
      
      // Filtro por status
      const matchesStatus = !status || (it.status || '') === status;
      
      // Filtro por segmento: se um segmento específico foi selecionado no filtro, usar apenas ele
      // Caso contrário, usar o activeSegmentId global
      const segmentToMatch = segment || activeSegmentId;
      const matchesSegment = !segmentToMatch || segmentToMatch === '0' ||
                            (it.segment_id && String(it.segment_id) === String(segmentToMatch));
      
      // Filtro por data de emissão
      let matchesDateStart = true;
      if (dateStart) {
        const startDate = formatDateToISO(dateStart);
        const itemDate = it.issue_date;
        if (itemDate && startDate) {
          // Comparar apenas a data (sem hora)
          const itemDateOnly = new Date(itemDate).setHours(0, 0, 0, 0);
          const startDateOnly = new Date(startDate).setHours(0, 0, 0, 0);
          matchesDateStart = itemDateOnly >= startDateOnly;
        }
      }
      
      // Filtro por data de vencimento (também usando issue_date para intervalo)
      let matchesDateEnd = true;
      if (dateEnd) {
        const endDate = formatDateToISO(dateEnd);
        const itemDate = it.issue_date;
        if (itemDate && endDate) {
          // Comparar apenas a data (sem hora)
          const itemDateOnly = new Date(itemDate).setHours(0, 0, 0, 0);
          const endDateOnly = new Date(endDate).setHours(0, 0, 0, 0);
          matchesDateEnd = itemDateOnly <= endDateOnly;
        }
      }
      
      return matchesPartner && matchesType && matchesStatus && matchesSegment && matchesDateStart && matchesDateEnd;
    });
  }, [items, partner, type, status, activeSegmentId, segment, dateStart, dateEnd, segmentIdForApi]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Registros por página:</label>
            <select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                load(true); // Recarregar dados com nova quantidade
              }}
              className="px-3 py-1 border border-border rounded-md bg-background text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
              <option value={1000}>1000</option>
            </select>
            <span className="text-sm text-muted-foreground">
              (Total: {totalRecords} registros)
            </span>
          </div>
          <PluggyConnectButton 
            onSuccess={(itemId) => {
              console.log('✅ Conta conectada:', itemId);
              // Recarregar dados após conectar conta
              load(true);
            }}
          />
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filtros</Button>
          <Button variant="outline" disabled><FileDown className="w-4 h-4 mr-2" />Exportar</Button>
          <Button 
            variant="outline" 
            onClick={() => setShowQuickEntry(true)}
            className="bg-primary/10 hover:bg-primary/20"
          >
            <Zap className="w-4 h-4 mr-2" />
            Lançamento Avulso
          </Button>
          <Button id="financial-new" onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novo</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect rounded-lg p-4 border">
          <div className="text-sm text-muted-foreground">Entradas</div>
          <div className="text-xl font-semibold text-green-400">
            {kpisLoading ? 'Carregando...' : currency(entradas)}
          </div>
        </div>
        <div className="glass-effect rounded-lg p-4 border">
          <div className="text-sm text-muted-foreground">Saídas</div>
          <div className="text-xl font-semibold text-red-400">
            {kpisLoading ? 'Carregando...' : currency(Math.abs(saidas))}
          </div>
        </div>
        <div className="glass-effect rounded-lg p-4 border">
          <div className="text-sm text-muted-foreground">Saldo</div>
          <div className="text-xl font-semibold">
            {kpisLoading ? 'Carregando...' : currency(saldo)}
          </div>
        </div>
      </div>

      {/* Filtros avançados */}
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
        onClearFilters={clearFilters}
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

      {/* Modal de Lançamento Avulso */}
      <FinancialQuickEntryModal
        open={showQuickEntry}
        onClose={() => setShowQuickEntry(false)}
        segments={segments}
        onCreate={() => {
          load(true); // Recarregar lista após criar
        }}
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
