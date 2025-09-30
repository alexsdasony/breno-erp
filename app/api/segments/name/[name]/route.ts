import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  try {
    const { name } = await params;
    console.log('🏷️ Buscando segmento por nome:', name);

    const { data: segment, error } = await supabaseAdmin
      .from('segments')
      .select('*')
      .ilike('name', name)
      .single();

    if (error) {
      console.log('❌ Segmento não encontrado:', error.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Segmento não encontrado',
          details: error.message
        },
        { status: 404 }
      );
    }

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
