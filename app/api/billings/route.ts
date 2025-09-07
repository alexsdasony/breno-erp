import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const segmentId = searchParams.get('segment_id');

    console.log('💳 Billings API request:', { page, pageSize, segmentId });

    // Buscar cobranças da tabela real
    let query = supabase
      .from('billings')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      query = query.eq('segment_id', segmentId);
    }

    const { data: billings, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar cobranças:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar cobranças',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Aplicar paginação
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedBillings = (billings || []).slice(startIndex, endIndex);

    console.log('📊 Cobranças encontradas:', (billings || []).length);

    return NextResponse.json({
      success: true,
      billings: paginatedBillings,
      pagination: {
        page,
        pageSize,
        total: (billings || []).length,
        totalPages: Math.ceil((billings || []).length / pageSize)
      }
    });

  } catch (error) {
    console.error('❌ Erro na API billings:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('💳 Criando nova cobrança:', body);

    const { data, error } = await supabaseAdmin
      .from('billings')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar cobrança:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao criar cobrança',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      billing: data
    });

  } catch (error) {
    console.error('❌ Erro ao criar cobrança:', error);
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
