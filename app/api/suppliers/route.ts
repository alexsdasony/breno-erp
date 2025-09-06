import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('🏭 API Route GET /api/suppliers');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;
    
    console.log('📝 Parâmetros:', { page, limit, offset });
    
    const { data, error, count } = await supabase
      .from('partners')
      .select(`
        *,
        partner_roles!inner(role)
      `, { count: 'exact' })
      .eq('partner_roles.role', 'supplier')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

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
    console.log('📝 Dados recebidos:', body);
    
    // Primeiro inserir o partner
    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .insert([body])
      .select()
      .single();

    if (partnerError) {
      throw partnerError;
    }

    // Depois inserir o role
    const { data, error } = await supabase
      .from('partner_roles')
      .insert([{ partner_id: partner.id, role: 'supplier' }])
      .select();

    if (error) {
      console.error('❌ Erro ao criar fornecedor:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao criar fornecedor',
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
