import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segment_id');

    console.log('📊 Financial KPIs request:', { segmentId });

    // Construir filtros baseados no segmento
    const segmentFilter = segmentId && segmentId !== 'null' && segmentId !== '0' 
      ? { segment_id: segmentId } 
      : {};

    // Buscar TODOS os documentos financeiros sem paginação
    const { data: allDocuments, error } = await supabaseAdmin
      .from('financial_documents')
      .select('amount, direction, segment_id')
      .eq('is_deleted', false)
      .match(segmentFilter);

    if (error) {
      console.error('❌ Erro ao buscar documentos financeiros:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar dados financeiros' },
        { status: 500 }
      );
    }

    console.log('📄 Total de documentos encontrados:', allDocuments?.length || 0);

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
      }
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
