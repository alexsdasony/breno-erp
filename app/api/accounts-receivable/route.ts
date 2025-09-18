import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segment_id');
    
    console.log('🔍 API Route GET /api/accounts-receivable', { segmentId });
    
    // Buscar documentos financeiros com direction = 'receivable' (contas a receber)
    let query = supabaseAdmin
      .from('financial_documents')
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `)
      .eq('direction', 'receivable')
      .order('created_at', { ascending: false });
    
    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      query = query.eq('segment_id', segmentId);
    }
    
    const { data, error } = await query;

    console.log('📥 Resultado da listagem:', { data, error });

    if (error) {
      console.error('❌ Erro ao buscar contas a receber:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao buscar contas a receber',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      accounts_receivable: data || [],
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
    console.log('🔍 API Route POST /api/accounts-receivable');
    const body = await request.json();
    console.log('📝 Body recebido:', body);
    
    // Garantir que direction seja 'receivable' para contas a receber
    const mappedBody = {
      ...body,
      direction: 'receivable',
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
      console.error('❌ Erro ao criar conta a receber:', error);
      return NextResponse.json(
        { error: 'Erro ao criar conta a receber', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      account_receivable: data,
      message: 'Conta a Receber criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro na API route POST:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}