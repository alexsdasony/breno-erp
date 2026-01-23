import { NextRequest, NextResponse } from 'next/server';
import { createPluggyItem, getPluggyItem, listPluggyConnectors } from '@/lib/pluggyClient';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

interface CreateItemBody {
  connector: string;
  credentials: Record<string, string>;
  metadata?: Record<string, unknown>;
  webhookUrl?: string;
  clientUserId?: string;
  userId?: string; // UUID do usuário para registrar no banco
  segmentId?: string; // UUID do segmento
  startSync?: boolean; // Iniciar sincronização automática após criar item (padrão: true)
}

/**
 * GET /api/pluggy/items?itemId=xxx
 * Busca um Item específico ou lista conectores se não passar itemId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const listConnectors = searchParams.get('listConnectors') === 'true';
    const country = searchParams.get('country');
    const name = searchParams.get('name');

    if (itemId) {
      console.log('🔍 Buscando Item Pluggy:', itemId);
      const item = await getPluggyItem(itemId);
      return NextResponse.json({
        success: true,
        item
      });
    }

    if (listConnectors) {
      console.log('📋 Listando conectores Pluggy');
      const connectors = await listPluggyConnectors({
        country: country || undefined,
        name: name || undefined
      });
      return NextResponse.json({
        success: true,
        ...connectors
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Informe itemId ou listConnectors=true'
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Erro ao buscar Item/Conectores Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pluggy/items
 * Cria um Item (conexão) diretamente via API e registra no banco
 * 
 * Opção B - Criar conexão programaticamente (sem widget)
 * 
 * Body:
 * {
 *   "connector": "bradesco",
 *   "credentials": { "username": "bnk100", "password": "combelvo" },
 *   "metadata": { "externalId": "user-123" },
 *   "userId": "uuid-do-usuario", // Obrigatório para registrar no banco
 *   "segmentId": "uuid-do-segmento", // Opcional
 *   "startSync": true // Inicia sincronização automática (padrão: true)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Criando Item Pluggy');

    const body: CreateItemBody = await request.json();

    if (!body.connector || !body.credentials) {
      return NextResponse.json(
        {
          success: false,
          error: 'connector e credentials são obrigatórios'
        },
        { status: 400 }
      );
    }

    // Criar item na Pluggy
    const item = await createPluggyItem({
      connector: body.connector,
      credentials: body.credentials,
      metadata: body.metadata,
      webhookUrl: body.webhookUrl,
      clientUserId: body.clientUserId
    });

    console.log('✅ Item Pluggy criado:', {
      id: item.id,
      connector: item.connector.name,
      status: item.status
    });

    // Registrar item no banco de dados (pluggy_items)
    let savedItem = null;
    if (body.userId) {
      try {
        const supabaseAdmin = getSupabaseAdmin();
        
        const itemData = {
          item_id: item.id,
          user_id: body.userId,
          segment_id: body.segmentId || null,
          connector_id: item.connector?.id || null,
          connector_name: item.connector?.name || null,
          status: item.status || 'UPDATING',
          execution_status: item.executionStatus || 'CREATED',
          error: item.error ? JSON.stringify(item.error) : null,
          metadata: item.metadata || {},
          last_sync_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error: saveError } = await supabaseAdmin
          .from('pluggy_items')
          .upsert(itemData, {
            onConflict: 'item_id',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (saveError) {
          console.warn('⚠️ Erro ao salvar item no banco (não crítico):', saveError);
        } else {
          savedItem = data;
          console.log('✅ Item registrado no banco:', item.id);
        }
      } catch (saveError) {
        console.warn('⚠️ Erro ao registrar item no banco (não crítico):', saveError);
      }
    } else {
      console.warn('⚠️ userId não fornecido, item não será registrado no banco');
    }

    // Iniciar sincronização automática se solicitado (padrão: true)
    let syncResult = null;
    if (body.startSync !== false) {
      try {
        console.log('🔄 Iniciando sincronização automática para item:', item.id);
        
        // Importar função de sincronização
        const { fetchPluggyTransactions } = await import('@/lib/pluggyClient');
        const supabaseAdmin = getSupabaseAdmin();
        const {
          inferInstitution,
          mapPluggyTypeToErp,
          mapPluggyTypeToDirection,
          resolveAccountId,
          resolveTransactionBalance,
          sanitizeDescription
        } = await import('@/lib/pluggyClient');
        
        type PluggyTransaction = import('@/lib/pluggyClient').PluggyTransaction;

        // Buscar transações dos últimos 30 dias
        const dateTo = new Date().toISOString().split('T')[0];
        const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const { transactions } = await fetchPluggyTransactions({
          itemId: item.id,
          dateFrom,
          dateTo,
          limit: 500
        });

        if (transactions.length > 0) {
          // Verificar duplicatas
          const pluggyIds = transactions.map((t) => t.id).filter(Boolean);
          const { data: existingRows } = await supabaseAdmin
            .from('financial_transactions')
            .select('pluggy_id, external_id')
            .in('pluggy_id', pluggyIds);

          const existingSet = new Set(
            (existingRows || [])
              .map((row) => row.pluggy_id || row.external_id)
              .filter(Boolean)
          );

          // Mapear transações
          // IMPORTANTE: Filtrar transações sem ID válido e duplicatas
          const records = transactions
            .filter((t) => t.id && typeof t.id === 'string' && t.id.trim().length > 0) // Garantir que tem ID válido
            .filter((t) => !existingSet.has(t.id)) // Filtrar duplicatas
            .map((transaction: PluggyTransaction) => {
              const account = resolveAccountId(transaction);
              const type = mapPluggyTypeToErp(transaction.type, transaction.amount);
              const direction = mapPluggyTypeToDirection(transaction.type, transaction.amount);
              const balance = resolveTransactionBalance(transaction);

              return {
                pluggy_id: transaction.id,
                external_id: transaction.id,
                item_id: item.id,
                account_id: account,
                date: transaction.date,
                description: sanitizeDescription(transaction.description),
                amount: Number(transaction.amount.toFixed(2)),
                type,
                direction,
                category: transaction.category || transaction.subcategory || null,
                status: transaction.status || 'POSTED',
                institution: inferInstitution(transaction),
                balance: balance != null ? Number(balance.toFixed(2)) : null,
                segment_id: body.segmentId || null,
                raw: transaction as unknown as Record<string, unknown>
              };
            });

          // Salvar transações
          if (records.length > 0) {
            const { error: upsertError } = await supabaseAdmin
              .from('financial_transactions')
              .upsert(records, { onConflict: 'pluggy_id' });

            if (!upsertError) {
              syncResult = {
                imported: records.length,
                total: transactions.length,
                success: true
              };
              console.log('✅ Sincronização automática concluída:', syncResult);

              // Atualizar last_sync_at do item
              if (savedItem) {
                await supabaseAdmin
                  .from('pluggy_items')
                  .update({ 
                    last_sync_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })
                  .eq('item_id', item.id);
              }
            } else {
              syncResult = {
                success: false,
                error: upsertError.message
              };
            }
          } else {
            syncResult = {
              imported: 0,
              total: transactions.length,
              success: true,
              message: 'Todas as transações já estavam sincronizadas'
            };
          }
        } else {
          syncResult = {
            imported: 0,
            total: 0,
            success: true,
            message: 'Nenhuma transação encontrada no período'
          };
        }
      } catch (syncError) {
        console.warn('⚠️ Erro na sincronização automática (não crítico):', syncError);
        syncResult = {
          success: false,
          error: syncError instanceof Error ? syncError.message : 'Erro desconhecido'
        };
      }
    }

    return NextResponse.json({
      success: true,
      item,
      savedItem,
      sync: syncResult
    });
  } catch (error) {
    console.error('❌ Erro ao criar Item Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao criar Item'
      },
      { status: 500 }
    );
  }
}

