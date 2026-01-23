import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    console.log('💰 Buscando documento financeiro:', { id });

    // Buscar documento específico na tabela financial_documents
    const { data, error } = await supabaseAdmin
      .from('financial_documents')
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar documento financeiro:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar documento financeiro',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Documento financeiro encontrado:', data);
    return NextResponse.json({
      success: true,
      financialDocument: data
    });

  } catch (error) {
    console.error('❌ Erro ao buscar documento financeiro:', error);
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    
    console.log('💰 [FD UPDATE] Iniciando atualização do documento:', id);

    // VALIDAR UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!id || id.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID não pode ser vazio.',
          details: `ID recebido: ${id}`
        },
        { status: 400 }
      );
    }
    
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID inválido. Deve ser um UUID válido de financial_documents.',
          details: `ID recebido: ${id}`
        },
        { status: 400 }
      );
    }

    // CARREGAR financial_document (verificar se existe)
    const { data: existingDoc, error: fetchError } = await supabaseAdmin
      .from('financial_documents')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingDoc) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Documento não encontrado.',
          details: `Nenhum documento encontrado com ID: ${id}`
        },
        { status: 404 }
      );
    }

    // NORMALIZAR PAYLOAD (apenas campos permitidos)
    const normalizedBody: Record<string, any> = {};
    if (body.direction !== undefined) normalizedBody.direction = body.direction;
    if (body.description !== undefined) normalizedBody.description = body.description;
    if (body.amount !== undefined) normalizedBody.amount = body.amount;
    if (body.issue_date !== undefined) normalizedBody.issue_date = body.issue_date;
    if (body.due_date !== undefined) normalizedBody.due_date = body.due_date;
    if (body.status !== undefined) normalizedBody.status = body.status;
    if (body.partner_id !== undefined) normalizedBody.partner_id = body.partner_id;
    if (body.segment_id !== undefined) normalizedBody.segment_id = body.segment_id;
    if (body.payment_method_id !== undefined) normalizedBody.payment_method_id = body.payment_method_id;
    if (body.doc_no !== undefined) normalizedBody.doc_no = body.doc_no;
    if (body.notes !== undefined) normalizedBody.notes = body.notes;
    
    // ATUALIZAR financial_document (apenas este documento, sem efeitos colaterais)
    const { data, error } = await supabaseAdmin
      .from('financial_documents')
      .update(normalizedBody)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ [FD UPDATE] Erro ao atualizar:', error.message);
      return NextResponse.json(
        { 
          success: false, 
          error: error.message,
          details: error.details
        },
        { status: 500 }
      );
    }

    console.log('✅ [FD UPDATE] Documento atualizado com sucesso');
    
    // RETORNAR { success: true }
    return NextResponse.json({
      success: true,
      document: data
    });

  } catch (error) {
    console.error('❌ [FD UPDATE] Erro:', error instanceof Error ? error.message : 'Erro desconhecido');
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
    console.log('💰 Deletando documento financeiro:', { id });

    // Usar sempre a tabela financial_documents
    const { error } = await supabaseAdmin
      .from('financial_documents')
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
