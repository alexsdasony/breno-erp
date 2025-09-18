import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    console.log('🏷️ API Route GET /api/segments');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;
    
    console.log('📝 Parâmetros:', { page, limit, offset });
    
    // Primeiro tentar buscar da tabela segments
    const { data: segmentsData, error: segmentsError } = await supabaseAdmin
      .from('segments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log('📥 Resultado da tabela segments:', { count: segmentsData?.length, error: segmentsError });

    // Se não há segmentos na tabela segments, buscar da tabela partners
    if (segmentsError || !segmentsData || segmentsData.length === 0) {
      console.log('🔄 Buscando segmentos da tabela partners...');
      
      // Buscar segmentos únicos da tabela partners
      const { data: partnersData, error: partnersError } = await supabaseAdmin
        .from('partners')
        .select('segment_id')
        .not('segment_id', 'is', null);
      
      if (partnersError) {
        console.error('❌ Erro ao buscar partners:', partnersError);
        return NextResponse.json(
          { 
            error: 'Erro ao buscar segmentos',
            details: partnersError.message 
          },
          { status: 500 }
        );
      }
      
      // Mapear segmentos conhecidos
      const segmentosConhecidos: Record<string, string> = {
        '68a2c101-4c01-4b1f-b5a2-18468df86b26': 'NAURU',
        '791b380a-89dd-44e6-8982-bc204b47a024': 'ESCRITÓRIO JURÍDICO - AR&N',
        'f5c2e105-4c05-4bbd-947a-575cf8877936': 'RDS IMOBILIÁRIO'
      };
      
      // Criar segmentos baseados nos IDs únicos encontrados
      const segmentIds = [...new Set(partnersData.map((p: any) => p.segment_id))];
      const segments = segmentIds.map((id: string) => ({
        id: id,
        name: segmentosConhecidos[id] || `Segmento ${id.substring(0, 8)}`,
        description: `Segmento ${segmentosConhecidos[id] || id.substring(0, 8)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
      
      console.log('📊 Segmentos criados da tabela partners:', segments.length);
      
      return NextResponse.json({
        success: true,
        segments: segments,
        pagination: {
          page,
          limit,
          total: segments.length,
          totalPages: Math.ceil(segments.length / limit)
        }
      });
    }

    return NextResponse.json({
      success: true,
      segments: segmentsData || [],
      pagination: {
        page,
        limit,
        total: segmentsData?.length || 0,
        totalPages: Math.ceil((segmentsData?.length || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na API de segmentos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏷️ API Route POST /api/segments');
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);
    
    const { data, error } = await supabaseAdmin
      .from('segments')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar segmento:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao criar segmento',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Segmento criado:', data);
    return NextResponse.json({
      success: true,
      segment: data
    });
    
  } catch (error) {
    console.error('❌ Erro na criação de segmento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
