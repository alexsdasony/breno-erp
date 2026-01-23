export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';
import { createAuditLog } from '@/lib/createAuditLog';

export async function GET(request: NextRequest) {
  try {
    console.log('📦 API Route GET /api/products');
    
    const supabaseAdmin = getSupabaseAdmin();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;
    const segmentId = searchParams.get('segment_id');
    
    console.log('📝 Parâmetros:', { page, limit, offset, segmentId });
    
    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      // Mostrar registros do segmento específico + registros globais (segment_id = null)
      query = query.or(`segment_id.eq.${segmentId},segment_id.is.null`);
    }
    // Se segmentId for null, '0' ou não fornecido, mostra todos os registros

    const { data, error, count } = await query;

    console.log('📥 Resultado da listagem:', { count, error });

    if (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao buscar produtos',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      products: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na API de produtos:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Se for erro de variável de ambiente, retornar mensagem clara
    if (errorMessage.includes('não está definida') || errorMessage.includes('SUPABASE')) {
      return NextResponse.json(
        { 
          error: 'Erro de configuração',
          details: errorMessage,
          hint: 'Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão configuradas no Render'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📦 API Route POST /api/products');
    
    const supabaseAdmin = getSupabaseAdmin();
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar produto:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao criar produto',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Produto criado:', data);
    
    // Criar log de auditoria
    await createAuditLog(
      'CREATE',
      'products',
      data.id,
      null,
      { 
        name: data.name, 
        price: data.price, 
        stock: data.stock,
        category: data.category 
      },
      null,
      'admin@erppro.com'
    );
    
    return NextResponse.json({
      success: true,
      product: data
    });
    
  } catch (error) {
    console.error('❌ Erro na criação de produto:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Se for erro de variável de ambiente, retornar mensagem clara
    if (errorMessage.includes('não está definida') || errorMessage.includes('SUPABASE')) {
      return NextResponse.json(
        { 
          error: 'Erro de configuração',
          details: errorMessage,
          hint: 'Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão configuradas no Render'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
