'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { createFinancialDocument, updateFinancialDocument, deleteFinancialDocument, normalizeFinancialDocument } from '@/services/financialDocumentsService';
import type { FinancialDocument } from '@/types/FinancialDocument';
import { Plus, Filter, FileDown, Zap, Link } from 'lucide-react';
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
import BankAccountConnectionModal from './BankAccountConnectionModal';

export default function FinancialView() {
  console.log('🚀 [FinancialView] Componente renderizado - VERSÃO NOVA COM KPIs AUTOMÁTICOS');
  
  const [pageSize, setPageSize] = React.useState<number>(20);
  const [connectionModalOpen, setConnectionModalOpen] = React.useState<boolean>(false);
  
  // UI state - filtros
  const [dateStart, setDateStart] = React.useState<string>('');
  const [dateEnd, setDateEnd] = React.useState<string>('');
  
  // Função para validar e normalizar data - GARANTE FORMATO YYYY-MM-DD VÁLIDO
  const normalizeDate = React.useCallback((dateStr: string): string => {
    if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') {
      return '';
    }
    
    // Remover espaços
    const trimmed = dateStr.trim();
    
    // ✅ REJEITAR IMEDIATAMENTE se contém "undefined"
    if (trimmed.toLowerCase().includes('undefined') || trimmed.includes('undefined')) {
      console.error('❌ [NormalizeDate] Rejeitado por conter "undefined":', dateStr);
      return '';
    }
    
    // Se já está em formato ISO (YYYY-MM-DD)
    if (trimmed.includes('-') && trimmed.length === 10) {
      const parts = trimmed.split('-');
      if (parts.length !== 3) return '';
      
      // ✅ VALIDAR que nenhuma parte contém "undefined"
      if (parts.some(p => p.includes('undefined') || p.toLowerCase().includes('undefined'))) {
        console.error('❌ [NormalizeDate] Parte da data contém "undefined":', parts);
        return '';
      }
      
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const day = parseInt(parts[2], 10);
      
      // Validar números - REJEITAR se algum for NaN
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('❌ [NormalizeDate] Valores NaN detectados:', { year, month, day, original: dateStr });
        return '';
      }
      if (year < 1900 || year > 2100) return '';
      if (month < 1 || month > 12) return '';
      
      // Obter último dia do mês
      const lastDayOfMonth = new Date(year, month, 0).getDate();
      const validDay = Math.min(Math.max(1, day), lastDayOfMonth);
      
      // ✅ GARANTIR que year, month, validDay são números válidos antes de formatar
      const yearStr = String(year);
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(validDay).padStart(2, '0');
      
      // ✅ VALIDAÇÃO FINAL: garantir que nenhuma string contém "undefined"
      if (yearStr.includes('undefined') || monthStr.includes('undefined') || dayStr.includes('undefined')) {
        console.error('❌ [NormalizeDate] String formatada contém "undefined":', { yearStr, monthStr, dayStr });
        return '';
      }
      
      // Retornar formato YYYY-MM-DD válido
      return `${yearStr}-${monthStr}-${dayStr}`;
    }
    
    // Se está em formato BR (DD/MM/YYYY)
    if (trimmed.includes('/')) {
      const parts = trimmed.split('/');
      console.log('🔍 [NormalizeDate] Processando formato BR:', { original: dateStr, trimmed, parts });
      
      if (parts.length !== 3) {
        console.warn('⚠️ [NormalizeDate] Formato inválido - não tem 3 partes:', parts);
        return '';
      }
      
      // ✅ VALIDAR que todas as partes existem e não são vazias
      if (!parts[0] || !parts[1] || !parts[2]) {
        console.warn('⚠️ [NormalizeDate] Data incompleta:', { parts, original: dateStr });
        return '';
      }
      
      // ✅ VALIDAR que nenhuma parte contém "undefined"
      if (parts.some(p => p.includes('undefined') || p.toLowerCase().includes('undefined'))) {
        console.error('❌ [NormalizeDate] Parte da data contém "undefined":', parts);
        return '';
      }
      
      console.log('🔍 [NormalizeDate] Partes antes de parseInt:', { part0: parts[0], part1: parts[1], part2: parts[2] });
      
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const year = parseInt(parts[2], 10);
      
      console.log('🔍 [NormalizeDate] Valores após parseInt:', { day, month, year, dayType: typeof day, monthType: typeof month, yearType: typeof year });
      
      // Validar números - REJEITAR se algum for NaN
      if (isNaN(year) || isNaN(month) || isNaN(day)) {
        console.error('❌ [NormalizeDate] Data inválida - valores NaN:', { day, month, year, original: dateStr, parts });
        return '';
      }
      
      // ✅ VALIDAR que o ano tem 4 dígitos (não aceitar anos incompletos)
      if (parts[2].length < 4) {
        console.warn('⚠️ [NormalizeDate] Ano incompleto (menos de 4 dígitos):', parts[2]);
        return '';
      }
      
      if (year < 1900 || year > 2100) {
        console.warn('⚠️ [NormalizeDate] Ano inválido:', year);
        return '';
      }
      if (month < 1 || month > 12) {
        console.warn('⚠️ [NormalizeDate] Mês inválido:', month);
        return '';
      }
      
      // Obter último dia do mês
      const lastDayOfMonth = new Date(year, month, 0).getDate();
      const validDay = Math.min(Math.max(1, day), lastDayOfMonth);
      
      // Se o dia foi ajustado, logar
      if (day !== validDay) {
        console.warn(`⚠️ [NormalizeDate] Dia ajustado de ${day} para ${validDay} (mês ${month} tem ${lastDayOfMonth} dias)`);
      }
      
      // ✅ VALIDAÇÃO ABSOLUTA: Garantir que year, month, validDay são números válidos
      if (typeof year !== 'number' || isNaN(year) || year === undefined || year === null) {
        console.error('❌ [NormalizeDate] ERRO CRÍTICO: year inválido:', year);
        return '';
      }
      if (typeof month !== 'number' || isNaN(month) || month === undefined || month === null) {
        console.error('❌ [NormalizeDate] ERRO CRÍTICO: month inválido:', month);
        return '';
      }
      if (typeof validDay !== 'number' || isNaN(validDay) || validDay === undefined || validDay === null) {
        console.error('❌ [NormalizeDate] ERRO CRÍTICO: validDay inválido:', validDay);
        return '';
      }
      
      // Retornar formato YYYY-MM-DD válido - GARANTIR que year não seja undefined
      const yearStr = String(year);
      const monthStr = String(month).padStart(2, '0');
      const dayStr = String(validDay).padStart(2, '0');
      
      console.log('🔍 [NormalizeDate] Strings formatadas:', { yearStr, monthStr, dayStr, year, month, validDay });
      
      // ✅ VALIDAÇÃO FINAL: garantir que nenhuma string contém "undefined" ou está vazia
      if (yearStr.includes('undefined') || monthStr.includes('undefined') || dayStr.includes('undefined') || 
          yearStr === '' || monthStr === '' || dayStr === '' ||
          yearStr === 'undefined' || monthStr === 'undefined' || dayStr === 'undefined') {
        console.error('❌ [NormalizeDate] ERRO: String contém "undefined" ou está vazia!', { yearStr, monthStr, dayStr, original: dateStr, year, month, validDay });
        return '';
      }
      
      // ✅ VALIDAÇÃO FINAL: garantir formato correto
      const result = `${yearStr}-${monthStr}-${dayStr}`;
      console.log('🔍 [NormalizeDate] Resultado final:', result);
      
      if (!/^\d{4}-\d{2}-\d{2}$/.test(result)) {
        console.error('❌ [NormalizeDate] Formato final inválido:', result);
        return '';
      }
      
      if (result.includes('undefined')) {
        console.error('❌ [NormalizeDate] ERRO CRÍTICO: Resultado contém "undefined":', result);
        return '';
      }
      
      return result;
    }
    
    // Formato não reconhecido
    return '';
  }, []);

  // Converter datas para formato ISO - VALIDAÇÃO RIGOROSA
  const dateStartISO = React.useMemo(() => {
    console.log('🔍 [DateStartISO] Iniciando processamento:', { dateStart, type: typeof dateStart });
    
    // Se vazio, retornar string vazia (não undefined)
    if (!dateStart || typeof dateStart !== 'string' || dateStart.trim() === '') {
      console.log('🔍 [DateStartISO] Data vazia, retornando string vazia');
      return '';
    }
    
    const trimmed = dateStart.trim();
    console.log('🔍 [DateStartISO] Após trim:', trimmed);
    
    // ✅ REJEITAR IMEDIATAMENTE se contém "undefined" ou está incompleto
    if (trimmed.toLowerCase().includes('undefined') || trimmed.includes('undefined')) {
      console.error('❌ [DateStartISO] Rejeitado por conter "undefined":', dateStart);
      return '';
    }
    
    // ✅ REJEITAR se a data está incompleta (menos de 10 caracteres para DD/MM/YYYY)
    // OU se tem 10 caracteres mas o ano está incompleto (ex: "29/11/202" tem 10 chars mas ano incompleto)
    if (trimmed.includes('/')) {
      if (trimmed.length < 10) {
        console.warn('⚠️ [DateStartISO] Data incompleta (menos de 10 caracteres):', dateStart);
        return '';
      }
      // Verificar se o ano tem 4 dígitos (últimos 4 caracteres após o segundo "/")
      const parts = trimmed.split('/');
      if (parts.length === 3 && parts[2] && parts[2].length < 4) {
        console.warn('⚠️ [DateStartISO] Ano incompleto (menos de 4 dígitos):', dateStart, 'ano:', parts[2]);
        return '';
      }
    }
    
    // Normalizar data
    console.log('🔍 [DateStartISO] Chamando normalizeDate com:', trimmed);
    const normalized = normalizeDate(trimmed);
    console.log('🔍 [DateStartISO] Resultado de normalizeDate:', normalized);
    
    // ✅ VALIDAÇÃO FINAL: garantir que normalized não contém "undefined"
    if (normalized && normalized.includes('undefined')) {
      console.error('❌ [DateStartISO] Normalização retornou "undefined":', normalized);
      return '';
    }
    
    // Validar formato final YYYY-MM-DD rigorosamente
    if (!normalized || normalized === '' || !/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      console.warn('⚠️ [DateStartISO] Normalização falhou:', dateStart, '->', normalized);
      return '';
    }
    
    // Validação final: garantir que é uma data válida
    const [year, month, day] = normalized.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    if (day > lastDay || day < 1 || month < 1 || month > 12 || year < 1900 || year > 2100) {
      console.warn('⚠️ [DateStartISO] Data inválida após normalização:', normalized);
      return '';
    }
    
    // ✅ VALIDAÇÃO FINAL: garantir que a string não contém "undefined"
    if (normalized.includes('undefined')) {
      console.error('❌ [DateStartISO] ERRO CRÍTICO: normalized contém "undefined":', normalized);
      return '';
    }
    
    console.log('✅ [DateStartISO] Retornando data normalizada:', normalized);
    return normalized;
  }, [dateStart, normalizeDate]);
  
  const dateEndISO = React.useMemo(() => {
    // Se vazio, retornar string vazia (não undefined)
    if (!dateEnd || typeof dateEnd !== 'string' || dateEnd.trim() === '') {
      return '';
    }
    
    const trimmed = dateEnd.trim();
    
    // ✅ REJEITAR IMEDIATAMENTE se contém "undefined" ou está incompleto
    if (trimmed.toLowerCase().includes('undefined') || trimmed.includes('undefined')) {
      console.error('❌ [DateEnd] Rejeitado por conter "undefined":', dateEnd);
      return '';
    }
    
    // ✅ REJEITAR se a data está incompleta (menos de 10 caracteres para DD/MM/YYYY)
    // OU se tem 10 caracteres mas o ano está incompleto (ex: "29/11/202" tem 10 chars mas ano incompleto)
    if (trimmed.includes('/')) {
      if (trimmed.length < 10) {
        console.warn('⚠️ [DateEnd] Data incompleta (menos de 10 caracteres):', dateEnd);
        return '';
      }
      // Verificar se o ano tem 4 dígitos (últimos 4 caracteres após o segundo "/")
      const parts = trimmed.split('/');
      if (parts.length === 3 && parts[2] && parts[2].length < 4) {
        console.warn('⚠️ [DateEnd] Ano incompleto (menos de 4 dígitos):', dateEnd, 'ano:', parts[2]);
        return '';
      }
    }
    
    // Normalizar data
    const normalized = normalizeDate(trimmed);
    
    // ✅ VALIDAÇÃO FINAL: garantir que normalized não contém "undefined"
    if (normalized && normalized.includes('undefined')) {
      console.error('❌ [DateEnd] Normalização retornou "undefined":', normalized);
      return '';
    }
    
    // Validar formato final YYYY-MM-DD rigorosamente
    if (!normalized || normalized === '' || !/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
      console.warn('⚠️ [DateEnd] Normalização falhou:', dateEnd, '->', normalized);
      return '';
    }
    
    // Validação final: garantir que é uma data válida
    const [year, month, day] = normalized.split('-').map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    if (day > lastDay || day < 1 || month < 1 || month > 12 || year < 1900 || year > 2100) {
      console.warn('⚠️ [DateEnd] Data inválida após normalização:', normalized);
      return '';
    }
    
    // ✅ VALIDAÇÃO FINAL: garantir que a string não contém "undefined"
    if (normalized.includes('undefined')) {
      console.error('❌ [DateEnd] ERRO CRÍTICO: normalized contém "undefined":', normalized);
      return '';
    }
    
    return normalized;
  }, [dateEnd, normalizeDate]);
  
  const { paymentMethods } = usePaymentMethodsContext();
  const { activeSegmentId, currentUser, refreshMetrics, setHeaderFinancialKPIs } = useAppData();

  React.useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  React.useEffect(() => {
    return () => { setHeaderFinancialKPIs(null); };
  }, [setHeaderFinancialKPIs]);
  const [type, setType] = React.useState<string>(''); // receita, despesa, transferencia
  const [partner, setPartner] = React.useState<string>('');
  const [segment, setSegment] = React.useState<string>('');
  const [status, setStatus] = React.useState<string>('');
  
  // Quando um segmento específico é selecionado no filtro, usar ele; caso contrário, usar o activeSegmentId global
  const segmentIdForApi = segment || activeSegmentId || '';
  
  // ✅ SINGLE SOURCE OF TRUTH - Objeto único de filtros
  const filters = React.useMemo(() => {
    // ✅ VALIDAÇÃO ABSOLUTA: Garantir que dateStart e dateEnd nunca contenham "undefined"
    let validDateStart = dateStartISO;
    let validDateEnd = dateEndISO;
    
    // ✅ BLOQUEIO ABSOLUTO: Se contém "undefined" ou formato inválido, FORÇAR string vazia
    // ✅ TAMBÉM BLOQUEAR se a data original está incompleta (durante digitação)
    if (validDateStart) {
      if (typeof validDateStart !== 'string' ||
          validDateStart.includes('undefined') || 
          !/^\d{4}-\d{2}-\d{2}$/.test(validDateStart)) {
        console.error('❌ [FILTERS] dateStart INVÁLIDO - FORÇANDO VAZIO:', validDateStart);
        validDateStart = '';
      } else {
        // ✅ VALIDAÇÃO ADICIONAL: Verificar se a data original está completa
        // Se dateStart tem menos de 10 caracteres (DD/MM/YYYY), está incompleta
        if (dateStart && dateStart.length < 10) {
          console.warn('⚠️ [FILTERS] dateStart incompleta durante digitação - FORÇANDO VAZIO:', dateStart);
          validDateStart = '';
        }
      }
    }
    
    if (validDateEnd) {
      if (typeof validDateEnd !== 'string' ||
          validDateEnd.includes('undefined') || 
          !/^\d{4}-\d{2}-\d{2}$/.test(validDateEnd)) {
        console.error('❌ [FILTERS] dateEnd INVÁLIDO - FORÇANDO VAZIO:', validDateEnd);
        validDateEnd = '';
      } else {
        // ✅ VALIDAÇÃO ADICIONAL: Verificar se a data original está completa
        // Se dateEnd tem menos de 10 caracteres (DD/MM/YYYY), está incompleta
        if (dateEnd && dateEnd.length < 10) {
          console.warn('⚠️ [FILTERS] dateEnd incompleta durante digitação - FORÇANDO VAZIO:', dateEnd);
          validDateEnd = '';
        }
      }
    }
    
    // ✅ VALIDAÇÃO FINAL ANTES DE RETORNAR
    const result = {
      pageSize,
      dateStart: validDateStart,
      dateEnd: validDateEnd,
      segmentId: segmentIdForApi,
      type,
      status,
      partner: partner.trim()
    };
    
    // ✅ VERIFICAÇÃO FINAL: Se ainda contém "undefined", LOGAR ERRO CRÍTICO E FORÇAR VAZIO
    if ((result.dateStart && result.dateStart.includes('undefined')) || 
        (result.dateEnd && result.dateEnd.includes('undefined'))) {
      console.error('❌ [FILTERS] ERRO CRÍTICO: Objeto filters contém "undefined"!', result);
      // Forçar valores vazios
      result.dateStart = '';
      result.dateEnd = '';
    }
    
    return result;
  }, [pageSize, dateStartISO, dateEndISO, dateStart, dateEnd, segmentIdForApi, type, status, partner]);
  
  // LOG OBRIGATÓRIO ANTES DE QUALQUER CHAMADA
  React.useEffect(() => {
    console.log('🔍 [FETCH FILTERS] Filtros atualizados:', filters);
    
    // PROIBIR chamadas "default" após filtro estar ativo
    if (filters.dateStart || filters.dateEnd) {
      if (filters.dateStart === null || filters.dateEnd === null) {
        console.error('❌ [BUG DETECTADO] Filtros de data foram resetados para null após estarem ativos!', filters);
      }
    }
  }, [filters]);
  
  // Estado local para listagem (não usar hook que faz fetch automático)
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [refetching, setRefetching] = React.useState(false);
  const [hasMore, setHasMore] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

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
          console.log('📋 Detalhes completos da sincronização:', JSON.stringify(result, null, 2));
          
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
          // Usar ref para acessar filtros atuais (não usar filters diretamente para evitar dependências)
          const currentFilters = filtersRef.current;
          console.trace('[CALL STACK] syncPluggy - recarregando após sincronização', currentFilters);
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          const abortController = new AbortController();
          abortControllerRef.current = abortController;
          await fetchAllData(currentFilters, 1, abortController.signal);
          
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
  }, [currentUser?.id, segmentIdForApi]); // ❌ REMOVIDO filters e fetchAllData - causavam chamadas duplicadas

  // KPIs reais buscados da API dedicada
  const [kpis, setKpis] = React.useState({ entradas: 0, saidas: 0, saldo: 0 });
  const [kpisLoading, setKpisLoading] = React.useState(false);
  const [totalRecords, setTotalRecords] = React.useState(0);

  // ✅ ABORT CONTROLLER - Para cancelar requisições anteriores
  const abortControllerRef = React.useRef<AbortController | null>(null);
  const kpisAbortControllerRef = React.useRef<AbortController | null>(null); // ✅ AbortController separado para KPIs
  
  // ✅ REF PARA RASTREAR SE FILTROS DE DATA ESTÃO ATIVOS
  const hasActiveDateFiltersRef = React.useRef(false);
  
  // ✅ REF PARA ACESSAR FILTROS ATUAIS (evita dependências em useEffects)
  const filtersRef = React.useRef(filters);
  const dateStartRef = React.useRef(dateStart);
  const dateEndRef = React.useRef(dateEnd);
  
  // Atualizar refs quando filtros mudarem
  React.useEffect(() => {
    hasActiveDateFiltersRef.current = !!(dateStart || dateEnd);
    filtersRef.current = filters;
    dateStartRef.current = dateStart;
    dateEndRef.current = dateEnd;
  }, [dateStart, dateEnd, filters]);

  // Função auxiliar para formatação de moeda (definida antes de fetchAllData para evitar erro de inicialização)
  const currency = React.useCallback((n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), []);

  // ✅ SINGLE FETCH SOURCE - ÚNICA FUNÇÃO QUE BUSCA TUDO
  const fetchAllData = React.useCallback(async (currentFilters: typeof filters, page: number = 1, signal?: AbortSignal) => {
    // LOG OBRIGATÓRIO ANTES DE QUALQUER CHAMADA
    console.log('🔍 [FETCH FILTERS] ========== fetchAllData INICIADO ==========');
    console.log('🔍 [FETCH FILTERS] fetchAllData chamado com filtros:', currentFilters, 'página:', page);
    console.log('🔍 [FETCH FILTERS] Filtros de data:', {
      dateStart: currentFilters.dateStart,
      dateEnd: currentFilters.dateEnd,
      temFiltroData: !!(currentFilters.dateStart || currentFilters.dateEnd)
    });
    console.trace('[CALL STACK] fetchAllData', currentFilters);
    
    // ✅ BLOQUEIO DE CHAMADAS DEFAULT - REGRA 2
    // Verificar se filtros de data estão ativos no estado atual (usar ref para evitar dependências)
    const hasActiveDates = !!(dateStartRef.current || dateEndRef.current);
    const filtersHaveDates = !!(currentFilters.dateStart || currentFilters.dateEnd);
    
    if (hasActiveDates && !filtersHaveDates) {
      console.error('❌ FETCH DEFAULT BLOQUEADO: Filtros de data estão ativos no estado mas não nos filtros passados', {
        dateStart: dateStartRef.current,
        dateEnd: dateEndRef.current,
        currentFilters
      });
      return;
    }
    
    // Verificar se filtros foram passados como null explicitamente
    if (currentFilters.dateStart === null || currentFilters.dateEnd === null) {
      if (hasActiveDates) {
        console.error('❌ FETCH DEFAULT BLOQUEADO: dateStart ou dateEnd é null mas filtro estava ativo', {
          dateStart: dateStartRef.current,
          dateEnd: dateEndRef.current,
          currentFilters
        });
        return;
      }
    }
    
    // Verificar se signal foi cancelado
    if (signal?.aborted) {
      console.log('⚠️ [FETCH] Requisição cancelada antes de iniciar');
      return;
    }
    
    setLoading(true);
    setKpisLoading(true);
    
    try {
      // ✅ BUSCAR LISTAGEM E KPIs EM PARALELO (mesmos filtros)
      const listParams = new URLSearchParams();
      listParams.set('page', page.toString());
      listParams.set('pageSize', currentFilters.pageSize.toString());
      
      if (currentFilters.segmentId) {
        listParams.set('segment_id', currentFilters.segmentId);
      }
      // ✅ VALIDAÇÃO ABSOLUTA: BLOQUEAR qualquer valor que contenha "undefined"
      if (currentFilters.dateStart && 
          currentFilters.dateStart !== '' && 
          typeof currentFilters.dateStart === 'string' &&
          !currentFilters.dateStart.includes('undefined') &&
          /^\d{4}-\d{2}-\d{2}$/.test(currentFilters.dateStart)) {
        listParams.set('dateStart', currentFilters.dateStart);
      } else if (currentFilters.dateStart && currentFilters.dateStart.includes('undefined')) {
        console.error('❌ [BLOQUEIO ABSOLUTO] dateStart contém "undefined", NÃO ENVIANDO:', currentFilters.dateStart);
      }
      
      if (currentFilters.dateEnd && 
          currentFilters.dateEnd !== '' && 
          typeof currentFilters.dateEnd === 'string' &&
          !currentFilters.dateEnd.includes('undefined') &&
          /^\d{4}-\d{2}-\d{2}$/.test(currentFilters.dateEnd)) {
        listParams.set('dateEnd', currentFilters.dateEnd);
      } else if (currentFilters.dateEnd && currentFilters.dateEnd.includes('undefined')) {
        console.error('❌ [BLOQUEIO ABSOLUTO] dateEnd contém "undefined", NÃO ENVIANDO:', currentFilters.dateEnd);
      }
      
      const kpisParams = new URLSearchParams();
      
      // ✅ APLICAR FILTROS DA MESMA FORMA QUE TIPO E SEGMENTO (que funcionam)
      if (currentFilters.segmentId) {
        kpisParams.set('segment_id', currentFilters.segmentId);
      }
      if (currentFilters.type && (currentFilters.type === 'receivable' || currentFilters.type === 'payable')) {
        kpisParams.set('direction', currentFilters.type);
      }
      
      // ✅ DATAS: Aplicar EXATAMENTE da mesma forma que tipo e segmento
      // MAS validar que não contém "undefined" ou formato inválido antes de enviar
      if (currentFilters.dateStart && 
          typeof currentFilters.dateStart === 'string' && 
          currentFilters.dateStart !== '' && 
          !currentFilters.dateStart.includes('undefined') &&
          /^\d{4}-\d{2}-\d{2}$/.test(currentFilters.dateStart)) {
        kpisParams.set('dateStart', currentFilters.dateStart);
        listParams.set('dateStart', currentFilters.dateStart);
      } else if (currentFilters.dateStart) {
        console.error('❌ [FETCH] dateStart INVÁLIDO - NÃO ENVIANDO:', currentFilters.dateStart);
      }
      if (currentFilters.dateEnd && 
          typeof currentFilters.dateEnd === 'string' && 
          currentFilters.dateEnd !== '' && 
          !currentFilters.dateEnd.includes('undefined') &&
          /^\d{4}-\d{2}-\d{2}$/.test(currentFilters.dateEnd)) {
        kpisParams.set('dateEnd', currentFilters.dateEnd);
        listParams.set('dateEnd', currentFilters.dateEnd);
      } else if (currentFilters.dateEnd) {
        console.error('❌ [FETCH] dateEnd INVÁLIDO - NÃO ENVIANDO:', currentFilters.dateEnd);
      }
      
      if (currentFilters.status) {
        kpisParams.set('status', currentFilters.status);
      }
      if (currentFilters.partner) {
        kpisParams.set('partner', currentFilters.partner);
      }
      
      const listParamsObj = Object.fromEntries(listParams.entries());
      const kpisParamsObj = Object.fromEntries(kpisParams.entries());
      
      // ✅ VALIDAÇÃO FINAL: Garantir que nenhum parâmetro contém "undefined"
      const hasUndefinedInList = Object.values(listParamsObj).some(v => String(v).includes('undefined'));
      const hasUndefinedInKpis = Object.values(kpisParamsObj).some(v => String(v).includes('undefined'));
      
      if (hasUndefinedInList || hasUndefinedInKpis) {
        console.error('❌ [FETCH] ERRO CRÍTICO: Parâmetros contêm "undefined"!', {
          listParams: listParamsObj,
          kpisParams: kpisParamsObj,
          currentFilters
        });
        // ✅ NÃO BLOQUEAR - apenas remover parâmetros inválidos e continuar
        // Remover dateStart/dateEnd se contiverem "undefined"
        if (hasUndefinedInKpis && kpisParamsObj.dateStart && String(kpisParamsObj.dateStart).includes('undefined')) {
          kpisParams.delete('dateStart');
          console.warn('⚠️ [FETCH] Removendo dateStart inválido dos KPIs');
        }
        if (hasUndefinedInKpis && kpisParamsObj.dateEnd && String(kpisParamsObj.dateEnd).includes('undefined')) {
          kpisParams.delete('dateEnd');
          console.warn('⚠️ [FETCH] Removendo dateEnd inválido dos KPIs');
        }
        // Continuar com a requisição mesmo se houver "undefined" (backend validará)
      }
      
      console.log('📤 [FETCH] Buscando listagem com:', listParamsObj);
      console.log('📤 [FETCH] Buscando KPIs com:', kpisParamsObj);
      console.log('🔍 [FETCH] Filtros originais:', {
        dateStart: currentFilters.dateStart,
        dateEnd: currentFilters.dateEnd,
        dateStartISO,
        dateEndISO
      });
      console.log('🔍 [FETCH] Filtros originais:', {
        dateStart,
        dateEnd,
        dateStartISO,
        dateEndISO,
        currentFilters
      });
      
      // Buscar em paralelo
      const [listResponse, kpisResponse] = await Promise.all([
        fetch(`/api/financial-documents?${listParams.toString()}`, {
          signal,
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        }),
        fetch(`/api/financial-kpis?${kpisParams.toString()}`, {
          signal,
          cache: 'no-store',
          headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }
        })
      ]);
      
      // Verificar se foi cancelado durante o fetch
      if (signal?.aborted) {
        console.log('⚠️ [FETCH] Requisição cancelada durante o fetch');
        return;
      }
      
      // Processar listagem
      if (!listResponse.ok) {
        if (listResponse.status === 400) {
          const errorData = await listResponse.json().catch(() => ({}));
          toast({
            title: 'Erro ao filtrar',
            description: errorData.error || errorData.details || 'Erro ao buscar documentos',
            variant: 'destructive'
          });
          return;
        }
        throw new Error(`HTTP error! status: ${listResponse.status}`);
      }
      
      // Verificar se foi cancelado antes de processar resposta
      if (signal?.aborted) {
        console.log('⚠️ [FETCH] Requisição cancelada antes de processar resposta da listagem');
        return;
      }
      
      const listData = await listResponse.json();
      console.log('📥 [FETCH] Resposta da listagem recebida:', {
        success: listData.success,
        hasData: !!listData.data,
        hasDocuments: !!(listData.data?.financialDocuments || listData.financialDocuments),
        documentsCount: (listData.data?.financialDocuments || listData.financialDocuments || []).length,
        pagination: listData.data?.pagination || listData.pagination,
        fullResponse: listData
      });
      
      // ✅ API retorna { success: true, financialDocuments: [...], pagination: {...} }
      // Não retorna dentro de data, então ajustar para ambos os formatos
      const financialDocuments = listData.data?.financialDocuments || listData.financialDocuments || [];
      const pagination = listData.data?.pagination || listData.pagination || {};
      
      if (listData.success && financialDocuments.length >= 0) {
        const list = financialDocuments.map(normalizeFinancialDocument);
        console.log('📊 [FETCH] Processando listagem:', {
          listLength: list.length,
          page,
          totalPages: pagination.totalPages,
          hasMore: page < (pagination.totalPages || 1)
        });
        
        if (page === 1) {
          setItems(list);
          console.log('✅ [FETCH] setItems chamado com', list.length, 'registros (página 1)');
        } else {
          setItems(prev => {
            const newItems = [...prev, ...list];
            console.log('✅ [FETCH] setItems chamado com', newItems.length, 'registros totais (página', page, ')');
            return newItems;
          });
        }
        setCurrentPage(page);
        setTotalPages(pagination.totalPages || 1);
        setHasMore(page < (pagination.totalPages || 1));
        console.log('✅ [FETCH] Listagem atualizada:', list.length, 'registros, página', page, 'de', pagination.totalPages);
      } else {
        console.error('❌ [FETCH] Resposta da listagem não tem success ou data:', {
          success: listData.success,
          hasData: !!listData.data,
          response: listData,
          responseKeys: Object.keys(listData),
          responseString: JSON.stringify(listData, null, 2)
        });
      }
      
      // Processar KPIs
      if (!kpisResponse.ok) {
        if (kpisResponse.status === 400) {
          const errorData = await kpisResponse.json().catch(() => ({}));
          toast({
            title: 'Erro ao filtrar',
            description: errorData.error || errorData.details || 'Erro ao buscar KPIs',
            variant: 'destructive'
          });
          return;
        }
        throw new Error(`HTTP error! status: ${kpisResponse.status}`);
      }
      
      const kpisData = await kpisResponse.json();
      console.log('📥 [KPIs] Resposta completa da API:', kpisData);
      
      if (kpisData.success && kpisData.kpis) {
        const newKpis = {
          entradas: kpisData.kpis.entradas || 0,
          saidas: kpisData.kpis.saidas || 0,
          saldo: kpisData.kpis.saldo || 0
        };
        
        console.log('🔄 [KPIs] ATUALIZANDO ESTADO - Valores ANTES:', kpis);
        console.log('🔄 [KPIs] ATUALIZANDO ESTADO - Valores NOVOS:', newKpis);
        
        setKpis(newKpis);
        setTotalRecords(kpisData.totalRecords || 0);
        
        console.log('✅ [FETCH] KPIs RECALCULADOS com filtros:', {
          kpis: newKpis,
          totalRecords: kpisData.totalRecords,
          filtrosUsados: kpisParamsObj,
          dateStart: currentFilters.dateStart,
          dateEnd: currentFilters.dateEnd,
          temFiltroData: !!(currentFilters.dateStart || currentFilters.dateEnd),
          urlKPIs: `/api/financial-kpis?${kpisParams.toString()}`
        });
        console.log('💰 [KPIs] Valores finais formatados:', {
          entradas: currency(newKpis.entradas),
          saidas: currency(newKpis.saidas),
          saldo: currency(newKpis.saldo)
        });
      } else {
        console.error('❌ [FETCH] KPIs não retornaram success:', kpisData);
      }
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('⚠️ [FETCH] Requisição cancelada');
        return;
      }
      console.error('❌ [FETCH] Erro ao buscar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setKpisLoading(false);
    }
  }, [currency, toast]); // ✅ Dependências necessárias para evitar stale closure

  // ✅ CONTROLE DE PRIMEIRA CHAMADA E BLOQUEIO
  const isFirstMountRef = React.useRef(true);
  const lastFiltersRef = React.useRef<string>('');
  
  // ✅ ÚNICO useEffect - ORDEM GARANTIDA: cancelar → resetar página → executar UMA chamada
  React.useEffect(() => {
    console.log('🔄 [useEffect] ========== useEffect PRINCIPAL EXECUTADO ==========');
    console.log('🔄 [useEffect] Filtros atuais:', filters);
    
    // Serializar filtros para comparação
    const filtersKey = JSON.stringify(filters);
    
    // ✅ BLOQUEIO: Se os filtros não mudaram realmente, não fazer chamada
    if (filtersKey === lastFiltersRef.current && !isFirstMountRef.current) {
      console.log('⏸️ [BLOQUEIO] Filtros não mudaram, ignorando chamada:', filters);
      return;
    }
    
    console.log('✅ [useEffect] Filtros mudaram, prosseguindo com fetchAllData');
    
    lastFiltersRef.current = filtersKey;
    
    // ✅ BLOQUEIO: Se filtros de data estão ativos mas foram resetados para vazio/null, NÃO fazer chamada
    const hasDateFilters = !!(dateStart || dateEnd);
    const filtersHaveDate = !!(filters.dateStart || filters.dateEnd);
    
    if (hasDateFilters && !filtersHaveDate && !isFirstMountRef.current) {
      console.error('❌ [BLOQUEIO] Filtros de data foram resetados, bloqueando chamada:', { dateStart, dateEnd, filters });
      return;
    }
    
    console.trace('[CALL STACK] useEffect principal - filtros mudaram', filters);
    console.log('🔍 [FETCH FILTERS] Verificando filtros antes de executar:', {
      dateStart,
      dateEnd,
      dateStartISO,
      dateEndISO,
      filters,
      isFirstMount: isFirstMountRef.current
    });
    
    // a) Cancelar requisições anteriores
    if (abortControllerRef.current) {
      console.log('🛑 [FETCH] Cancelando requisição anterior');
      abortControllerRef.current.abort();
    }
    
    // Criar novo AbortController
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // b) Resetar página e itens quando filtros mudarem
    setCurrentPage(1);
    setItems([]); // Limpar itens anteriores
    
    // c) Executar UMA chamada
    let isCancelled = false;
    const timer = setTimeout(() => {
      if (isCancelled) {
        console.log('⏸️ [FETCH] Timer cancelado antes de executar');
        return;
      }
      console.log('🔍 [FETCH FILTERS] Executando fetchAllData com filtros:', filters);
      // Usar filtersRef para garantir que estamos usando os filtros mais recentes
      const currentFilters = filtersRef.current;
      console.log('🔍 [FETCH FILTERS] Filtros que serão enviados:', currentFilters);
      
      // Verificar se é primeira chamada e se não há filtros - permitir apenas se realmente for inicial
      if (isFirstMountRef.current && !currentFilters.dateStart && !currentFilters.dateEnd && !currentFilters.segmentId && !currentFilters.type && !currentFilters.status && !currentFilters.partner) {
        console.log('✅ [FETCH] Primeira chamada inicial sem filtros - permitida');
      }
      
      fetchAllData(currentFilters, 1, abortController.signal);
      isFirstMountRef.current = false;
    }, 300); // Debounce de 300ms
    
    return () => {
      isCancelled = true;
      clearTimeout(timer);
      // Só cancelar se a requisição ainda não foi iniciada (dentro do timer)
      // Não cancelar se já está em execução
    };
  }, [filters, fetchAllData]); // ✅ Incluir fetchAllData nas dependências
  
  // ✅ GARANTIR QUE KPIs SEJAM SEMPRE RECALCULADOS QUANDO FILTROS MUDAREM
  // ✅ USAR O MESMO PADRÃO DO useEffect PRINCIPAL (que funciona para tipo/segmento)
  React.useEffect(() => {
    console.log('🔄 [KPIs] useEffect KPIs executado - Filtros completos:', filters);
    
    // SEMPRE recalcular KPIs quando qualquer filtro mudar
    const timer = setTimeout(() => {
      console.log('🔄 [KPIs] Recalculando KPIs - Filtros atuais:', filters);
      
      // Cancelar requisições anteriores de KPIs (usar ref separado)
      if (kpisAbortControllerRef.current) {
        kpisAbortControllerRef.current.abort();
      }
      
      const abortController = new AbortController();
      kpisAbortControllerRef.current = abortController;
      
      // ✅ APLICAR FILTROS EXATAMENTE DA MESMA FORMA QUE TIPO E SEGMENTO
      const kpisParams = new URLSearchParams();
      
      // Segmento (funciona) - aplicar simplesmente
      if (filters.segmentId) {
        kpisParams.set('segment_id', filters.segmentId);
      }
      
      // Tipo (funciona) - aplicar simplesmente
      if (filters.type && (filters.type === 'receivable' || filters.type === 'payable')) {
        kpisParams.set('direction', filters.type);
      }
      
      // ✅ DATAS: Aplicar EXATAMENTE da mesma forma simples que tipo e segmento
      // MAS validar que não contém "undefined" ou formato inválido antes de enviar
      if (filters.dateStart && 
          typeof filters.dateStart === 'string' && 
          filters.dateStart !== '' && 
          !filters.dateStart.includes('undefined') &&
          /^\d{4}-\d{2}-\d{2}$/.test(filters.dateStart)) {
        kpisParams.set('dateStart', filters.dateStart);
        console.log('✅ [KPIs] Adicionando dateStart (IGUAL tipo/segmento):', filters.dateStart);
      } else if (filters.dateStart) {
        console.error('❌ [KPIs] dateStart INVÁLIDO - NÃO ENVIANDO:', filters.dateStart);
      }
      if (filters.dateEnd && 
          typeof filters.dateEnd === 'string' && 
          filters.dateEnd !== '' && 
          !filters.dateEnd.includes('undefined') &&
          /^\d{4}-\d{2}-\d{2}$/.test(filters.dateEnd)) {
        kpisParams.set('dateEnd', filters.dateEnd);
        console.log('✅ [KPIs] Adicionando dateEnd (IGUAL tipo/segmento):', filters.dateEnd);
      } else if (filters.dateEnd) {
        console.error('❌ [KPIs] dateEnd INVÁLIDO - NÃO ENVIANDO:', filters.dateEnd);
      }
      
      // Status (funciona) - aplicar simplesmente
      if (filters.status) {
        kpisParams.set('status', filters.status);
      }
      
      // Partner (funciona) - aplicar simplesmente
      if (filters.partner) {
        kpisParams.set('partner', filters.partner);
      }
      
      const kpisParamsObj = Object.fromEntries(kpisParams.entries());
      console.log('🔄 [KPIs] RECALCULANDO KPIs com TODOS os filtros:', kpisParamsObj);
      console.log('🔄 [KPIs] URL completa:', `/api/financial-kpis?${kpisParams.toString()}`);
      
      setKpisLoading(true);
      fetch(`/api/financial-kpis?${kpisParams.toString()}`, {
        signal: abortController.signal,
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ [KPIs] Erro HTTP:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const kpisData = await response.json();
          console.log('📥 [KPIs] Resposta completa da API:', kpisData);
          if (kpisData.success && kpisData.kpis) {
            const newKpis = {
              entradas: kpisData.kpis.entradas || 0,
              saidas: kpisData.kpis.saidas || 0,
              saldo: kpisData.kpis.saldo || 0
            };
            console.log('✅ [KPIs] KPIs ATUALIZADOS NO ESTADO:', newKpis);
            console.log('💰 [KPIs] Valores formatados:', {
              entradas: currency(newKpis.entradas),
              saidas: currency(newKpis.saidas),
              saldo: currency(newKpis.saldo)
            });
            setKpis(newKpis);
            setTotalRecords(kpisData.totalRecords || 0);
            setHeaderFinancialKPIs(newKpis);
          } else {
            console.error('❌ [KPIs] Resposta não tem success ou kpis:', kpisData);
          }
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('❌ [KPIs] Erro ao buscar KPIs:', error);
          }
        })
        .finally(() => {
          setKpisLoading(false);
        });
    }, 300);
    
    return () => {
      clearTimeout(timer);
      if (kpisAbortControllerRef.current) {
        kpisAbortControllerRef.current.abort();
      }
    };
  }, [filters, currency]); // ✅ DEPENDER DO OBJETO filters COMPLETO (igual ao useEffect principal)
  
  // Funções auxiliares para compatibilidade
  const load = React.useCallback(async (reset: boolean = false) => {
    console.trace('[CALL STACK] load() chamado', { reset, filters, currentPage });
    const page = reset ? 1 : currentPage;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    await fetchAllData(filters, page, abortController.signal);
  }, [filters, currentPage, fetchAllData]);
  
  const loadMore = React.useCallback(async () => {
    console.trace('[CALL STACK] loadMore() chamado', { filters, currentPage, hasMore, loading });
    if (!hasMore || loading) return;
    const nextPage = currentPage + 1;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    await fetchAllData(filters, nextPage, abortController.signal);
  }, [filters, currentPage, hasMore, loading, fetchAllData]);
  
  // Funções de CRUD
  const create = React.useCallback(async (data: Partial<FinancialDocument>) => {
    console.trace('[CALL STACK] create() chamado', { filters });
    try {
      const response = await createFinancialDocument(data);
      if (response.data?.financialDocument) {
        const item = normalizeFinancialDocument(response.data.financialDocument);
        setItems(prev => [item, ...prev]);
        toast({ title: 'Documento criado', description: item?.description || 'Registro criado.' });
        // Recarregar dados para garantir sincronização
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        await fetchAllData(filters, 1, abortController.signal);
        return item;
      }
      return null;
    } catch (e) {
      console.error('Erro ao criar documento:', e);
      toast({ title: 'Erro ao criar documento', description: 'Verifique os dados informados.', variant: 'destructive' });
      return null;
    }
  }, [filters, fetchAllData]);
  
  const update = React.useCallback(async (id: string, data: Partial<FinancialDocument>) => {
    try {
      const response = await updateFinancialDocument(id, data);
      if (response.data?.financialDocument) {
        const item = normalizeFinancialDocument(response.data.financialDocument);
        toast({ title: 'Documento atualizado', description: item?.description || 'Registro atualizado.' });
        // Recarregar dados para garantir sincronização
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        const abortController = new AbortController();
        abortControllerRef.current = abortController;
        await fetchAllData(filters, currentPage, abortController.signal);
        return item;
      }
      return null;
    } catch (e) {
      console.error('Erro ao atualizar documento:', e);
      toast({ title: 'Erro ao atualizar documento', description: 'Tente novamente.', variant: 'destructive' });
      return null;
    }
  }, [filters, currentPage, fetchAllData]);
  
  const remove = React.useCallback(async (id: string) => {
    try {
      const response = await deleteFinancialDocument(id);
      if (response.error) {
        throw new Error(typeof response.error === 'string' ? response.error : 'Erro ao excluir');
      }
      setItems(prev => prev.filter(it => it.id !== id));
      toast({ title: 'Documento removido', description: 'Registro excluído com sucesso.' });
      // Recarregar dados para garantir sincronização
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      await fetchAllData(filters, currentPage, abortController.signal);
      return true;
    } catch (e) {
      console.error('Erro ao remover documento:', e);
      toast({ title: 'Erro ao remover documento', description: 'Tente novamente.', variant: 'destructive' });
      return false;
    }
  }, [filters, currentPage, fetchAllData]);

  const { entradas, saidas, saldo } = kpis;
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

  // Função para exportar dados em CSV
  const handleExport = React.useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar todos os dados aplicando os filtros atuais (sem paginação)
      const params = new URLSearchParams();
      
      // Aplicar filtros de data
      if (dateStartISO) {
        params.append('dateStart', dateStartISO);
      }
      if (dateEndISO) {
        params.append('dateEnd', dateEndISO);
      }
      
      // Aplicar filtro de segmento
      if (segmentIdForApi) {
        params.append('segment_id', segmentIdForApi);
      }
      
      // Buscar com pageSize muito grande para pegar todos os registros
      params.append('page', '1');
      params.append('pageSize', '10000');
      
      const apiUrl = `/api/financial-documents?${params.toString()}`;
      console.log('📤 [EXPORT] URL completa da requisição:', apiUrl);
      console.log('📤 [EXPORT] Filtros aplicados:', {
        dateStartISO,
        dateEndISO,
        segmentIdForApi,
        dateStart,
        dateEnd
      });
      
      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta da API:', errorText);
        throw new Error('Erro ao buscar dados para exportação');
      }
      
      const data = await response.json();
      console.log('📊 Dados recebidos para exportação:', {
        success: data.success,
        hasFinancialDocuments: !!data.financialDocuments,
        documentsCount: data.financialDocuments?.length || 0,
        dataStructure: Object.keys(data),
        pagination: data.pagination
      });
      
      // A API retorna { success: true, financialDocuments: [...], pagination: {...} }
      const documents = data.financialDocuments || [];
      
      console.log('📋 [EXPORT] Total de documentos para exportar:', documents.length);
      if (documents.length > 0) {
        console.log('📋 [EXPORT] Primeiro documento:', {
          id: documents[0].id,
          issue_date: documents[0].issue_date,
          due_date: documents[0].due_date,
          description: documents[0].description
        });
        if (documents.length > 1) {
          console.log('📋 [EXPORT] Último documento:', {
            id: documents[documents.length - 1].id,
            issue_date: documents[documents.length - 1].issue_date,
            due_date: documents[documents.length - 1].due_date,
            description: documents[documents.length - 1].description
          });
        }
      }
      
      if (documents.length === 0) {
        toast({
          title: 'Nenhum dado para exportar',
          description: 'Não há documentos financeiros com os filtros aplicados.',
          variant: 'destructive'
        });
        return;
      }
      
      console.log('📋 Primeiro documento para debug:', documents[0]);
      
      // Preparar dados para CSV
      const csvHeaders = [
        'ID',
        'Tipo',
        'Data Emissão',
        'Data Vencimento',
        'Parceiro',
        'Descrição',
        'Valor',
        'Saldo',
        'Status',
        'Forma de Pagamento',
        'Número do Documento',
        'Observações'
      ];
      
      const csvRows = documents.map((doc: any) => {
        const formatDate = (dateStr: string | null | undefined) => {
          if (!dateStr) return '';
          if (dateStr.includes('-') && dateStr.length === 10) {
            const [year, month, day] = dateStr.split('-');
            return `${day}/${month}/${year}`;
          }
          return dateStr;
        };
        
        const formatCurrency = (value: number | null | undefined) => {
          if (value === null || value === undefined) return '0,00';
          const numValue = typeof value === 'string' ? parseFloat(value) : value;
          if (isNaN(numValue)) return '0,00';
          return numValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };
        
        const getTypeLabel = (direction: string | null | undefined) => {
          if (direction === 'receivable') return 'Contas a Receber';
          if (direction === 'payable') return 'Contas a Pagar';
          return '';
        };
        
        const getStatusLabel = (status: string | null | undefined) => {
          const statusMap: Record<string, string> = {
            'draft': 'Rascunho',
            'open': 'Aberto',
            'partially_paid': 'Parcialmente Pago',
            'paid': 'Pago',
            'canceled': 'Cancelado'
          };
          return statusMap[status || ''] || status || '';
        };
        
        const partnerName = doc.partner?.name || doc.partner_name || '';
        const paymentMethod = doc.payment_method_data?.name || doc.payment_method || '';
        
        const row = [
          String(doc.id || ''),
          getTypeLabel(doc.direction),
          formatDate(doc.issue_date),
          formatDate(doc.due_date),
          String(partnerName),
          String(doc.description || ''),
          formatCurrency(doc.amount),
          formatCurrency(doc.balance),
          getStatusLabel(doc.status),
          String(paymentMethod),
          String(doc.doc_no || ''),
          String(doc.notes || '')
        ];
        
        return row;
      });
      
      console.log('📋 Total de linhas CSV geradas:', csvRows.length);
      console.log('📋 Primeira linha de exemplo:', csvRows[0]);
      
      // Criar conteúdo CSV com vírgula como separador (padrão internacional)
      const csvRowsFormatted = csvRows.map((row: string[]) => {
        const formattedRow = row.map((cell: any) => {
          // Escapar células que contêm vírgula, aspas ou quebras de linha
          const cellStr = String(cell || '').trim();
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        });
        return formattedRow.join(',');
      });
      
      const csvContent = [
        csvHeaders.join(','),
        ...csvRowsFormatted
      ].join('\n');
      
      console.log('📄 Tamanho do conteúdo CSV:', csvContent.length);
      console.log('📄 Primeiras 500 caracteres do CSV:', csvContent.substring(0, 500));
      console.log('📄 Últimas 200 caracteres do CSV:', csvContent.substring(Math.max(0, csvContent.length - 200)));
      
      // Validar que o conteúdo não está vazio
      if (!csvContent || csvContent.trim().length === 0) {
        throw new Error('Conteúdo CSV está vazio');
      }
      
      // Criar blob de forma simples e direta
      console.log('📦 Criando blob com conteúdo CSV...');
      console.log('📦 Tamanho do conteúdo CSV:', csvContent.length);
      
      // Adicionar BOM UTF-8 para Excel reconhecer corretamente
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + csvContent;
      
      // Criar blob de forma simples
      const blob = new Blob([csvWithBOM], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      console.log('📦 Blob criado:', {
        size: blob.size,
        type: blob.type,
        csvContentLength: csvContent.length,
        csvWithBOMLength: csvWithBOM.length
      });
      
      // Verificar se o blob tem conteúdo
      if (blob.size === 0) {
        console.error('❌ Blob está vazio!');
        throw new Error('Blob criado está vazio');
      }
      
      // Verificar se o conteúdo CSV não está vazio
      if (!csvContent || csvContent.trim().length === 0) {
        console.error('❌ Conteúdo CSV está vazio!');
        throw new Error('Conteúdo CSV está vazio');
      }
      
      // Criar link de download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `documentos_financeiros_${new Date().toISOString().split('T')[0]}.csv`;
      link.style.display = 'none';
      
      // Adicionar ao DOM
      document.body.appendChild(link);
      
      // Disparar download
      link.click();
      
      // Limpar após um pequeno delay
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }, 200);
      
      toast({
        title: 'Exportação concluída',
        description: `${documents.length} documento(s) exportado(s) com sucesso.`
      });
      
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: 'Erro na exportação',
        description: error instanceof Error ? error.message : 'Erro desconhecido ao exportar dados.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [dateStartISO, dateEndISO, segmentIdForApi, toast]);
  
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
                // pageSize mudará os filtros, que disparará o useEffect
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
          <Button
            onClick={() => setConnectionModalOpen(true)}
            className="gap-2"
          >
            <Link className="w-4 h-4" />
            Conectar Conta Bancária
          </Button>
          <BankAccountConnectionModal
            open={connectionModalOpen}
            onOpenChange={setConnectionModalOpen}
            onSuccess={async (itemId) => {
              console.log('✅ Conta conectada ou extrato importado:', itemId);
              // Recarregar dados após conectar conta ou importar extrato
              if (abortControllerRef.current) {
                abortControllerRef.current.abort();
              }
              const abortController = new AbortController();
              abortControllerRef.current = abortController;
              await fetchAllData(filters, 1, abortController.signal);
            }}
          />
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" />Filtros</Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={loading || items.length === 0}
          >
            <FileDown className="w-4 h-4 mr-2" />Exportar
          </Button>
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

      {/* KPIs — CRÍTICO: sempre setHeaderFinancialKPIs ao carregar; header usa só isso em /financial (credibilidade). */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-effect rounded-lg p-4 border" data-testid="financial-kpi-entradas">
          <div className="text-sm text-muted-foreground">Entradas</div>
          <div className="text-xl font-semibold text-green-400" data-testid="financial-kpi-entradas-value">
            {kpisLoading ? 'Carregando...' : currency(entradas)}
          </div>
        </div>
        <div className="glass-effect rounded-lg p-4 border" data-testid="financial-kpi-saidas">
          <div className="text-sm text-muted-foreground">Saídas</div>
          <div className="text-xl font-semibold text-red-400" data-testid="financial-kpi-saidas-value">
            {kpisLoading ? 'Carregando...' : currency(Math.abs(saidas))}
          </div>
        </div>
        <div className="glass-effect rounded-lg p-4 border" data-testid="financial-kpi-saldo">
          <div className="text-sm text-muted-foreground">Saldo</div>
          <div className="text-xl font-semibold" data-testid="financial-kpi-saldo-value">
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
        onCreate={async () => {
          // Recarregar lista após criar
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
          const abortController = new AbortController();
          abortControllerRef.current = abortController;
          await fetchAllData(filters, 1, abortController.signal);
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
        segments={segments}
        currency={currency}
        onEdit={(e) => { setDetailsOpen(false); openEdit(detailsDoc, e as any); }}
      />

      {/* (Inline helpers removidos – usamos ConfirmDelete externo) */}
    </div>
  );
}
