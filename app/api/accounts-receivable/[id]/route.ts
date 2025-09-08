import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('💰 Atualizando conta a receber:', { id, body });

    const { data, error } = await supabaseAdmin
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

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('💰 Deletando conta a receber:', { id });

    const { error } = await supabaseAdmin
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
