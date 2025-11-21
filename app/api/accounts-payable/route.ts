import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// Função para criar log de auditoria
async function createAuditLog(action: string, tableName: string, recordId: string | null, oldValues: any = null, newValues: any = null, userId: string | null = null, userEmail: string | null = null) {
  try {
    const { error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues,
        new_values: newValues,
        user_id: userId,
        user_email: userEmail,
        ip_address: '127.0.0.1',
        user_agent: 'Sistema de Auditoria'
      });
    
    if (error) {
      console.error('❌ Erro ao criar log de auditoria:', error);
    } else {
      console.log('✅ Log de auditoria criado:', { action, tableName, recordId });
    }
  } catch (error) {
    console.error('❌ Erro ao criar log de auditoria:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segment_id');
    
    console.log('🔍 API Route GET /api/accounts-payable', { segmentId });
    
    // Buscar documentos financeiros com direction = 'payable' (contas a pagar)
    let queryDocs = supabaseAdmin
      .from('financial_documents')
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `)
      .eq('direction', 'payable')
      .eq('is_deleted', false)
      .order('due_date', { ascending: false });
    
    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      queryDocs = queryDocs.eq('segment_id', segmentId);
    }
    
    const { data: financialDocuments, error: docsError } = await queryDocs;

    if (docsError) {
      console.error('❌ Erro ao buscar documentos financeiros:', docsError);
    }

    // Buscar transações Pluggy com direction = 'payable' (contas a pagar)
    let queryTransactions = supabaseAdmin
      .from('financial_transactions')
      .select('*')
      .eq('direction', 'payable');

    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      queryTransactions = queryTransactions.eq('segment_id', segmentId);
    }

    queryTransactions = queryTransactions.order('date', { ascending: false });

    const { data: pluggyTransactions, error: transactionsError } = await queryTransactions;

    if (transactionsError) {
      console.warn('⚠️ Erro ao buscar transações Pluggy (não crítico):', transactionsError);
    }

    // Converter transações Pluggy para formato de contas a pagar
    const convertedTransactions = (pluggyTransactions || []).map((tx: any) => ({
      id: tx.id,
      partner_id: null,
      direction: 'payable',
      doc_no: tx.pluggy_id || tx.external_id || null,
      issue_date: tx.date,
      due_date: tx.date,
      amount: Math.abs(Number(tx.amount) || 0),
      balance: Math.abs(Number(tx.amount) || 0),
      status: tx.status === 'POSTED' ? 'paid' : 'open',
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
      _source: 'pluggy', // Flag para identificar origem
      pluggy_id: tx.pluggy_id,
      account_id: tx.account_id,
      institution: tx.institution
    }));

    // Combinar documentos e transações Pluggy
    // Marcar documentos manuais: se data <= 29/10/2025 OU se não tem pluggy_id
    const allAccountsPayable = [
      ...(financialDocuments || []).map((doc: any) => {
        const issueDate = doc.issue_date || doc.due_date;
        const isManual = !doc.pluggy_id && (!issueDate || issueDate <= '2025-10-29');
        return { ...doc, _source: isManual ? 'manual' : (doc._source || 'manual') };
      }),
      ...convertedTransactions
    ];

    // Ordenar por data de vencimento (mais recente primeiro)
    allAccountsPayable.sort((a: any, b: any) => {
      const dateA = new Date(a.due_date || a.issue_date || 0).getTime();
      const dateB = new Date(b.due_date || b.issue_date || 0).getTime();
      return dateB - dateA;
    });

    console.log('📥 Resultado da listagem:', { 
      documentos: financialDocuments?.length || 0,
      transacoesPluggy: pluggyTransactions?.length || 0,
      total: allAccountsPayable.length
    });

    return NextResponse.json({
      success: true,
      accounts_payable: allAccountsPayable,
      total: allAccountsPayable.length
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
    console.log('🔍 API Route POST /api/accounts-payable');
    const body = await request.json();
    console.log('📝 Body recebido:', body);
    
    // Garantir que direction seja 'payable' para contas a pagar
    const mappedBody = {
      ...body,
      direction: 'payable',
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
      console.error('❌ Erro ao criar conta a pagar:', error);
      return NextResponse.json(
        { error: 'Erro ao criar conta a pagar', details: error.message },
        { status: 500 }
      );
    }

    // Criar log de auditoria
    await createAuditLog(
      'CREATE',
      'accounts_payable',
      data.id,
      null,
      { 
        supplier_name: data.supplier_name, 
        amount: data.amount, 
        due_date: data.due_date,
        status: data.status 
      },
      null,
      'admin@erppro.com'
    );

    return NextResponse.json({
      success: true,
      account_payable: data,
      message: 'Conta a Pagar criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Erro na API route POST:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
