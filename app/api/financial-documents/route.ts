import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page') || '1';
    const pageSizeParam = searchParams.get('pageSize') || '20';
    
    // Validar e converter parâmetros de paginação
    const page = isNaN(parseInt(pageParam)) ? 1 : Math.max(1, parseInt(pageParam));
    const pageSize = isNaN(parseInt(pageSizeParam)) ? 20 : Math.max(1, Math.min(100, parseInt(pageSizeParam)));
    const segmentId = searchParams.get('segment_id');

    console.log('💰 Financial documents API request:', { page, pageSize, segmentId });

    // Construir filtros baseados no segmento
    const segmentFilter = segmentId && segmentId !== 'null' && segmentId !== '0' 
      ? { segment_id: segmentId } 
      : {};

    // Buscar documentos financeiros da tabela financial_documents
    const { data: financialDocuments, error: financialDocsError } = await supabaseAdmin
      .from('financial_documents')
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `)
      .match(segmentFilter)
      .order('created_at', { ascending: false });

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

    // Aplicar paginação
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDocuments = (financialDocuments || []).slice(startIndex, endIndex);

    console.log('📊 Documentos financeiros encontrados:', financialDocuments?.length || 0);
    console.log('📊 Documentos paginados:', paginatedDocuments?.length || 0);

    const response = {
      success: true,
      financialDocuments: paginatedDocuments,
      pagination: {
        page,
        pageSize,
        total: financialDocuments?.length || 0,
        totalPages: Math.ceil((financialDocuments?.length || 0) / pageSize)
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
