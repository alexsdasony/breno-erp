import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    const { id } = await params;
    const body = await request.json();
    console.log('💰 [FD UPDATE] Iniciando atualização');
    console.log('🔍 [FD UPDATE] id:', id);
    console.log('📥 Payload recebido:', body);

    // Validar se o ID não está vazio
    if (!id || id.trim().length === 0) {
      console.error('❌ ID vazio ou inválido:', id);
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID não pode ser vazio.',
          details: `ID recebido: ${id}`
        },
        { status: 400 }
      );
    }

    // Verificar se o ID é numérico (vem de financial_transactions)
    // Se for numérico, buscar o documento usando doc_no que contém o pluggy_id
    const isNumericId = /^\d+$/.test(id);
    let documentId = id;
    
    if (isNumericId) {
      console.log(`🔍 ID numérico detectado (${id}), buscando documento correspondente...`);
      
      // PRIMEIRA TENTATIVA: Usar doc_no do payload se disponível
      if (body.doc_no && typeof body.doc_no === 'string') {
        console.log(`🔍 Tentando buscar documento usando doc_no do payload: ${body.doc_no}`);
        const { data: docByDocNo, error: docNoError } = await supabaseAdmin
          .from('financial_documents')
          .select('id')
          .eq('doc_no', body.doc_no)
          .single();
        
        if (!docNoError && docByDocNo?.id) {
          documentId = docByDocNo.id;
          console.log(`✅ Documento encontrado via doc_no do payload: ${documentId}`);
        }
      }
      
      // SEGUNDA TENTATIVA: Buscar via financial_transactions se doc_no não funcionou
      if (documentId === id) {
        console.log(`🔍 Buscando documento via financial_transactions...`);
        const { data: transaction, error: txError } = await supabaseAdmin
          .from('financial_transactions')
          .select('pluggy_id, external_id')
          .eq('id', parseInt(id))
          .single();
        
        if (txError || !transaction) {
          console.error('❌ Transação não encontrada:', txError);
          return NextResponse.json(
            { 
              success: false, 
              error: 'Transação não encontrada.',
              details: `ID ${id} não existe em financial_transactions`
            },
            { status: 404 }
          );
        }
        
        // Buscar o documento financeiro usando pluggy_id/external_id como doc_no
        const pluggyId = transaction.pluggy_id || transaction.external_id;
        if (pluggyId) {
          const { data: doc, error: docError } = await supabaseAdmin
            .from('financial_documents')
            .select('id')
            .eq('doc_no', pluggyId)
            .single();
          
          if (!docError && doc?.id) {
            documentId = doc.id;
            console.log(`✅ Documento encontrado via pluggy_id: ${documentId}`);
          } else {
            return NextResponse.json(
              { 
                success: false, 
                error: 'Documento financeiro não encontrado.',
                details: `Nenhum documento encontrado com doc_no = ${pluggyId} para a transação ${id}`
              },
              { status: 404 }
            );
          }
        } else {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Transação sem pluggy_id.',
              details: `Transação ${id} não possui pluggy_id para buscar documento`
            },
            { status: 400 }
          );
        }
      }
    }

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
      .eq('id', documentId) // Usar documentId (pode ser o UUID encontrado ou o original)
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
