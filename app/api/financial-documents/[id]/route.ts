import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('💰 [FD UPDATE] Iniciando atualização');
    console.log('🔍 [FD UPDATE] id:', id);
    console.log('📥 Payload recebido:', body);

    // Determinar se é conta a pagar ou receber
    const table = body.type === 'receivable' ? 'accounts_receivable' : 'accounts_payable';
    
    // Mapear status para valores aceitos pela constraint do banco
    const statusMap: Record<string, string> = {
      'pending': 'pendente',
      'paid': 'pendente',
      'overdue': 'pendente',
      'cancelled': 'pendente',
      'vencido': 'pendente'
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
    console.log('📊 Tabela de destino:', table);
    
    const { data, error } = await supabaseAdmin
      .from(table)
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
