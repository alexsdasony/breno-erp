import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { name } = await params;
    console.log('🏷️ Buscando segmento por nome:', name);

    // Buscar segmentos que contenham o nome (pode haver múltiplos)
    const { data: segments, error: segmentsError } = await supabaseAdmin
      .from('segments')
      .select('*')
      .ilike('name', `%${name}%`)
      .order('created_at', { ascending: false });

    if (segmentsError) {
      console.log('❌ Erro ao buscar segmentos:', segmentsError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar segmentos',
          details: segmentsError.message
        },
        { status: 500 }
      );
    }

    if (!segments || segments.length === 0) {
      console.log('❌ Nenhum segmento encontrado para:', name);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Segmento não encontrado',
          details: 'Nenhum segmento encontrado com esse nome'
        },
        { status: 404 }
      );
    }

    // Retornar o primeiro segmento encontrado
    const segment = segments[0];

    console.log('✅ Segmento encontrado:', segment);
    return NextResponse.json({
      success: true,
      segment
    });

  } catch (error) {
    console.error('❌ Erro ao buscar segmento:', error);
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
