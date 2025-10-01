import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('🔄 [SALES UPDATE] Atualizando venda:', id);
    console.log('🔄 [SALES UPDATE] Dados recebidos:', body);

    // Separar dados da venda dos itens
    const { items, ...saleData } = body;

    // Verificar se o cliente existe
    if (saleData.customer_id) {
      const { data: customer, error: customerError } = await supabaseAdmin
        .from('partners')
        .select('id, name')
        .eq('id', saleData.customer_id)
        .single();

      if (customerError || !customer) {
        console.error('❌ Cliente não encontrado:', customerError);
        return NextResponse.json(
          { 
            success: false,
            error: 'Cliente não encontrado'
          },
          { status: 400 }
        );
      }
    }

    // Buscar o nome do método de pagamento se for um ID
    let paymentMethodName = saleData.payment_method || 'Dinheiro';
    if (saleData.payment_method && saleData.payment_method !== 'Dinheiro') {
      try {
        const { data: paymentMethod } = await supabaseAdmin
          .from('payment_methods')
          .select('name')
          .eq('id', saleData.payment_method)
          .single();
        
        if (paymentMethod) {
          paymentMethodName = paymentMethod.name;
          console.log('✅ [SALES UPDATE] Método de pagamento encontrado:', paymentMethodName);
        }
      } catch (error) {
        console.warn('⚠️ [SALES UPDATE] Erro ao buscar método de pagamento:', error);
        // Se não encontrar, pode ser que já seja o nome
        paymentMethodName = saleData.payment_method;
      }
    }

    console.log('🔄 [SALES UPDATE] Nome do método de pagamento:', paymentMethodName);

    // Preparar dados para atualização
    const updateData = {
      customer_id: saleData.customer_id,
      customer_name: saleData.customer_name,
      sale_date: saleData.sale_date,
      total_amount: saleData.total_amount,
      payment_method: paymentMethodName, // Usar o nome do método de pagamento
      status: saleData.status,
      notes: saleData.notes || null,
      segment_id: saleData.segment_id === '' ? null : saleData.segment_id,
    };

    console.log('🔄 [SALES UPDATE] Dados para atualização:', updateData);

    // Atualizar a venda
    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (saleError) {
      console.error('❌ Erro ao atualizar venda:', saleError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao atualizar venda',
          details: saleError.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Venda atualizada:', sale);

    // Se houver itens, atualizar também
    if (items && items.length > 0) {
      // Deletar itens antigos
      await supabaseAdmin
        .from('sale_items')
        .delete()
        .eq('sale_id', id);

      // Inserir novos itens
      const itemsToInsert = items.map((item: any) => ({
        sale_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }));

      const { error: itemsError } = await supabaseAdmin
        .from('sale_items')
        .insert(itemsToInsert);

      if (itemsError) {
        console.error('❌ Erro ao atualizar itens:', itemsError);
        return NextResponse.json(
          { 
            success: false,
            error: 'Erro ao atualizar itens da venda',
            details: itemsError.message 
          },
          { status: 500 }
        );
      }

      console.log('✅ Itens atualizados');
    }

    return NextResponse.json({
      success: true,
      sale
    });

  } catch (error) {
    console.error('❌ Erro na API sales UPDATE:', error);
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
    
    console.log('🗑️ [SALES DELETE] Deletando venda:', id);

    // Marcar como deletado (soft delete)
    const { data, error } = await supabaseAdmin
      .from('sales')
      .update({ is_deleted: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao deletar venda:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao deletar venda',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Venda deletada');

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('❌ Erro na API sales DELETE:', error);
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
