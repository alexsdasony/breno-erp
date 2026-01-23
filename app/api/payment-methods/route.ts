import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';
import { createAuditLog } from '@/lib/createAuditLog';
import { analyzeSupabaseError, formatSupabaseErrorResponse } from '@/lib/supabaseErrorHandler';

export async function GET(request: NextRequest) {
  try {
    console.log('💳 API Route GET /api/payment-methods');
    
    const supabaseAdmin = getSupabaseAdmin();
    
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
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
        details: errorMessage,
        ...(process.env.NODE_ENV !== 'production' && errorStack ? { stack: errorStack } : {})
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💳 API Route POST /api/payment-methods');
    
    const supabaseAdmin = getSupabaseAdmin();
    
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
    const errorInfo = analyzeSupabaseError(error);
    
    return NextResponse.json(
      formatSupabaseErrorResponse(errorInfo),
      { status: 500 }
    );
  }
}
