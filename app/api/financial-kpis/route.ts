import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Validação de data
function isValidDate(dateStr: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return false;
  if (dateStr.includes('undefined')) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= lastDayOfMonth;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segment_id');
    const direction = searchParams.get('direction');
    
    // Aceitar ambos os formatos (listagem usa dateStart/dateEnd)
    const dateStartParam = searchParams.get('dateStart') || searchParams.get('date_start');
    const dateEndParam = searchParams.get('dateEnd') || searchParams.get('date_end');
    
    const status = searchParams.get('status');
    const partner = searchParams.get('partner');

    console.log('📊 [KPIs] Request recebido:', { 
      segmentId, 
      direction, 
      dateStartParam, 
      dateEndParam, 
      status, 
      partner 
    });
    
    // LOG EXPLÍCITO DE PROPAGAÇÃO DE PARÂMETROS
    if (dateStartParam) {
      console.log('✅ DATE FILTER RECEIVED - dateStart:', dateStartParam);
    } else {
      console.log('❌ NO DATE FILTER RECEIVED - dateStart: null ou undefined');
    }
    if (dateEndParam) {
      console.log('✅ DATE FILTER RECEIVED - dateEnd:', dateEndParam);
    } else {
      console.log('❌ NO DATE FILTER RECEIVED - dateEnd: null ou undefined');
    }

    // Validar datas - RETORNAR ERRO 400 SE INVÁLIDAS
    if (dateStartParam && !isValidDate(dateStartParam)) {
      console.error('❌ [KPIs] Data inicial inválida recebida:', dateStartParam);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data inicial inválida',
          details: `Formato esperado: YYYY-MM-DD. Recebido: ${dateStartParam}`
        },
        { status: 400 }
      );
    }
    if (dateEndParam && !isValidDate(dateEndParam)) {
      console.error('❌ [KPIs] Data final inválida recebida:', dateEndParam);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data final inválida',
          details: `Formato esperado: YYYY-MM-DD. Recebido: ${dateEndParam}`
        },
        { status: 400 }
      );
    }

    const dateStart = dateStartParam && isValidDate(dateStartParam) ? dateStartParam : null;
    const dateEnd = dateEndParam && isValidDate(dateEndParam) ? dateEndParam : null;

    // QUERY 100% INDEPENDENTE PARA KPIs
    // NÃO usa range, page, pageSize, order
    // NÃO reutiliza função da listagem
    // Seleciona apenas campos necessários para cálculo
    let query = supabaseAdmin
      .from('financial_documents')
      .select('amount, direction, issue_date')
      .eq('is_deleted', false)
      .not('issue_date', 'is', null); // ✅ GARANTIR que issue_date não é NULL

    // APLICAR APENAS FILTROS (sem paginação, sem order)
    // 1. Filtro de segmento
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      query = query.eq('segment_id', segmentId);
      console.log('✅ [KPIs] Filtro de segmento aplicado:', segmentId);
    }

    // 2. Filtros de data - USAR APENAS issue_date
    // ✅ CRÍTICO: Aplicar filtros de data ANTES de outros filtros para garantir que funcionem
    if (dateStart) {
      query = query.gte('issue_date', dateStart);
      console.log('✅ [KPIs] Filtro de data inicial aplicado na coluna issue_date:', dateStart);
    }
    if (dateEnd) {
      query = query.lte('issue_date', dateEnd);
      console.log('✅ [KPIs] Filtro de data final aplicado na coluna issue_date:', dateEnd);
    }

    // 3. Filtro de tipo (direction)
    if (direction && (direction === 'receivable' || direction === 'payable')) {
      query = query.eq('direction', direction);
      console.log('✅ [KPIs] Filtro de tipo aplicado:', direction);
    }

    // 4. Filtro de status
    if (status && status !== '') {
      query = query.eq('status', status);
      console.log('✅ [KPIs] Filtro de status aplicado:', status);
    }

    // 5. Filtro de parceiro
    if (partner && partner.trim()) {
      const { data: partnersFound } = await supabaseAdmin
        .from('partners')
        .select('id')
        .ilike('name', `%${partner.trim()}%`);
      
      const partnerIds = partnersFound?.map(p => p.id) || [];
      const conditions = [`partner_name.ilike.%${partner.trim()}%`];
      
      if (partnerIds.length > 0) {
        conditions.push(`partner_id.in.(${partnerIds.join(',')})`);
      }
      
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(partner.trim());
      if (isUuid) {
        conditions.push(`partner_id.eq.${partner.trim()}`);
      }

      query = query.or(conditions.join(','));
      console.log('✅ [KPIs] Filtro de parceiro aplicado:', partner);
    }
    
    // LOG OBRIGATÓRIO ANTES DO AWAIT
    console.log('QUERY FINAL COM FILTROS (KPIs - 100% INDEPENDENTE):', query);
    console.log('🔍 [KPIs] Executando query INDEPENDENTE (SEM range, SEM page, SEM order)...');
    
    // EXECUTAR QUERY INDEPENDENTE (SEM range, SEM page, SEM order)
    const { data: allDocuments, error } = await query;

    if (error) {
      console.error('❌ [KPIs] Erro na query:', error);
      // Detectar erro de data inválida do PostgreSQL (código 22008)
      const isDateError = error.code === '22008' || 
                         error.message?.includes('date') || 
                         error.message?.includes('invalid input syntax');
      
      if (isDateError) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Data inválida',
            details: `Erro ao processar filtro de data: ${error.message}`
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar dados financeiros', 
          details: error.message 
        },
        { status: 400 }
      );
    }

    const totalRecords = allDocuments?.length || 0;
    console.log('📄 [KPIs] Total de documentos encontrados APÓS filtros:', totalRecords);
    console.log('🔍 [KPIs] Filtros aplicados na query:', {
      dateStart,
      dateEnd,
      segmentId,
      direction,
      status,
      partner
    });
    
    // Log de amostra para debug
    if (allDocuments && allDocuments.length > 0 && allDocuments.length <= 10) {
      console.log('📋 [KPIs] Documentos encontrados:', 
        allDocuments.map((d: any) => ({
          issue_date: d.issue_date,
          direction: d.direction,
          amount: d.amount
        }))
      );
    }
    
    // CALCULAR KPIs APENAS EM MEMÓRIA (SEM count, SEM paginação)
    const receivables = allDocuments?.filter((d: any) => d.direction === 'receivable') || [];
    const payables = allDocuments?.filter((d: any) => d.direction === 'payable') || [];
    
    const entradas = receivables.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
    const saidas = payables.reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
    const saldo = entradas - saidas;

    console.log('💰 [KPIs] Cálculo final (EM MEMÓRIA):', {
      totalDocumentos: totalRecords,
      receivables: receivables.length,
      payables: payables.length,
      entradas: entradas.toFixed(2),
      saidas: saidas.toFixed(2),
      saldo: saldo.toFixed(2),
      filtrosAplicados: {
        dateStart,
        dateEnd,
        segmentId,
        direction,
        status,
        partner
      }
    });

    return NextResponse.json({
      success: true,
      kpis: {
        entradas,
        saidas,
        saldo
      },
      totalRecords
    });

  } catch (error) {
    console.error('❌ [KPIs] Erro:', error);
    
    // Detectar erro de data inválida do PostgreSQL
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDateError = errorMessage.includes('22008') || 
                       errorMessage.includes('date') || 
                       errorMessage.includes('invalid input syntax') ||
                       errorMessage.includes('date/time field value out of range');
    
    if (isDateError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data inválida',
          details: `Erro ao processar filtro de data: ${errorMessage}`
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar requisição',
        details: errorMessage
      },
      { status: 400 }
    );
  }
}
