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
    console.log('💳 API Route GET /api/payment-methods');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;
    
    console.log('📝 Parâmetros:', { page, limit, offset });
    
    // Buscar métodos de pagamento do banco de dados
    const { data: paymentMethods, error } = await supabaseAdmin
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Erro ao buscar métodos de pagamento:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar métodos de pagamento' },
        { status: 500 }
      );
    }

    // Buscar total para paginação
    const { count } = await supabaseAdmin
      .from('payment_methods')
      .select('*', { count: 'exact', head: true });

    console.log('📥 Retornando métodos de pagamento do banco');
    console.log('📥 Métodos encontrados:', paymentMethods?.length || 0);
    console.log('📥 Dados dos métodos:', paymentMethods);

    return NextResponse.json({
      success: true,
      paymentMethods: paymentMethods || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na API de métodos de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💳 API Route POST /api/payment-methods');
    
    const body = await request.json();
    console.log('📥 Dados recebidos:', body);
    
    const { name, nfe_code } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se já existe um método com o mesmo nome
    const { data: existing } = await supabaseAdmin
      .from('payment_methods')
      .select('id')
      .eq('name', name.trim())
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma forma de pagamento com este nome' },
        { status: 400 }
      );
    }
    
    // Criar novo método de pagamento
    const { data: newPaymentMethod, error } = await supabaseAdmin
      .from('payment_methods')
      .insert({
        name: name.trim(),
        nfe_code: nfe_code || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar método de pagamento:', error);
      return NextResponse.json(
        { error: 'Erro ao criar método de pagamento' },
        { status: 500 }
      );
    }
    
    console.log('✅ Método de pagamento criado:', newPaymentMethod);
    
    // Criar log de auditoria
    await createAuditLog(
      'CREATE',
      'payment_methods',
      newPaymentMethod.id,
      null,
      { 
        name: newPaymentMethod.name, 
        nfe_code: newPaymentMethod.nfe_code 
      },
      null,
      'admin@erppro.com'
    );
    
    return NextResponse.json({
      success: true,
      payment_method: newPaymentMethod
    });
    
  } catch (error) {
    console.error('❌ Erro na API de métodos de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
