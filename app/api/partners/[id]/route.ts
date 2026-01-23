import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    console.log('🤝 [PARTNER GET] Buscando parceiro:', id);
    
    const { data, error } = await supabaseAdmin
      .from('partners')
      .select(`
        *,
        partner_roles(role)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar parceiro:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Parceiro não encontrado',
          details: error.message
        },
        { status: 404 }
      );
    }

    console.log('✅ Parceiro encontrado:', data);
    return NextResponse.json({
      success: true,
      partner: data
    });

  } catch (error) {
    console.error('❌ Erro ao buscar parceiro:', error);
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
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    const body = await request.json();
    console.log('🤝 [PARTNER UPDATE] Iniciando atualização');
    console.log('🔍 [PARTNER UPDATE] id:', id);
    console.log('📥 Payload recebido:', body);

    // Mapear status para valores aceitos pela constraint do banco
    const statusMap: Record<string, string> = {
      'ativo': 'active',
      'inativo': 'active',
      'active': 'active',
      'inactive': 'active'
    };

    // Normalizar o payload
    const normalizedBody = {
      ...body,
      status: body.status ? statusMap[body.status] || 'active' : 'active'
    };

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
      partner: data
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar parceiro:', error);
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
    const supabaseAdmin = getSupabaseAdmin();
    const { id } = await params;
    console.log('🤝 [PARTNER DELETE] Deletando parceiro:', id);

    // Primeiro deletar os roles
    const { error: roleError } = await supabaseAdmin
      .from('partner_roles')
      .delete()
      .eq('partner_id', id);

    if (roleError) {
      console.error('❌ Erro ao deletar roles do parceiro:', roleError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar roles do parceiro',
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
      console.error('❌ Erro ao deletar parceiro:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao deletar parceiro',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Parceiro deletado com sucesso');
    return NextResponse.json({
      success: true,
      message: 'Parceiro deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar parceiro:', error);
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
