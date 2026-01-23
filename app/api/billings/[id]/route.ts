import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    console.log('💳 Buscando cobrança:', { id });

    const { data: billing, error } = await supabaseAdmin
      .from('billings')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar cobrança:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cobrança não encontrada',
          details: error.message
        },
        { status: 404 }
      );
    }

    console.log('📊 Cobrança encontrada:', billing);

    return NextResponse.json({
      success: true,
      billing
    });

  } catch (error) {
    console.error('❌ Erro na API billings/[id]:', error);
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    console.log('💳 Atualizando cobrança:', { id, body });

    // Validar dados obrigatórios
    if (!body.amount || !body.due_date) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Dados obrigatórios não fornecidos',
          details: 'amount e due_date são obrigatórios'
        },
        { status: 400 }
      );
    }

    const { data: billing, error } = await supabaseAdmin
      .from('billings')
      .update({
        customer_id: body.customer_id,
        customer_name: body.customer_name,
        amount: parseFloat(body.amount),
        due_date: body.due_date,
        status: body.status || 'Pendente',
        payment_date: body.payment_date || null,
        segment_id: body.segment_id || null
      })
      .eq('id', id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar cobrança:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao atualizar cobrança',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Cobrança atualizada:', billing);

    return NextResponse.json({
      success: true,
      billing
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar cobrança:', error);
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    console.log('💳 Excluindo cobrança:', { id });

    // Soft delete - marcar como deletado
    const { data: billing, error } = await supabaseAdmin
      .from('billings')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('is_deleted', false)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao excluir cobrança:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao excluir cobrança',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Cobrança excluída:', billing);

    return NextResponse.json({
      success: true,
      message: 'Cobrança excluída com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao excluir cobrança:', error);
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
