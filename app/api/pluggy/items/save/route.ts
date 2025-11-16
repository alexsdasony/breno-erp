import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getPluggyItem } from '@/lib/pluggyClient';

interface SaveItemBody {
  itemId: string;
  userId: string;
  segmentId?: string;
}

/**
 * POST /api/pluggy/items/save
 * Salva um item (conexão) da Pluggy associado ao usuário e segmento
 */
export async function POST(request: NextRequest) {
  try {
    console.log('💾 Salvando item Pluggy');

    const body: SaveItemBody = await request.json();

    if (!body.itemId || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'itemId e userId são obrigatórios'
        },
        { status: 400 }
      );
    }

    // Buscar dados do item na Pluggy
    let pluggyItem;
    try {
      pluggyItem = await getPluggyItem(body.itemId);
    } catch (error) {
      console.error('❌ Erro ao buscar item na Pluggy:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Item não encontrado na Pluggy'
        },
        { status: 404 }
      );
    }

    // Verificar se já existe registro deste item
    const { data: existing } = await supabaseAdmin
      .from('pluggy_items')
      .select('*')
      .eq('item_id', body.itemId)
      .single();

    const itemData = {
      item_id: body.itemId,
      user_id: body.userId,
      segment_id: body.segmentId || null,
      connector_id: pluggyItem.connector?.id || null,
      connector_name: pluggyItem.connector?.name || null,
      status: pluggyItem.status || 'UPDATING',
      execution_status: pluggyItem.executionStatus || 'CREATED',
      error: pluggyItem.error ? JSON.stringify(pluggyItem.error) : null,
      metadata: pluggyItem.metadata || {},
      last_sync_at: null, // Será atualizado na primeira sincronização
      created_at: existing?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Upsert (inserir ou atualizar)
    const { data, error } = await supabaseAdmin
      .from('pluggy_items')
      .upsert(itemData, {
        onConflict: 'item_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar item Pluggy:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao salvar item',
          details: error.message
        },
        { status: 500 }
      );
    }

    console.log('✅ Item Pluggy salvo:', {
      itemId: body.itemId,
      userId: body.userId,
      status: pluggyItem.status
    });

    return NextResponse.json({
      success: true,
      item: data
    });
  } catch (error) {
    console.error('❌ Erro ao salvar item Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

