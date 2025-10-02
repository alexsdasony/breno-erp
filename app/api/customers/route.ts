import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Função para criar log de auditoria
async function createAuditLog(action: string, tableName: string, recordId: string | null, oldValues: any = null, newValues: any = null, userId: string | null = null, userEmail: string | null = null) {
  try {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        user_id: userId,
        user_email: userEmail,
        ip_address: '127.0.0.1',
        user_agent: 'Sistema de Auditoria'
      });
    
    if (error) {
      console.error('❌ Erro ao criar log de auditoria:', error);
    } else {
      console.log('✅ Log de auditoria criado:', { action, tableName, recordId });
    }
  } catch (error) {
    console.error('❌ Erro ao criar log de auditoria:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('👥 API Route GET /api/customers');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;
    const segmentId = searchParams.get('segment_id');
    const search = searchParams.get('search');
    
    console.log('📝 Parâmetros:', { page, limit, offset, segmentId, search });
    
    let query = supabaseAdmin
      .from('partners')
      .select(`
        *,
        partner_roles!inner(role)
      `, { count: 'exact' })
      .eq('partner_roles.role', 'customer')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrar por busca se fornecido
    if (search && search.trim()) {
      query = query.ilike('name', `%${search.trim()}%`);
    }

    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      // Mostrar registros do segmento específico + registros globais (segment_id = null)
      query = query.or(`segment_id.eq.${segmentId},segment_id.is.null`);
    }
    // Se segmentId for null, '0' ou não fornecido, mostra todos os registros

    const { data, error, count } = await query;

    console.log('📥 Resultado da listagem:', { count, error });
    console.log('👥 Primeiros 3 clientes encontrados:', data?.slice(0, 3));

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao buscar clientes',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customers: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na API de clientes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('👥 API Route POST /api/customers');
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);
    
    // Primeiro inserir o partner
    const { data: partner, error: partnerError } = await supabaseAdmin
      .from('partners')
      .insert([body])
      .select()
      .single();

    if (partnerError) {
      console.error('❌ Erro ao criar cliente:', partnerError);
      return NextResponse.json(
        { 
          error: 'Erro ao criar cliente',
          details: partnerError.message 
        },
        { status: 500 }
      );
    }

    // Depois inserir o role
    const { data, error } = await supabaseAdmin
      .from('partner_roles')
      .insert([{ partner_id: partner.id, role: 'customer' }])
      .select();

    if (error) {
      console.error('❌ Erro ao criar role do cliente:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao criar role do cliente',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Cliente criado:', partner);
    
    // Criar log de auditoria
    await createAuditLog(
      'CREATE',
      'partners',
      partner.id,
      null,
      { name: partner.name, email: partner.email, tax_id: partner.tax_id },
      null,
      'admin@erppro.com'
    );
    
    return NextResponse.json({
      success: true,
      customer: partner
    });
    
  } catch (error) {
    console.error('❌ Erro na criação de cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
