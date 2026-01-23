import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';
import { createAuditLog } from '@/lib/createAuditLog';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { id } = await params;
    console.log('👤 API Route PUT /api/users/[id]');
    console.log('🔍 ID do usuário:', id);
    
    const body = await request.json();
    console.log('📝 Dados recebidos:', body);
    
    // Preparar dados para atualização
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.segment_id !== undefined) {
      // Converter string vazia para null para campos integer
      updateData.segment_id = body.segment_id === '' ? null : body.segment_id;
    }
    if (body.password !== undefined && body.password.trim() !== '') {
      updateData.password = body.password;
    }
    
    console.log('🧹 Dados para atualização:', updateData);
    
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao atualizar usuário',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Usuário atualizado:', data);
    
    // Criar log de auditoria
    await createAuditLog(
      'UPDATE',
      'users',
      data.id,
      null, // TODO: capturar dados antigos
      { 
        name: data.name, 
        email: data.email, 
        role: data.role,
        status: data.status 
      },
      null,
      'admin@erppro.com'
    );
    
    return NextResponse.json({
      success: true,
      user: data
    });
    
  } catch (error) {
    console.error('❌ Erro na atualização de usuário:', error);
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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { id } = await params;
    console.log('👤 API Route DELETE /api/users/[id]');
    console.log('🔍 ID do usuário:', id);
    
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao excluir usuário:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao excluir usuário',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Usuário excluído:', id);
    
    // Criar log de auditoria
    await createAuditLog(
      'DELETE',
      'users',
      id,
      { id: id }, // Dados antigos (apenas ID)
      null,
      null,
      'admin@erppro.com'
    );
    
    return NextResponse.json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro na exclusão de usuário:', error);
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
