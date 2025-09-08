import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    console.log('👥 Atualizando cliente:', { id, body });

    const { data, error } = await supabase
      .from('partners')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao atualizar cliente',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: data
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
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
    console.log('👥 Deletando cliente:', { id });

    // Primeiro deletar o role
    const { error: roleError } = await supabase
      .from('partner_roles')
      .delete()
      .eq('partner_id', id);

    if (roleError) {
      console.error('❌ Erro ao deletar role do cliente:', roleError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar role do cliente',
          details: roleError.message
        },
        { status: 500 }
      );
    }

    // Depois deletar o partner
    const { error } = await supabase
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar cliente:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar cliente',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar cliente:', error);
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
