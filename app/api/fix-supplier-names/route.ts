import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    console.log('🔍 Buscando fornecedores com nome "Fornecedor"...');

    // Buscar fornecedores que tenham o nome exatamente como "Fornecedor"
    const { data: suppliers, error } = await supabaseAdmin
      .from('partners')
      .select('id, name, tax_id, created_at, updated_at')
      .eq('name', 'Fornecedor')
      .eq('is_deleted', false);

    if (error) {
      console.error('❌ Erro ao buscar fornecedores:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar fornecedores' },
        { status: 500 }
      );
    }

    console.log(`✅ Encontrados ${suppliers?.length || 0} fornecedores com nome "Fornecedor"`);

    return NextResponse.json({
      success: true,
      count: suppliers?.length || 0,
      suppliers: suppliers || []
    });

  } catch (error) {
    console.error('❌ Erro na API:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const { id, newName } = body;

    if (!id || !newName) {
      return NextResponse.json(
        { success: false, error: 'ID e novo nome são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`🔄 Atualizando fornecedor ${id} para: ${newName}`);

    // Atualizar o nome do fornecedor
    const { data, error } = await supabaseAdmin
      .from('partners')
      .update({ name: newName })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar fornecedor:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar fornecedor' },
        { status: 500 }
      );
    }

    console.log('✅ Fornecedor atualizado com sucesso');

    return NextResponse.json({
      success: true,
      supplier: data
    });

  } catch (error) {
    console.error('❌ Erro na API:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

