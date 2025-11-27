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
    const pageParam = searchParams.get('page') || '1';
    const pageSizeParam = searchParams.get('pageSize') || '20';
    
    // Validar e converter parâmetros de paginação
    const page = isNaN(parseInt(pageParam)) ? 1 : Math.max(1, parseInt(pageParam));
    const pageSize = isNaN(parseInt(pageSizeParam)) ? 20 : Math.max(1, Math.min(100, parseInt(pageSizeParam)));
    const segmentId = searchParams.get('segment_id');
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');

    console.log('💰 Financial documents API request:', { page, pageSize, segmentId, dateStart, dateEnd });

    // Buscar documentos financeiros da tabela financial_documents
    let queryDocs = supabaseAdmin
      .from('financial_documents')
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `)
      .eq('is_deleted', false);

    // Aplicar filtro de segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      queryDocs = queryDocs.eq('segment_id', segmentId);
      console.log('🔍 Aplicando filtro de segmento:', segmentId);
    }
    
    queryDocs = queryDocs.order('issue_date', { ascending: false });

    // Aplicar filtros de data se fornecidos
    if (dateStart) {
      queryDocs = queryDocs.gte('issue_date', dateStart);
    }
    if (dateEnd) {
      queryDocs = queryDocs.lte('issue_date', dateEnd);
    }

    const { data: financialDocuments, error: financialDocsError } = await queryDocs;

    // Buscar transações da Pluggy (financial_transactions) e converter para formato de documentos
    let queryTransactions = supabaseAdmin
      .from('financial_transactions')
      .select('*');

    // Aplicar filtro de segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      queryTransactions = queryTransactions.eq('segment_id', segmentId);
    }
    // Se não há filtro de segmento, buscar todas (incluindo NULL)

    // Aplicar filtros de data se fornecidos
    if (dateStart) {
      queryTransactions = queryTransactions.gte('date', dateStart);
    }
    if (dateEnd) {
      queryTransactions = queryTransactions.lte('date', dateEnd);
    }

    queryTransactions = queryTransactions.order('date', { ascending: false });

    const { data: pluggyTransactions, error: transactionsError } = await queryTransactions;

    if (transactionsError) {
      console.warn('⚠️ Erro ao buscar transações Pluggy (não crítico):', transactionsError);
    }

    // Converter transações Pluggy para formato de documentos financeiros
    // IMPORTANTE: Para cada transação Pluggy, buscar ou criar documento em financial_documents
    // e usar o UUID do documento como id (não o ID numérico da transação)
    const convertedTransactions = await Promise.all((pluggyTransactions || []).map(async (tx: any) => {
      // Garantir que sempre tenha pluggy_id (se não tiver, não é Pluggy)
      const pluggyId = tx.pluggy_id || tx.external_id;
      
      if (!pluggyId) {
        console.warn('⚠️ Transação sem pluggy_id, ignorando:', tx.id);
        return null;
      }
      
      // Buscar documento existente em financial_documents usando doc_no
      const { data: existingDoc, error: docError } = await supabaseAdmin
        .from('financial_documents')
        .select('*')
        .eq('doc_no', pluggyId)
        .eq('is_deleted', false)
        .single();
      
      let docId: string;
      let docData: any;
      
      if (!docError && existingDoc) {
        // Documento já existe, usar o UUID dele
        docId = existingDoc.id;
        docData = existingDoc;
        console.log(`✅ Documento encontrado para transação Pluggy ${tx.id}: ${docId}`);
      } else {
        // Criar novo documento em financial_documents para esta transação
        const newDoc = {
          partner_id: null,
          direction: tx.direction || (tx.type === 'receita' ? 'receivable' : 'payable'),
          doc_no: pluggyId,
          issue_date: tx.date,
          due_date: tx.date,
          amount: Math.abs(Number(tx.amount) || 0),
          balance: Math.abs(Number(tx.amount) || 0),
          status: 'open',
          category_id: null,
          segment_id: tx.segment_id,
          description: tx.description || 'Transação Pluggy',
          payment_method: 'PIX',
          notes: `Importado da Pluggy - ${tx.institution || 'Banco'} - ${tx.category || ''}`,
          payment_method_id: null
        };
        
        const { data: createdDoc, error: createError } = await supabaseAdmin
          .from('financial_documents')
          .insert(newDoc)
          .select()
          .single();
        
        if (createError || !createdDoc) {
          console.error(`❌ Erro ao criar documento para transação ${tx.id}:`, createError);
          return null;
        }
        
        docId = createdDoc.id;
        docData = createdDoc;
        console.log(`✅ Documento criado para transação Pluggy ${tx.id}: ${docId}`);
      }
      
      return {
        id: docId, // SEMPRE UUID de financial_documents
        partner_id: docData.partner_id,
        direction: docData.direction,
        doc_no: docData.doc_no,
        issue_date: docData.issue_date,
        due_date: docData.due_date,
        amount: docData.amount,
        balance: docData.balance,
        status: docData.status,
        category_id: docData.category_id,
        segment_id: docData.segment_id,
        description: docData.description,
        payment_method: docData.payment_method,
        notes: docData.notes,
        created_at: docData.created_at,
        updated_at: docData.updated_at,
        deleted_at: docData.deleted_at,
        is_deleted: docData.is_deleted || false,
        payment_method_id: docData.payment_method_id,
        partner: docData.partner || null,
        payment_method_data: docData.payment_method_data || null,
        _source: 'pluggy', // SEMPRE 'pluggy' para transações da tabela financial_transactions
        pluggy_id: pluggyId, // SEMPRE preenchido para transações Pluggy
        account_id: tx.account_id,
        institution: tx.institution
      };
    }));
    
    // Filtrar nulls (transações sem pluggy_id ou com erro ao criar documento)
    const validConvertedTransactions = convertedTransactions.filter((tx: any) => tx !== null);

    if (financialDocsError) {
      console.error('❌ Erro ao buscar documentos financeiros:', financialDocsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar documentos financeiros',
          details: financialDocsError.message
        },
        { status: 500 }
      );
    }

    // Combinar documentos e transações Pluggy convertidas
    // Marcar documentos manuais: se data <= 29/10/2025 OU se não tem pluggy_id
    const allDocuments = [
      ...(financialDocuments || []).map((doc: any) => {
        const issueDate = doc.issue_date;
        const isManual = !doc.pluggy_id && (!issueDate || issueDate <= '2025-10-29');
        return { ...doc, _source: isManual ? 'manual' : (doc._source || 'manual') };
      }),
      ...validConvertedTransactions
    ];

    // Ordenar por data (mais recente primeiro)
    allDocuments.sort((a: any, b: any) => {
      const dateA = new Date(a.issue_date || a.date || 0).getTime();
      const dateB = new Date(b.issue_date || b.date || 0).getTime();
      return dateB - dateA;
    });

    // Aplicar paginação
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDocuments = allDocuments.slice(startIndex, endIndex);

    const total = allDocuments.length;
    console.log('📊 Documentos financeiros encontrados:', financialDocuments?.length || 0);
    console.log('📊 Transações Pluggy encontradas:', pluggyTransactions?.length || 0);
    console.log('📊 Total combinado:', total);
    console.log('📊 Documentos paginados:', paginatedDocuments?.length || 0);

    const response = {
      success: true,
      financialDocuments: paginatedDocuments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };

    console.log('📤 Resposta da API:', {
      success: response.success,
      totalDocuments: response.financialDocuments?.length || 0,
      pagination: response.pagination
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erro na API financial-documents:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('💰 Criando novo documento financeiro:', body);

    // Mapear status para valores aceitos pela constraint do banco
    const mappedBody = {
      ...body,
      status: body.status === 'pending' ? 'paid' : body.status || 'paid',
      direction: body.direction || 'receivable'
    };

    // Inserir na tabela financial_documents
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
      console.error('❌ Erro ao criar documento financeiro:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao criar documento financeiro',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Criar log de auditoria
    await createAuditLog(
      'CREATE',
      'financial_documents',
      data.id,
      null,
      { 
        description: data.description, 
        amount: data.amount, 
        direction: data.direction,
        status: data.status 
      },
      null,
      'admin@erppro.com'
    );

    return NextResponse.json({
      success: true,
      document: data
    });

  } catch (error) {
    console.error('❌ Erro ao criar documento financeiro:', error);
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
