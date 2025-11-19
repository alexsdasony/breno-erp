import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const segmentId = searchParams.get('segment_id');
    
    // Calcular offset para paginação
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    let query = supabase
      .from('cost_centers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    
    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '') {
      query = query.eq('segment_id', segmentId);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('❌ Erro ao buscar centros de custo:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao buscar centros de custo',
          details: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      costCenters: data || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: count ? Math.ceil(count / pageSize) : 0
    });
    
  } catch (error: any) {
    console.error('❌ Erro na API cost-centers GET:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Mapear e validar campos permitidos
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
    } = {
      name: body?.name,
      segment_id: body?.segment_id ?? null,
      description: body?.description ?? null,
      budget: typeof body?.budget === 'number' ? body.budget : (body?.budget ? Number(body.budget) : 0),
      status: allowedStatus.includes(body?.status) ? body.status : 'active',
      manager_id: body?.manager_id ?? null,
      type: allowedTypes.includes(body?.type) ? body.type : (body?.type === null || body?.type === '') ? null : null,
    };
    
    // Validação básica
    if (!payload.name || typeof payload.name !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campo obrigatório ausente: name' 
        },
        { status: 400 }
      );
    }
    
    if (payload.segment_id && !isUuid(payload.segment_id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'segment_id inválido' 
        },
        { status: 400 }
      );
    }
    
    if (payload.manager_id && !isUuid(payload.manager_id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'manager_id inválido' 
        },
        { status: 400 }
      );
    }
    
    if (payload.budget !== undefined && (isNaN(payload.budget) || payload.budget < 0)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'budget inválido' 
        },
        { status: 400 }
      );
    }
    
    if (payload.type !== null && payload.type !== undefined && !allowedTypes.includes(payload.type)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'type inválido. Deve ser "despesa" ou "receita"' 
        },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from('cost_centers')
      .insert(payload)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Erro ao criar centro de custo:', error);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao criar centro de custo',
          details: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      costCenter: data,
      message: 'Centro de Custo criado com sucesso'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('❌ Erro na API cost-centers POST:', error);
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

