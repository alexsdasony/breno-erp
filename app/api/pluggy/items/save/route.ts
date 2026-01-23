import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';
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
    const supabaseAdmin = getSupabaseAdmin();
    console.log('💾 Salvando item Pluggy');

    const body: SaveItemBody = await request.json();

    // VALIDAÇÃO RIGOROSA: Garantir que itemId e userId sejam válidos
    if (!body.itemId || body.itemId === '' || body.itemId === 'null' || body.itemId === 'undefined' || typeof body.itemId !== 'string') {
      console.error('❌ itemId inválido recebido:', {
        itemId: body.itemId,
        tipo: typeof body.itemId,
        body_completo: body
      });
      return NextResponse.json(
        {
          success: false,
          error: `itemId inválido: ${JSON.stringify(body.itemId)}`
        },
        { status: 400 }
      );
    }

    // Validar formato UUID do itemId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(body.itemId)) {
      console.error('❌ itemId não é um UUID válido:', body.itemId);
      return NextResponse.json(
        {
          success: false,
          error: `itemId não é um UUID válido: ${body.itemId}`
        },
        { status: 400 }
      );
    }

    // IDs inválidos conhecidos que não devem ser salvos no banco
    const invalidItemIds = [
      'f892f7a3-1c7a-4875-b084-e8a376fa730f',
      '67a1f002-5ca8-4f01-97d4-b04fe87aa26a',
      '48c193bc-7276-4b53-9bf9-f91cd6a05fda'
    ];

    // Não salvar IDs inválidos conhecidos (mesmo que sejam UUIDs válidos)
    if (invalidItemIds.includes(body.itemId)) {
      console.warn(`⚠️ Tentativa de salvar item inválido conhecido ignorada: ${body.itemId}`);
      return NextResponse.json(
        {
          success: false,
          error: `Este item não deve ser salvo no banco (item inválido conhecido): ${body.itemId}`
        },
        { status: 400 }
      );
    }

    if (!body.userId || body.userId === '' || body.userId === 'null' || body.userId === 'undefined' || typeof body.userId !== 'string') {
      console.error('❌ userId inválido recebido:', {
        userId: body.userId,
        tipo: typeof body.userId
      });
      return NextResponse.json(
        {
          success: false,
          error: `userId inválido: ${JSON.stringify(body.userId)}`
        },
        { status: 400 }
      );
    }

    console.log('✅ Validação passou:', {
      itemId: body.itemId,
      userId: body.userId,
      itemIdValido: uuidRegex.test(body.itemId)
    });

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

    // VALIDAÇÃO FINAL: Garantir que item_id nunca seja null/undefined
    const finalItemId = body.itemId; // Já validado acima
    if (!finalItemId || finalItemId === '' || finalItemId === 'null' || finalItemId === 'undefined') {
      const errorMsg = `itemId inválido ao criar itemData: ${JSON.stringify(finalItemId)}`;
      console.error(`❌ ${errorMsg}`);
      return NextResponse.json(
        {
          success: false,
          error: errorMsg
        },
        { status: 500 }
      );
    }

    const itemData = {
      item_id: finalItemId, // Garantido válido pela validação acima
      user_id: body.userId, // Garantido válido pela validação acima
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

    console.log('💾 Salvando item no banco:', {
      item_id: itemData.item_id,
      user_id: itemData.user_id,
      connector_name: itemData.connector_name,
      status: itemData.status
    });

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


