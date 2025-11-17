import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segment_id');
    const direction = searchParams.get('direction'); // Filtro por tipo: 'receivable' ou 'payable'

    console.log('📊 Financial KPIs request:', { segmentId, direction });

    // CORREÇÃO: Construir filtros baseados no segmento de forma consistente
    const hasSegmentFilter = segmentId && segmentId !== 'null' && segmentId !== '0';
    
    // Buscar TODOS os documentos financeiros sem paginação
    let query = supabaseAdmin
      .from('financial_documents')
      .select('amount, direction, segment_id')
      .eq('is_deleted', false);
    
    // Aplicar filtro de segmento apenas se fornecido
    if (hasSegmentFilter) {
      // Quando há filtro de segmento: buscar apenas documentos daquele segmento
      query = query.eq('segment_id', segmentId);
    }
    // Se não há filtro (todos os segmentos): buscar TODOS (incluindo NULL)
    // Registros com segment_id = NULL são despesas/receitas gerais
    
    // Aplicar filtro de tipo (direction) se fornecido
    if (direction && (direction === 'receivable' || direction === 'payable')) {
      query = query.eq('direction', direction);
    }
    
    const { data: allDocuments, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar documentos financeiros:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar dados financeiros' },
        { status: 500 }
      );
    }

    const totalRecords = allDocuments?.length || 0;
    console.log('📄 Total de documentos encontrados:', totalRecords);

    // Calcular KPIs totais
    const entradas = allDocuments
      ?.filter(d => d.direction === 'receivable')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;
      
    const saidas = allDocuments
      ?.filter(d => d.direction === 'payable')
      .reduce((sum, d) => sum + (Number(d.amount) || 0), 0) || 0;
      
    const saldo = entradas - saidas;

    console.log('💰 KPIs calculados:', { entradas, saidas, saldo });

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
    console.error('❌ Erro na API financial-kpis:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
