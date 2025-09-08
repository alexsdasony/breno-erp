import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log('💰 Atualizando conta a receber:', { id, body });

    const { data, error } = await supabase
      .from('accounts_receivable')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar conta a receber:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao atualizar conta a receber',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      account_receivable: data
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar conta a receber:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    console.log('💰 Deletando conta a receber:', { id });

    const { error } = await supabase
      .from('accounts_receivable')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar conta a receber:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar conta a receber',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conta a receber deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar conta a receber:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
