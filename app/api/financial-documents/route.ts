import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    console.log('💰 Financial documents API request:', { page, pageSize });

    // Buscar documentos financeiros (contas a pagar e receber)
    const [
      { data: payables, error: payablesError },
      { data: receivables, error: receivablesError }
    ] = await Promise.all([
      supabase
        .from('accounts_payable')
        .select('*')
        .order('created_at', { ascending: false }),
      
      supabase
        .from('accounts_receivable')
        .select('*')
        .order('created_at', { ascending: false })
        .then(result => result.error ? { data: [], error: null } : result)
    ]);

    if (payablesError) console.error('❌ Erro ao buscar contas a pagar:', payablesError);
    if (receivablesError) console.error('❌ Erro ao buscar contas a receber:', receivablesError);

    // Combinar documentos financeiros
    const financialDocuments = [
      ...(payables || []).map(p => ({ ...p, type: 'payable' })),
      ...(receivables || []).map(r => ({ ...r, type: 'receivable' }))
    ];

    // Aplicar paginação
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedDocuments = financialDocuments.slice(startIndex, endIndex);

    console.log('📊 Documentos financeiros encontrados:', financialDocuments.length);

    return NextResponse.json({
      success: true,
      documents: paginatedDocuments,
      pagination: {
        page,
        pageSize,
        total: financialDocuments.length,
        totalPages: Math.ceil(financialDocuments.length / pageSize)
      }
    });

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

    // Determinar se é conta a pagar ou receber
    const table = body.type === 'receivable' ? 'accounts_receivable' : 'accounts_payable';
    
    const { data, error } = await supabase
      .from(table)
      .insert(body)
      .select()
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
