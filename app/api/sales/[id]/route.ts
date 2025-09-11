import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('🛒 API Route PUT /api/sales/[id]');
    console.log('🔍 ID da venda:', id);
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);
    
    // Preparar dados para atualização
    const updateData: any = {};
    
    if (body.customer_id !== undefined) updateData.customer_id = body.customer_id;
    if (body.customer_name !== undefined) updateData.customer_name = body.customer_name;
    if (body.sale_date !== undefined) updateData.sale_date = body.sale_date;
    if (body.payment_method !== undefined) updateData.payment_method = body.payment_method;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.total_amount !== undefined) updateData.total_amount = body.total_amount;
    if (body.segment_id !== undefined) {
      updateData.segment_id = body.segment_id === '' ? null : body.segment_id;
    }
    
    console.log('🧹 Dados para atualização:', updateData);
    
    const { data, error } = await supabaseAdmin
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar venda:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao atualizar venda',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Venda atualizada:', data);
    return NextResponse.json({
      success: true,
      sale: data
    });
    
  } catch (error) {
    console.error('❌ Erro na atualização de venda:', error);
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
    const { id } = await params;
    console.log('🛒 API Route DELETE /api/sales/[id]');
    console.log('🔍 ID da venda:', id);
    
    const { error } = await supabaseAdmin
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao excluir venda:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao excluir venda',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Venda excluída:', id);
    return NextResponse.json({
      success: true,
      message: 'Venda excluída com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro na exclusão de venda:', error);
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('🛒 API Route GET /api/sales/[id]');
    console.log('🔍 ID da venda:', id);
    
    const { data, error } = await supabaseAdmin
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar venda:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Venda não encontrada',
          details: error.message 
        },
        { status: 404 }
      );
    }

    console.log('✅ Venda encontrada:', data);
    return NextResponse.json({
      success: true,
      sale: data
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar venda:', error);
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
