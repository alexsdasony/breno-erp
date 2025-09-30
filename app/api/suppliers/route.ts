import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    console.log('🏭 API Route GET /api/suppliers');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;
    const segmentId = searchParams.get('segment_id');
    
    console.log('📝 Parâmetros:', { page, limit, offset, segmentId });
    
    let query = supabaseAdmin
      .from('partners')
      .select(`
        *,
        partner_roles!inner(role)
      `, { count: 'exact' })
      .eq('partner_roles.role', 'supplier')
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
      console.error('❌ Erro ao buscar fornecedores:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao buscar fornecedores',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suppliers: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na API de fornecedores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🏭 API Route POST /api/suppliers');
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', JSON.stringify(body, null, 2));
    console.log('🔍 Campos específicos:');
    console.log('  - ramo_atividade (profissao):', body.profissao);
    console.log('  - segment_id:', body.segment_id);
    
    // Primeiro inserir o partner
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
      .insert([body])
      .select()
      .single();

    if (partnerError) {
      console.error('❌ Erro ao criar fornecedor:', partnerError);
      return NextResponse.json(
        { 
          error: 'Erro ao criar fornecedor',
          details: partnerError.message 
        },
        { status: 500 }
      );
    }

    // Depois inserir o role
    const { data, error } = await supabaseAdmin
      .from('partner_roles')
      .insert([{ partner_id: partner.id, role: 'supplier' }])
      .select();

    if (error) {
      console.error('❌ Erro ao criar role do fornecedor:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao criar role do fornecedor',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Fornecedor criado:', partner);
    return NextResponse.json({
      success: true,
      supplier: partner
    });
    
  } catch (error) {
    console.error('❌ Erro na criação de fornecedor:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
