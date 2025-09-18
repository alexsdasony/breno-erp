import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('💰 [FD UPDATE] Iniciando atualização');
    console.log('🔍 [FD UPDATE] id:', id);
    console.log('📥 Payload recebido:', body);

    // Usar sempre a tabela financial_documents
    const table = 'financial_documents';
    
    // Normalizar o payload para a tabela financial_documents
    const normalizedBody = {
      direction: body.direction,
      description: body.description,
      amount: body.amount,
      issue_date: body.issue_date,
      due_date: body.due_date,
      status: body.status || 'paid',
      partner_id: body.partner_id,
      segment_id: body.segment_id,
      payment_method_id: body.payment_method_id,
      doc_no: body.doc_no,
      notes: body.notes
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
