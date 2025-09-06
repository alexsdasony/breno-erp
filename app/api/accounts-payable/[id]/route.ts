import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('🔍 API Route GET /api/accounts-payable/[id]:', id);
    
    const { data, error } = await supabase
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    console.log('🔧 API Route PUT /api/accounts-payable/[id]:', id);
    console.log('📝 Body recebido:', body);
    
    // Primeiro, verificar se o registro existe
    const { data: existingRecord, error: checkError } = await supabase
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
    
    const { data, error } = await supabase
      .from('accounts_payable')
      .update(body)
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log('🔍 API Route DELETE /api/accounts-payable/[id]:', id);
    
    const { error } = await supabase
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
