import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('🏭 [SUPPLIER UPDATE] Iniciando atualização');
    console.log('🔍 [SUPPLIER UPDATE] id:', id);
    console.log('📥 Payload recebido:', JSON.stringify(body, null, 2));
    console.log('🔍 Campos específicos:');
    console.log('  - ramo_atividade (profissao):', body.profissao);
    console.log('  - segment_id:', body.segment_id);

    // Mapear status corretamente - manter os valores originais
    const statusMap: Record<string, string> = {
      'ativo': 'ativo',
      'inativo': 'inativo',
      'active': 'ativo',
      'inactive': 'inativo'
    };

    // Normalizar o payload - incluir apenas campos não-null para evitar constraint violations
    const normalizedBody: any = {
      status: body.status ? statusMap[body.status] || 'ativo' : 'ativo'
    };

    // Incluir apenas campos que não são null para evitar constraint violations
    if (body.name !== null && body.name !== undefined) normalizedBody.name = body.name;
    if (body.tax_id !== null && body.tax_id !== undefined) normalizedBody.tax_id = body.tax_id;
    if (body.email !== null && body.email !== undefined) normalizedBody.email = body.email;
    if (body.phone !== null && body.phone !== undefined) normalizedBody.phone = body.phone;
    if (body.address !== null && body.address !== undefined) normalizedBody.address = body.address;
    if (body.city !== null && body.city !== undefined) normalizedBody.city = body.city;
    if (body.state !== null && body.state !== undefined) normalizedBody.state = body.state;
    if (body.zip_code !== null && body.zip_code !== undefined) normalizedBody.zip_code = body.zip_code;
    if (body.notes !== null && body.notes !== undefined) normalizedBody.notes = body.notes;
    if (body.segment_id !== null && body.segment_id !== undefined) normalizedBody.segment_id = body.segment_id;
    if (body.tipo_pessoa !== null && body.tipo_pessoa !== undefined) normalizedBody.tipo_pessoa = body.tipo_pessoa;
    if (body.numero !== null && body.numero !== undefined) normalizedBody.numero = body.numero;
    if (body.complemento !== null && body.complemento !== undefined) normalizedBody.complemento = body.complemento;
    if (body.bairro !== null && body.bairro !== undefined) normalizedBody.bairro = body.bairro;
    if (body.profissao !== null && body.profissao !== undefined) normalizedBody.profissao = body.profissao;

    console.log('🧹 Payload normalizado:', normalizedBody);

    const { data, error } = await supabaseAdmin
      .from('partners')
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
      supplier: data
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar fornecedor:', error);
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
    console.log('🏭 Deletando fornecedor:', { id });

    // Primeiro deletar o role
    const { error: roleError } = await supabaseAdmin
      .from('partner_roles')
      .delete()
      .eq('partner_id', id);

    if (roleError) {
      console.error('❌ Erro ao deletar role do fornecedor:', roleError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar role do fornecedor',
          details: roleError.message
        },
        { status: 500 }
      );
    }

    // Depois deletar o partner
    const { error } = await supabaseAdmin
      .from('partners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar fornecedor:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar fornecedor',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fornecedor deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar fornecedor:', error);
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
