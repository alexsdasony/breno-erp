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
    console.log('🏷️ API Route PUT /api/segments/[id]:', id);
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);
    
    const { data, error } = await supabaseAdmin
      .from('segments')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.log('❌ Erro ao atualizar segmento:', { id, error });
      return NextResponse.json(
        { error: 'Erro ao atualizar segmento' },
        { status: 500 }
      );
    }

    console.log('✅ Segmento atualizado:', data);
    return NextResponse.json({
      success: true,
      segment: data
    });
    
  } catch (error) {
    console.error('❌ Erro na atualização de segmento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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
