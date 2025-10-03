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
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segment_id');
    
    console.log('🔍 API Route GET /api/accounts-payable', { segmentId });
    
    // Buscar documentos financeiros com direction = 'payable' (contas a pagar)
    let query = supabaseAdmin
      .from('financial_documents')
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `)
      .eq('direction', 'payable')
      .order('due_date', { ascending: false });
    
    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      query = query.eq('segment_id', segmentId);
    }
    
    const { data, error } = await query;

    console.log('📥 Resultado da listagem:', { data, error });

    if (error) {
      console.error('❌ Erro ao buscar contas a pagar:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao buscar contas a pagar',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      accounts_payable: data || [],
      total: data?.length || 0
    });
  } catch (error) {
    console.error('❌ Erro na API route:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route POST /api/accounts-payable');
    const body = await request.json();
    console.log('📝 Body recebido:', body);
    
    // Garantir que direction seja 'payable' para contas a pagar
    const mappedBody = {
      ...body,
      direction: 'payable',
      status: body.status || 'paid'
    };
    
    const { data, error } = await supabaseAdmin
      .from('financial_documents')
      .insert(mappedBody)
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `)
      .single();

    if (error) {
      console.error('❌ Erro ao criar conta a pagar:', error);
      return NextResponse.json(
        { error: 'Erro ao criar conta a pagar', details: error.message },
        { status: 500 }
      );
    }

    // Criar log de auditoria
    await createAuditLog(
      'CREATE',
      'accounts_payable',
      data.id,
      null,
      { 
        supplier_name: data.supplier_name, 
        amount: data.amount, 
        due_date: data.due_date,
        status: data.status 
      },
      null,
      'admin@erppro.com'
    );

    return NextResponse.json({
      success: true,
      account_payable: data,
      message: 'Conta a Pagar criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro na API route POST:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
