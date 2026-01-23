import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';
import { createAuditLog } from '@/lib/createAuditLog';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log('👤 API Route GET /api/users');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;
    
    console.log('📝 Parâmetros:', { page, limit, offset });
    
    const { data, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log('📥 Resultado da listagem:', { count, error });

    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao buscar usuários',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      users: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na API de usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    console.log('👤 API Route POST /api/users');
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);
    
    // Preparar dados para inserção
    const insertData = { ...body };
    
    // Converter string vazia para null para campos integer
    if (insertData.segment_id === '') {
      insertData.segment_id = null;
    }
    
    console.log('🧹 Dados para inserção:', insertData);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao criar usuário',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Usuário criado:', data);
    
    // Criar log de auditoria
    await createAuditLog(
      'CREATE',
      'users',
      data.id,
      null,
      { 
        name: data.name, 
        email: data.email, 
        role: data.role,
        status: data.status 
      },
      null,
      'admin@erppro.com'
    );
    
    return NextResponse.json({
      success: true,
      user: data
    });
    
  } catch (error) {
    console.error('❌ Erro na criação de usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
