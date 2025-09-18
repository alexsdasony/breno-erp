import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

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
      .order('created_at', { ascending: false });
    
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
