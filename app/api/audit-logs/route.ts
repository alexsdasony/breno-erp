import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const tableName = searchParams.get('table_name');
    const action = searchParams.get('action');
    const userId = searchParams.get('user_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    console.log('📋 Audit logs request:', { page, pageSize, tableName, action, userId, startDate, endDate });

    // Construir query base
    let query = supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (tableName) {
      query = query.eq('table_name', tableName);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (userId) {
      query = query.eq('user_id', userId);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    // Paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('❌ Erro ao buscar logs de auditoria:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar logs de auditoria' },
        { status: 500 }
      );
    }

    console.log('📋 Logs encontrados:', count);

    return NextResponse.json({
      success: true,
      logs: logs || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize)
      }
    });

  } catch (error) {
    console.error('❌ Erro na API audit-logs:', error);
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

// Endpoint para logar ações manuais (login, logout, etc.)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, table_name, record_id, old_values, new_values } = body;

    console.log('📝 Logging manual action:', { action, table_name, record_id });

    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address: request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao inserir log manual:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao inserir log' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      log: data
    });

  } catch (error) {
    console.error('❌ Erro na API audit-logs POST:', error);
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
