import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🏷️ API Route GET /api/segments/[id]:', id);
    
    const { data, error } = await supabaseAdmin
      .from('segments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.log('❌ Segmento não encontrado:', { id, error });
      return NextResponse.json(
        { error: 'Segmento não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      segment: data
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar segmento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🏷️ [SEGMENT UPDATE] Iniciando atualização');
    console.log('🔍 [SEGMENT UPDATE] id:', id);
    
    const body = await request.json();
    console.log('📥 Payload recebido:', body);
    
    // Remover campos que não existem na tabela segments
    const { status, ...cleanBody } = body;
    
    // Normalizar o payload (apenas campos válidos: name, description)
    const normalizedBody: { name?: string; description?: string } = {};
    if (cleanBody.name !== undefined) normalizedBody.name = cleanBody.name;
    if (cleanBody.description !== undefined) normalizedBody.description = cleanBody.description;

    console.log('🧹 Payload normalizado:', normalizedBody);
    
    const { data, error } = await supabaseAdmin
      .from('segments')
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
      segment: data
    });
    
  } catch (error) {
    console.error('❌ Erro na atualização de segmento:', error);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🏷️ API Route DELETE /api/segments/[id]:', id);
    
    const { data, error } = await supabaseAdmin
      .from('segments')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.log('❌ Erro ao deletar segmento:', { id, error });
      return NextResponse.json(
        { error: 'Erro ao deletar segmento' },
        { status: 500 }
      );
    }

    console.log('✅ Segmento deletado:', data);
    return NextResponse.json({
      success: true,
      message: 'Segmento deletado com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro na exclusão de segmento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
