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
    console.log('💰 Atualizando documento financeiro:', { id, body });

    // Determinar se é conta a pagar ou receber
    const table = body.type === 'receivable' ? 'accounts_receivable' : 'accounts_payable';
    
    const { data, error } = await supabase
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'payable';
    console.log('💰 Deletando documento financeiro:', { id, type });

    // Determinar se é conta a pagar ou receber
    const table = type === 'receivable' ? 'accounts_receivable' : 'accounts_payable';
    
    const { error } = await supabase
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
