import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
      .order('name', { ascending: true })
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
