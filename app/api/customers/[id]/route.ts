import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('👥 [CUSTOMER GET] Buscando cliente:', id);

    const { data: customer, error } = await supabaseAdmin
      .from('partners')
      .select(`
        *,
        partner_roles!inner(role)
      `)
      .eq('id', id)
      .eq('partner_roles.role', 'customer')
      .single();

    if (error) {
      console.error('❌ Erro ao buscar cliente:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cliente não encontrado',
          details: error.message
        },
        { status: 404 }
      );
    }

    if (!customer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cliente não encontrado'
        },
        { status: 404 }
      );
    }

    console.log('✅ Cliente encontrado:', customer.name);
    return NextResponse.json({
      success: true,
      customer: customer
    });

  } catch (error) {
    console.error('❌ Erro ao buscar cliente:', error);
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    console.log('👥 [CUSTOMER UPDATE] Iniciando atualização');
    console.log('🔍 [CUSTOMER UPDATE] id:', id);
    console.log('📥 Payload recebido:', body);

    // Mapear status para valores aceitos pela constraint do banco
    // Permitir alternância entre ativo e inativo
    const statusMap: Record<string, string> = {
      'ativo': 'active',
      'inativo': 'inactive',
      'active': 'active',
      'inactive': 'inactive'
    };

    // Normalizar o payload - APENAS campos que não são null
    const normalizedBody: any = {
      status: body.status ? statusMap[body.status] || 'active' : 'active'
    };

    // Adicionar apenas campos que não são null para evitar constraint violations
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
    
    // Campos adicionais do formulário completo
    if (body.rg !== null && body.rg !== undefined) normalizedBody.rg = body.rg;
    if (body.data_nascimento !== null && body.data_nascimento !== undefined) normalizedBody.data_nascimento = body.data_nascimento;
    if (body.estado_civil !== null && body.estado_civil !== undefined) normalizedBody.estado_civil = body.estado_civil;
    if (body.profissao !== null && body.profissao !== undefined) normalizedBody.profissao = body.profissao;
    if (body.empresa !== null && body.empresa !== undefined) normalizedBody.empresa = body.empresa;
    if (body.cargo !== null && body.cargo !== undefined) normalizedBody.cargo = body.cargo;
    if (body.data_admissao !== null && body.data_admissao !== undefined) normalizedBody.data_admissao = body.data_admissao;
    if (body.telefone_comercial !== null && body.telefone_comercial !== undefined) normalizedBody.telefone_comercial = body.telefone_comercial;
    if (body.celular !== null && body.celular !== undefined) normalizedBody.celular = body.celular;
    if (body.numero !== null && body.numero !== undefined) normalizedBody.numero = body.numero;
    if (body.complemento !== null && body.complemento !== undefined) normalizedBody.complemento = body.complemento;
    if (body.bairro !== null && body.bairro !== undefined) normalizedBody.bairro = body.bairro;
    if (body.tipo_imovel !== null && body.tipo_imovel !== undefined) normalizedBody.tipo_imovel = body.tipo_imovel;
    if (body.possui_patrimonio !== null && body.possui_patrimonio !== undefined) normalizedBody.possui_patrimonio = body.possui_patrimonio;
    if (body.valor_patrimonio !== null && body.valor_patrimonio !== undefined) normalizedBody.valor_patrimonio = body.valor_patrimonio;
    if (body.descricao_patrimonio !== null && body.descricao_patrimonio !== undefined) normalizedBody.descricao_patrimonio = body.descricao_patrimonio;
    if (body.data_cadastro !== null && body.data_cadastro !== undefined) normalizedBody.data_cadastro = body.data_cadastro;
    if (body.responsavel_cadastro !== null && body.responsavel_cadastro !== undefined) normalizedBody.responsavel_cadastro = body.responsavel_cadastro;
    if (body.observacoes !== null && body.observacoes !== undefined) normalizedBody.observacoes = body.observacoes;

    console.log('🧹 Payload normalizado (apenas campos não-null):', normalizedBody);

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
      customer: data
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    console.log('👥 Deletando cliente:', { id });

    // Primeiro deletar o role
    const { error: roleError } = await supabaseAdmin
      .from('partner_roles')
      .delete()
      .eq('partner_id', id);

    if (roleError) {
      console.error('❌ Erro ao deletar role do cliente:', roleError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar role do cliente',
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
      console.error('❌ Erro ao deletar cliente:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar cliente',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar cliente:', error);
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
