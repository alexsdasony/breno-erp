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
    
    // Função para normalizar valores
    const normalizeValue = (value: any, type: 'string' | 'number' | 'date' | 'uuid') => {
      if (value === null || value === undefined || value === '') {
        return null;
      }
      
      switch (type) {
        case 'number':
          const num = typeof value === 'string' ? parseFloat(value) : value;
          return isNaN(num) ? null : num;
        case 'date':
          return value || null;
        case 'uuid':
          return value || null;
        case 'string':
        default:
          return value || null;
      }
    };
    
    // Validação e conversão de tipos antes de chamar o Supabase
    const cleanedBody = {
      // Campos obrigatórios
      descricao: body.descricao || '',
      valor: normalizeValue(body.valor, 'number'),
      data_vencimento: normalizeValue(body.data_vencimento, 'date'),
      
      // Campos opcionais com normalização
      supplier_id: normalizeValue(body.supplier_id, 'uuid'),
      categoria_id: normalizeValue(body.categoria_id, 'uuid'),
      segment_id: normalizeValue(body.segment_id, 'uuid'),
      data_pagamento: normalizeValue(body.data_pagamento, 'date'),
      observacoes: normalizeValue(body.observacoes, 'string'),
      numero_nota_fiscal: normalizeValue(body.numero_nota_fiscal, 'string'),
      responsavel_pagamento: normalizeValue(body.responsavel_pagamento, 'string'),
      
      // Campos de enum
      status: body.status || 'pendente',
      forma_pagamento: body.forma_pagamento || 'boleto',
      
      // Campos numéricos opcionais
      numero_parcela: normalizeValue(body.numero_parcela, 'number') || 1,
      total_parcelas: normalizeValue(body.total_parcelas, 'number') || 1,
    };
    
    console.log('🧹 Body limpo e normalizado:', cleanedBody);
    
    // Validações obrigatórias
    if (!cleanedBody.descricao) {
      return NextResponse.json(
        { error: 'Descrição é obrigatória' },
        { status: 400 }
      );
    }
    
    if (cleanedBody.valor === null || cleanedBody.valor <= 0) {
      return NextResponse.json(
        { error: 'Valor deve ser um número positivo' },
        { status: 400 }
      );
    }
    
    if (!cleanedBody.data_vencimento) {
      return NextResponse.json(
        { error: 'Data de vencimento é obrigatória' },
        { status: 400 }
      );
    }
    
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
    console.log('🔍 ID do registro:', id);
    console.log('🔍 Dados que serão enviados para o Supabase:', JSON.stringify(cleanedBody, null, 2));

    const { data, error } = await supabaseAdmin
      .from('accounts_payable')
      .update(cleanedBody)
      .eq('id', id)
      .select()
      .single();

    console.log('📥 Resultado do update:', { data, error });
    
    if (error) {
      console.log('❌ ERRO DETALHADO DO SUPABASE:');
      console.log('  - Message:', error.message);
      console.log('  - Code:', error.code);
      console.log('  - Hint:', error.hint);
      console.log('  - Details:', error.details);
      console.log('  - Error completo:', JSON.stringify(error, null, 2));
    }

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
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
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
