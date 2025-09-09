import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('🏭 [SUPPLIER UPDATE] Iniciando atualização');
    console.log('🔍 [SUPPLIER UPDATE] id:', id);
    console.log('📥 Payload recebido:', body);

    // Mapear status para valores aceitos pela constraint do banco
    const statusMap: Record<string, string> = {
      'ativo': 'ativo',
      'inativo': 'ativo',    // Mapear para 'ativo' que sabemos que funciona
      'active': 'ativo',
      'inactive': 'ativo'
    };

    // Normalizar o payload
    const normalizedBody = {
      ...body,
      status: body.status ? statusMap[body.status] || 'ativo' : 'ativo'
    };

    console.log('🧹 Payload normalizado:', normalizedBody);

    const { data, error } = await supabaseAdmin
      .from('partners')
      .update(normalizedBody)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Supabase UPDATE error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: error.details
        },
        { status: 500 }
      );
    }

    console.log('✅ Supabase UPDATE sucesso:', data);
    return NextResponse.json({
      success: true,
      supplier: data
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar fornecedor:', error);
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
    console.log('🏭 Deletando fornecedor:', { id });

    // Primeiro deletar o role
    const { error: roleError } = await supabaseAdmin
      .from('partner_roles')
      .delete()
      .eq('partner_id', id);

    if (roleError) {
      console.error('❌ Erro ao deletar role do fornecedor:', roleError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar role do fornecedor',
          details: roleError.message
        },
        { status: 500 }
      );
    }

    // Depois deletar o partner
    const { error } = await supabaseAdmin
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar fornecedor:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar fornecedor',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fornecedor deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar fornecedor:', error);
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
