import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segment_id');
    
    console.log('🔍 API Route GET /api/accounts-receivable', { segmentId });
    
    // Buscar documentos financeiros com direction = 'receivable' (contas a receber)
    let queryDocs = supabaseAdmin
      .from('financial_documents')
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `)
      .eq('direction', 'receivable')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    
    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      queryDocs = queryDocs.eq('segment_id', segmentId);
    }
    
    const { data: financialDocuments, error: docsError } = await queryDocs;

    if (docsError) {
      console.error('❌ Erro ao buscar documentos financeiros:', docsError);
    }

    // Buscar transações Pluggy com direction = 'receivable' (contas a receber)
    let queryTransactions = supabaseAdmin
      .from('financial_transactions')
      .select('*')
      .eq('direction', 'receivable');

    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      queryTransactions = queryTransactions.eq('segment_id', segmentId);
    }

    queryTransactions = queryTransactions.order('date', { ascending: false });

    const { data: pluggyTransactions, error: transactionsError } = await queryTransactions;

    if (transactionsError) {
      console.warn('⚠️ Erro ao buscar transações Pluggy (não crítico):', transactionsError);
    }

    // Converter transações Pluggy para formato de contas a receber
    // GARANTIR: Todas as transações com pluggy_id são sempre marcadas como 'pluggy'
    const convertedTransactions = (pluggyTransactions || []).map((tx: any) => {
      // Garantir que sempre tenha pluggy_id (se não tiver, não é Pluggy)
      const pluggyId = tx.pluggy_id || tx.external_id;
      
      return {
        id: tx.id,
        partner_id: null,
        direction: 'receivable',
        doc_no: pluggyId || null,
        issue_date: tx.date,
        due_date: tx.date,
        amount: Math.abs(Number(tx.amount) || 0),
        balance: Math.abs(Number(tx.amount) || 0),
        status: 'open', // Transações Pluggy sempre aparecem como "Aberto"
        category_id: null,
        segment_id: tx.segment_id,
        description: tx.description || 'Transação Pluggy',
        payment_method: 'PIX',
        notes: `Importado da Pluggy - ${tx.institution || 'Banco'} - ${tx.category || ''}`,
        created_at: tx.created_at,
        updated_at: tx.updated_at,
        deleted_at: null,
        is_deleted: false,
        payment_method_id: null,
        partner: null,
        payment_method_data: null,
        _source: 'pluggy', // SEMPRE 'pluggy' para transações da tabela financial_transactions
        pluggy_id: pluggyId, // SEMPRE preenchido para transações Pluggy
        account_id: tx.account_id,
        institution: tx.institution
      };
    });

    // Combinar documentos e transações Pluggy
    // Marcar documentos manuais: se data <= 29/10/2025 OU se não tem pluggy_id
    const allAccountsReceivable = [
      ...(financialDocuments || []).map((doc: any) => {
        const issueDate = doc.issue_date || doc.due_date;
        const isManual = !doc.pluggy_id && (!issueDate || issueDate <= '2025-10-29');
        return { ...doc, _source: isManual ? 'manual' : (doc._source || 'manual') };
      }),
      ...convertedTransactions
    ];

    // Ordenar por data (mais recente primeiro)
    allAccountsReceivable.sort((a: any, b: any) => {
      const dateA = new Date(a.issue_date || a.created_at || 0).getTime();
      const dateB = new Date(b.issue_date || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    console.log('📥 Resultado da listagem:', { 
      documentos: financialDocuments?.length || 0,
      transacoesPluggy: pluggyTransactions?.length || 0,
      total: allAccountsReceivable.length
    });

    return NextResponse.json({
      success: true,
      accounts_receivable: allAccountsReceivable,
      total: allAccountsReceivable.length
    });
  } catch (error) {
    console.error('❌ Erro na API route:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route POST /api/accounts-receivable');
    const body = await request.json();
    console.log('📝 Body recebido:', body);
    
    // Garantir que direction seja 'receivable' para contas a receber
    const mappedBody = {
      ...body,
      direction: 'receivable',
      status: body.status || 'paid'
    };
    
    const { data, error } = await supabaseAdmin
      .from('financial_documents')
      .insert(mappedBody)
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `)
      .single();

    if (error) {
      console.error('❌ Erro ao criar conta a receber:', error);
      return NextResponse.json(
        { error: 'Erro ao criar conta a receber', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      account_receivable: data,
      message: 'Conta a Receber criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro na API route POST:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}