import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    console.log('🤝 API Route GET /api/partners');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;
    const segmentId = searchParams.get('segment_id');
    const role = searchParams.get('role');
    const q = searchParams.get('q');
    
    console.log('📝 Parâmetros:', { page, limit, offset, segmentId, role, q });
    
    let query = supabaseAdmin
      .from('partners')
      .select(`
        *,
        partner_roles(role)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      // Mostrar registros do segmento específico + registros globais (segment_id = null)
      query = query.or(`segment_id.eq.${segmentId},segment_id.is.null`);
    }

    // Filtrar por role se fornecido
    if (role) {
      query = query.eq('partner_roles.role', role);
    }

    // Busca por texto se fornecido
    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,tax_id.ilike.%${q}%`);
    }

    const { data, error, count } = await query;

    console.log('📥 Resultado da listagem:', { count, error });

    if (error) {
      console.error('❌ Erro ao buscar parceiros:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao buscar parceiros',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      partners: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na API de parceiros:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤝 API Route POST /api/partners');
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);
    
    // Primeiro inserir o partner
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
      .insert([body])
      .select()
      .single();

    if (partnerError) {
      throw partnerError;
    }

    // Depois inserir o role (se fornecido)
    if (body.role) {
      const { data, error } = await supabaseAdmin
        .from('partner_roles')
        .insert([{ partner_id: partner.id, role: body.role }])
        .select();

      if (error) {
        console.error('❌ Erro ao criar role do parceiro:', error);
        return NextResponse.json(
          { 
            error: 'Erro ao criar role do parceiro',
            details: error.message 
          },
          { status: 500 }
        );
      }
    }

    console.log('✅ Parceiro criado:', partner);
    return NextResponse.json({
      success: true,
      partner: partner
    });
    
  } catch (error) {
    console.error('❌ Erro na criação de parceiro:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
