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

    console.log('🛒 Sales API request:', { page, pageSize });

    // Buscar vendas (mock data por enquanto)
    const sales = [];

    console.log('📊 Vendas encontradas:', sales.length);

    return NextResponse.json({
      success: true,
      sales,
      pagination: {
        page,
        pageSize,
        total: 0,
        totalPages: 0
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
