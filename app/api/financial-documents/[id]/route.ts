import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('💰 Atualizando documento financeiro:', { id, body });

    // Determinar se é conta a pagar ou receber
    const table = body.type === 'receivable' ? 'accounts_receivable' : 'accounts_payable';
    
    const { data, error } = await supabaseAdmin
      .from(table)
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar documento financeiro:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao atualizar documento financeiro',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document: data
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar documento financeiro:', error);
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
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'payable';
    console.log('💰 Deletando documento financeiro:', { id, type });

    // Determinar se é conta a pagar ou receber
    const table = type === 'receivable' ? 'accounts_receivable' : 'accounts_payable';
    
    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar documento financeiro:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar documento financeiro',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Documento financeiro deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar documento financeiro:', error);
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
