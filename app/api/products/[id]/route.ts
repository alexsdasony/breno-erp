import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('📦 [PRODUCT UPDATE] Iniciando atualização');
    console.log('🔍 [PRODUCT UPDATE] id:', id);
    console.log('📥 Payload recebido:', body);

    // Mapear status para valores aceitos pela constraint do banco
    const statusMap: Record<string, string> = {
      'ativo': 'active',
      'inativo': 'active',
      'active': 'active',
      'inactive': 'active'
    };

    // Normalizar o payload
    const normalizedBody = {
      ...body,
      status: body.status ? statusMap[body.status] || 'active' : 'active'
    };

    console.log('🧹 Payload normalizado:', normalizedBody);

    const { data, error } = await supabaseAdmin
      .from('products')
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
      product: data
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
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
    console.log('📦 Deletando produto:', { id });

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar produto:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar produto',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar produto:', error);
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
