import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdminAdmin } from '@/lib/supabaseAdminAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const segmentId = searchParams.get('segment_id');

    console.log('🛒 Sales API request:', { page, pageSize, segmentId });

    // Buscar vendas da tabela real
    let query = supabaseAdmin
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      query = query.eq('segment_id', segmentId);
    }

    const { data: sales, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar vendas:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar vendas',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Aplicar paginação
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSales = (sales || []).slice(startIndex, endIndex);

    console.log('📊 Vendas encontradas:', (sales || []).length);

    return NextResponse.json({
      success: true,
      sales: paginatedSales,
      pagination: {
        page,
        pageSize,
        total: (sales || []).length,
        totalPages: Math.ceil((sales || []).length / pageSize)
      }
    });

  } catch (error) {
    console.error('❌ Erro na API sales:', error);
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
    console.log('🛒 Criando nova venda:', body);

    // Mock implementation
    const newSale = {
      id: `sale_${Date.now()}`,
      ...body,
      created_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      sale: newSale
    });

  } catch (error) {
    console.error('❌ Erro ao criar venda:', error);
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
