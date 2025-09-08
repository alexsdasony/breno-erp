import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    console.log('💰 Accounts receivable API request:', { page, pageSize, segmentId });

    // Buscar contas a receber (mock data por enquanto, pois a tabela pode não existir)
    let query = supabase
      .from('accounts_receivable')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      query = query.eq('segment_id', segmentId);
    }

    const { data, error } = await query;

    if (error) {
      console.log('⚠️ Tabela accounts_receivable não existe, retornando dados vazios');
      return NextResponse.json({
        success: true,
        accounts_receivable: [],
        pagination: {
          page,
          pageSize,
          total: 0,
          totalPages: 0
        }
      });
    }

    // Aplicar paginação
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = data.slice(startIndex, endIndex);

    console.log('📊 Contas a receber encontradas:', data.length);

    return NextResponse.json({
      success: true,
      accounts_receivable: paginatedData,
      pagination: {
        page,
        pageSize,
        total: data.length,
        totalPages: Math.ceil(data.length / pageSize)
      }
    });

  } catch (error) {
    console.error('❌ Erro na API accounts-receivable:', error);
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
    console.log('💰 Criando nova conta a receber:', body);

    const { data, error } = await supabase
      .from('accounts_receivable')
      .insert(body)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar conta a receber:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao criar conta a receber',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      account_receivable: data
    });

  } catch (error) {
    console.error('❌ Erro ao criar conta a receber:', error);
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
