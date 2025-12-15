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

// Validação de data
function isValidDate(dateStr: string | null): boolean {
  if (!dateStr || typeof dateStr !== 'string' || dateStr.trim() === '') return false;
  if (dateStr.includes('undefined')) return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return false;
  if (year < 1900 || year > 2100) return false;
  if (month < 1 || month > 12) return false;
  
  const lastDayOfMonth = new Date(year, month, 0).getDate();
  return day >= 1 && day <= lastDayOfMonth;
}

// Função para aplicar filtros diretamente na query
function applyFilters(query: any, segmentId: string | null, dateStart: string | null, dateEnd: string | null) {
  // 1. Filtro de segmento
  if (segmentId && segmentId !== 'null' && segmentId !== '0') {
    query = query.eq('segment_id', segmentId);
    console.log('✅ [Listagem] Filtro de segmento aplicado:', segmentId);
  }

  // 2. Filtros de data - USAR APENAS issue_date (COLUNA OFICIAL)
  if (dateStart) {
    query = query.gte('issue_date', dateStart);
    console.log('✅ [Listagem] Filtro de data inicial aplicado na coluna issue_date:', dateStart);
  }
  if (dateEnd) {
    query = query.lte('issue_date', dateEnd);
    console.log('✅ [Listagem] Filtro de data final aplicado na coluna issue_date:', dateEnd);
  }
  
  if (dateStart || dateEnd) {
    console.log('📅 [Listagem] Coluna oficial para filtro de data: issue_date');
  }

  return query;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page') || '1';
    const pageSizeParam = searchParams.get('pageSize') || '20';
    
    // Validar e converter parâmetros de paginação
    const page = isNaN(parseInt(pageParam)) ? 1 : Math.max(1, parseInt(pageParam));
    // Para exportação (pageSize >= 1000), permitir até 100000 registros
    // Para listagem normal, limitar a 100 registros
    const requestedPageSize = isNaN(parseInt(pageSizeParam)) ? 20 : parseInt(pageSizeParam);
    const pageSize = requestedPageSize >= 1000 
      ? Math.min(100000, requestedPageSize) // Exportação: até 100k registros
      : Math.max(1, Math.min(100, requestedPageSize)); // Listagem normal: até 100 registros
    const segmentId = searchParams.get('segment_id');
    const dateStartParam = searchParams.get('dateStart');
    const dateEndParam = searchParams.get('dateEnd');

    console.log('GET financial-documents: listagem simples, sem sync');
    console.log('💰 Financial documents API request:', { page, pageSize, segmentId, dateStartParam, dateEndParam });
    console.log('📅 [Listagem] Coluna oficial para filtro de data: issue_date');
    
    // LOG EXPLÍCITO DE PROPAGAÇÃO DE PARÂMETROS
    if (dateStartParam) {
      console.log('✅ DATE FILTER RECEIVED - dateStart:', dateStartParam);
    } else {
      console.log('❌ NO DATE FILTER RECEIVED - dateStart: null ou undefined');
    }
    if (dateEndParam) {
      console.log('✅ DATE FILTER RECEIVED - dateEnd:', dateEndParam);
    } else {
      console.log('❌ NO DATE FILTER RECEIVED - dateEnd: null ou undefined');
    }

    // Validar datas - RETORNAR ERRO 400 SE INVÁLIDAS
    if (dateStartParam && !isValidDate(dateStartParam)) {
      console.error('❌ [Listagem] Data inicial inválida recebida:', dateStartParam);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data inicial inválida',
          details: `Formato esperado: YYYY-MM-DD. Recebido: ${dateStartParam}`
        },
        { status: 400 }
      );
    }
    if (dateEndParam && !isValidDate(dateEndParam)) {
      console.error('❌ [Listagem] Data final inválida recebida:', dateEndParam);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data final inválida',
          details: `Formato esperado: YYYY-MM-DD. Recebido: ${dateEndParam}`
        },
        { status: 400 }
      );
    }

    const dateStart = dateStartParam && isValidDate(dateStartParam) ? dateStartParam : null;
    const dateEnd = dateEndParam && isValidDate(dateEndParam) ? dateEndParam : null;

    // CRIAR UMA ÚNICA QUERY COM COUNT E LISTAGEM
    const selectFields = `
      *,
      partner:partners(name, id),
      payment_method_data:payment_methods(name, id)
    `;
    
    let query = supabaseAdmin
      .from('financial_documents')
      .select(selectFields, { count: 'exact' })
      .eq('is_deleted', false);

    // APLICAR FILTROS DIRETAMENTE NA MESMA QUERY
    query = applyFilters(query, segmentId, dateStart, dateEnd);

    // Aplicar order
    query = query.order('issue_date', { ascending: false });
    
    // Para exportação (pageSize >= 1000), não aplicar range (buscar todos)
    // Para listagem normal, aplicar range de paginação
    if (pageSize < 1000) {
      const from = (page - 1) * pageSize;
      const to = page * pageSize - 1;
      query = query.range(from, to);
    }

    console.log('QUERY FINAL COM FILTROS:', query);
    console.log('🔍 [Listagem] Executando query com count e listagem na mesma chamada...');
    
    // EXECUTAR UMA ÚNICA QUERY QUE RETORNA COUNT E DATA
    const { data: financialDocuments, count: totalCount, error: queryError } = await query;

    if (queryError) {
      console.error('❌ Erro ao buscar documentos financeiros:', queryError);
      // Detectar erro de data inválida do PostgreSQL (código 22008)
      const isDateError = queryError.code === '22008' || 
                         queryError.message?.includes('date') || 
                         queryError.message?.includes('invalid input syntax');
      
      if (isDateError) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Data inválida',
            details: `Erro ao processar filtro de data: ${queryError.message}`
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar documentos financeiros',
          details: queryError.message
        },
        { status: 400 }
      );
    }

    // Processar documentos
    const allDocuments = (financialDocuments || []).map((doc: any) => {
      const hasPluggyId = doc.doc_no && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doc.doc_no);
      const issueDate = doc.issue_date;
      const isManual = !hasPluggyId && (!issueDate || issueDate <= '2025-10-29');
      return { 
        ...doc, 
        _source: hasPluggyId ? 'pluggy' : (isManual ? 'manual' : (doc._source || 'manual'))
      };
    });

    const total = totalCount || 0;
    console.log('📊 [Listagem] Total de documentos APÓS filtros (do count):', total);
    console.log('📊 [Listagem] Documentos retornados (do data):', allDocuments.length);
    
    // VALIDAÇÃO: Se page = 1, count deve ser >= data.length
    if (page === 1 && total < allDocuments.length) {
      console.error('⚠️ [Listagem] INCONSISTÊNCIA: count < data.length', { total, dataLength: allDocuments.length });
    }

    const response = {
      success: true,
      financialDocuments: allDocuments,
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
    
    // Detectar erro de data inválida do PostgreSQL
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isDateError = errorMessage.includes('22008') || 
                       errorMessage.includes('date') || 
                       errorMessage.includes('invalid input syntax') ||
                       errorMessage.includes('date/time field value out of range');
    
    if (isDateError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Data inválida',
          details: `Erro ao processar filtro de data: ${errorMessage}`
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar requisição',
        details: errorMessage
      },
      { status: 400 }
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
