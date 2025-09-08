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
    
    const { data, error, count } = await supabase
      .from('segments')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log('📥 Resultado da listagem:', { count, error });

    if (error) {
      console.error('❌ Erro ao buscar segmentos:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao buscar segmentos',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      segments: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
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
