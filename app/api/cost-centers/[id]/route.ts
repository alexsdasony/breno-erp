import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabase
      .from('cost_centers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Centro de Custo não encontrado' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      costCenter: data
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API cost-centers GET [id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const allowedStatus = ['active', 'inactive'] as const;
    const allowedTypes = ['despesa', 'receita'] as const;
    const isUuid = (v: any) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
    
    const payload: {
      name?: string;
      segment_id?: string | null;
      description?: string | null;
      budget?: number;
      status?: typeof allowedStatus[number];
      manager_id?: string | null;
      type?: typeof allowedTypes[number] | null;
    } = {};
    
    if (typeof body?.name === 'string') payload.name = body.name;
    if (body?.segment_id !== undefined) payload.segment_id = body.segment_id ?? null;
    if (body?.description !== undefined) payload.description = body.description ?? null;
    
    if (body?.budget !== undefined) {
      const b = typeof body.budget === 'number' ? body.budget : Number(body.budget);
      if (isNaN(b) || b < 0) {
        return NextResponse.json(
          { 
            success: false,
            error: 'budget inválido' 
          },
          { status: 400 }
        );
      }
      payload.budget = b;
    }
    
    if (body?.status !== undefined) {
      if (!allowedStatus.includes(body.status)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'status inválido. Use active|inactive' 
          },
          { status: 400 }
        );
      }
      payload.status = body.status;
    }
    
    if (body?.manager_id !== undefined) {
      if (body.manager_id !== null && !isUuid(body.manager_id)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'manager_id inválido' 
          },
          { status: 400 }
        );
      }
      payload.manager_id = body.manager_id;
    }
    
    if (body?.type !== undefined) {
      if (body.type !== null && body.type !== '' && !allowedTypes.includes(body.type)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'type inválido. Deve ser "despesa" ou "receita"' 
          },
          { status: 400 }
        );
      }
      payload.type = body.type === null || body.type === '' ? null : body.type;
    }
    
    if (Object.keys(payload).length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Nenhum campo válido para atualizar' 
        },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('cost_centers')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      console.error('❌ Erro ao atualizar centro de custo:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Centro de Custo não encontrado',
          details: error?.message 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      costCenter: data,
      message: 'Centro de Custo atualizado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API cost-centers PUT [id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const { error } = await supabase
      .from('cost_centers')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Erro ao deletar centro de custo:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao deletar centro de custo',
          details: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Centro de Custo deletado com sucesso'
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API cost-centers DELETE [id]:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

