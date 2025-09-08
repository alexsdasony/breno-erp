import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  request: Request,
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('🔧 API Route PUT /api/accounts-payable/[id]:', id);
    console.log('📝 Body recebido:', body);
    
    // Normalizar campos para evitar erros de tipo
    const cleanedBody = {
      ...body,
      // Converter strings vazias para null nos campos UUID
      supplier_id: body.supplier_id === '' || body.supplier_id === undefined ? null : body.supplier_id,
      categoria_id: body.categoria_id === '' || body.categoria_id === undefined ? null : body.categoria_id,
      segment_id: body.segment_id === '' || body.segment_id === undefined ? null : body.segment_id,
      // Tratar campos de data
      data_pagamento: body.data_pagamento === '' || body.data_pagamento === undefined ? null : body.data_pagamento,
      // Garantir que valor seja numérico
      valor: typeof body.valor === 'string' ? parseFloat(body.valor) : body.valor,
      // Tratar campos opcionais
      observacoes: body.observacoes === '' || body.observacoes === undefined ? null : body.observacoes,
      numero_nota_fiscal: body.numero_nota_fiscal === '' || body.numero_nota_fiscal === undefined ? null : body.numero_nota_fiscal,
      responsavel_pagamento: body.responsavel_pagamento === '' || body.responsavel_pagamento === undefined ? null : body.responsavel_pagamento,
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

    if (error) {
      console.log('❌ Erro no update:', error);
      return NextResponse.json(
        { 
          error: 'Erro ao atualizar conta a pagar',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    if (!data) {
      console.log('❌ Nenhum dado retornado do update');
      return NextResponse.json(
        { 
          error: 'Erro ao atualizar conta a pagar',
          details: 'Nenhum dado foi retornado após a atualização'
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
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
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
