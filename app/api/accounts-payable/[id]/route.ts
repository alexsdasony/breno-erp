import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 API Route GET /api/accounts-payable/[id]:', id);
    
    const { data, error } = await supabaseAdmin
      .from('accounts_payable')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.log('❌ Conta a pagar não encontrada:', { id, error });
      return NextResponse.json(
        { error: 'Conta a Pagar não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      account_payable: data
    });
  } catch (error) {
    console.error('❌ Erro na API route GET [id]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('🔧 API Route PUT /api/accounts-payable/[id]:', id);
    console.log('📝 Body recebido:', body);
    
    // Converter strings vazias para null nos campos UUID
    const cleanedBody = {
      ...body,
      supplier_id: body.supplier_id === '' ? null : body.supplier_id,
      categoria_id: body.categoria_id === '' ? null : body.categoria_id,
      data_pagamento: body.data_pagamento === '' ? null : body.data_pagamento,
    };
    
    console.log('🧹 Body limpo:', cleanedBody);
    
    // Primeiro, verificar se o registro existe
    const { data: existingRecord, error: checkError } = await supabaseAdmin
      .from('accounts_payable')
      .select('id')
      .eq('id', id)
      .single();
    
    console.log('🔍 Verificação de existência:', { existingRecord, checkError });
    
    if (checkError || !existingRecord) {
      console.log('❌ Registro não encontrado para ID:', id);
      return NextResponse.json(
        { 
          error: 'Conta a Pagar não encontrado',
          id: id,
          details: checkError?.message 
        },
        { status: 404 }
      );
    }
    
    console.log('✅ Registro encontrado, procedendo com update...');

    const { data, error } = await supabaseAdmin
      .from('accounts_payable')
      .update(cleanedBody)
      .eq('id', id)
      .select()
      .single();

    console.log('📥 Resultado do update:', { data, error });

    if (error || !data) {
      console.log('❌ Erro no update:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao atualizar conta a pagar',
          details: error?.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Update realizado com sucesso');
    return NextResponse.json({
      success: true,
      account_payable: data,
      message: 'Conta a Pagar atualizado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro na API route PUT [id]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 API Route DELETE /api/accounts-payable/[id]:', id);
    
    const { error } = await supabaseAdmin
      .from('accounts_payable')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar conta a pagar:', error);
      return NextResponse.json(
        { error: 'Conta a Pagar não encontrado', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conta a Pagar deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro na API route DELETE [id]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
