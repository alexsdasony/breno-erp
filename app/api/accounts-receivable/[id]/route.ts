import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    console.log('💰 [AR UPDATE] Iniciando atualização');
    console.log('🔍 [AR UPDATE] id:', id);
    console.log('📥 Payload recebido:', body);

    // Mapear status para valores aceitos pela constraint do banco
    // Similar ao accounts-payable
    const statusMap: Record<string, string> = {
      'pending': 'pendente',
      'paid': 'pendente',    // Usar 'pendente' que sabemos que funciona
      'overdue': 'pendente', // Usar 'pendente' que sabemos que funciona
      'cancelled': 'pendente', // Usar 'pendente' que sabemos que funciona
      'vencido': 'pendente'  // Usar 'pendente' que sabemos que funciona
    };

    // Mapear forma_pagamento de inglês para português
    const paymentMethodMap: Record<string, string> = {
      'boleto': 'boleto',
      'cash': 'dinheiro',
      'credit_card': 'cartão de crédito',
      'debit_card': 'cartão de débito',
      'pix': 'pix',
      'bank_transfer': 'transferência bancária'
    };

    // Normalizar o payload
    const normalizedBody = {
      ...body,
      status: body.status ? statusMap[body.status] || 'pendente' : 'pendente',
      forma_pagamento: body.forma_pagamento ? paymentMethodMap[body.forma_pagamento] || body.forma_pagamento : 'boleto'
    };

    console.log('🧹 Payload normalizado:', normalizedBody);

    const { data, error } = await supabaseAdmin
      .from('accounts_receivable')
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
    const supabaseAdmin = getSupabaseAdmin();
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
