import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    
    console.log('💳 API Route PUT /api/payment-methods/' + id);
    
    const body = await request.json();
    console.log('📥 Dados recebidos:', body);
    
    const { name, nfe_code } = body;
    
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
        { status: 400 }
      );
    }
    
    // Verificar se já existe outro método com o mesmo nome
    const { data: existing } = await supabaseAdmin
      .from('payment_methods')
      .select('id')
      .eq('name', name.trim())
      .neq('id', id)
      .single();
    
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma forma de pagamento com este nome' },
        { status: 400 }
      );
    }
    
    // Atualizar método de pagamento
    const { data: updatedPaymentMethod, error } = await supabaseAdmin
      .from('payment_methods')
      .update({
        name: name.trim(),
        nfe_code: nfe_code || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao atualizar método de pagamento:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar método de pagamento' },
        { status: 500 }
      );
    }
    
    if (!updatedPaymentMethod) {
      return NextResponse.json(
        { error: 'Método de pagamento não encontrado' },
        { status: 404 }
      );
    }
    
    console.log('✅ Método de pagamento atualizado:', updatedPaymentMethod);
    
    return NextResponse.json({
      success: true,
      payment_method: updatedPaymentMethod
    });
    
  } catch (error) {
    console.error('❌ Erro na API de métodos de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    
    console.log('💳 API Route DELETE /api/payment-methods/' + id);
    
    // Verificar se o método de pagamento existe
    const { data: existing } = await supabaseAdmin
      .from('payment_methods')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (!existing) {
      return NextResponse.json(
        { error: 'Método de pagamento não encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar se está sendo usado em vendas ou outras transações
    const { data: salesUsing } = await supabaseAdmin
      .from('sales')
      .select('id')
      .eq('payment_method_id', id)
      .limit(1);
    
    if (salesUsing && salesUsing.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível excluir este método de pagamento pois está sendo usado em vendas' },
        { status: 400 }
      );
    }
    
    // Deletar método de pagamento
    const { error } = await supabaseAdmin
      .from('payment_methods')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao deletar método de pagamento:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar método de pagamento' },
        { status: 500 }
      );
    }
    
    console.log('✅ Método de pagamento deletado:', existing.name);
    
    return NextResponse.json({
      success: true,
      message: 'Método de pagamento excluído com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro na API de métodos de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
