import { NextRequest, NextResponse } from 'next/server';
import { fetchPluggyTransactions } from '@/lib/pluggyClient';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';
import {
  inferInstitution,
  mapPluggyTypeToErp,
  mapPluggyTypeToDirection,
  resolveAccountId,
  resolveTransactionBalance,
  sanitizeDescription,
  type PluggyTransaction
} from '@/lib/pluggyClient';

/**
 * POST /api/pluggy/webhook
 * Recebe notificações da Pluggy quando há atualizações em items/transações
 * 
 * Eventos suportados:
 * - transactions.updated: novas transações disponíveis (busca e persiste automaticamente)
 * - item.updated: item foi atualizado (busca e persiste transações automaticamente)
 * - item.error: erro ao atualizar item (apenas registra no log)
 * 
 * Segurança: Valida SYNC_SECRET_TOKEN se configurado via header Authorization: Bearer <token>
 * 
 * Body esperado:
 * {
 *   "event": "transactions.updated" | "item.updated" | "item.error",
 *   "itemId": "uuid-do-item" ou "item": { "id": "uuid-do-item" },
 *   "data": { ... }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    console.log('📨 Webhook Pluggy recebido');

    // Validação de segurança (opcional mas recomendado)
    const syncSecretToken = process.env.SYNC_SECRET_TOKEN;
    if (syncSecretToken) {
      const authHeader = request.headers.get('authorization');
      const providedToken = authHeader?.replace(/^Bearer\s+/i, '').trim();
      
      if (!providedToken || providedToken !== syncSecretToken) {
        console.warn('⚠️ Webhook rejeitado: token inválido ou ausente');
        return NextResponse.json(
          {
            success: false,
            error: 'Unauthorized'
          },
          { status: 401 }
        );
      }
    }

    const body = await request.json().catch(() => ({}));
    const event = body.event || body.type;
    const itemId = body.itemId || body.item?.id || body.data?.itemId;

    console.log('📋 Evento Pluggy:', {
      event,
      itemId,
      timestamp: new Date().toISOString()
    });

    // Verificar se é um evento de transações
    if (event === 'transactions.updated' || event === 'item.updated') {
      if (!itemId) {
        console.warn('⚠️ Webhook sem itemId, ignorando');
        return NextResponse.json({
          success: false,
          error: 'itemId é obrigatório'
        }, { status: 400 });
      }

      // Buscar transações do item desde a última sincronização
      // Por padrão, busca últimos 7 dias para garantir que não perdemos nada
      const dateTo = new Date().toISOString().split('T')[0];
      const dateFrom = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      console.log('🔄 Buscando transações do item:', {
        itemId,
        dateFrom,
        dateTo
      });

      try {
        const { transactions, startDate, endDate } = await fetchPluggyTransactions({
          itemId,
          dateFrom,
          dateTo,
          limit: 500
        });

        if (!transactions.length) {
          console.log('ℹ️ Nenhuma transação nova encontrada');
          return NextResponse.json({
            success: true,
            message: 'Nenhuma transação nova encontrada',
            event,
            itemId
          });
        }

        // Verificar duplicatas usando pluggy_id
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

        // Buscar segment_id do item (se armazenado no banco)
        let segmentId: string | null = null;
        try {
          const { data: itemData } = await supabaseAdmin
            .from('pluggy_items')
            .select('segment_id')
            .eq('item_id', itemId)
            .single();
          
          if (itemData?.segment_id) {
            segmentId = itemData.segment_id;
          }
        } catch (error) {
          console.warn('⚠️ Erro ao buscar segment_id do item (não crítico):', error);
        }

        // Mapear transações para o formato do banco
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
              item_id: itemId,
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
              segment_id: segmentId,
              raw: transaction as unknown as Record<string, unknown>
            };
          });

        if (records.length === 0) {
          console.log('ℹ️ Todas as transações já estão sincronizadas');
          return NextResponse.json({
            success: true,
            message: 'Todas as transações já estão sincronizadas',
            event,
            itemId,
            totalTransactions: transactions.length
          });
        }

        // Inserir novas transações
        const { error: upsertError } = await supabaseAdmin
          .from('financial_transactions')
          .upsert(records, { onConflict: 'pluggy_id' });

        if (upsertError) {
          console.error('❌ Erro ao inserir transações do webhook:', upsertError);
          return NextResponse.json({
            success: false,
            error: 'Erro ao salvar transações',
            details: upsertError.message
          }, { status: 500 });
        }

        console.log('✅ Webhook processado com sucesso:', {
          event,
          itemId,
          imported: records.length,
          totalAvailable: transactions.length,
          period: `${startDate} a ${endDate}`
        });

        return NextResponse.json({
          success: true,
          event,
          itemId,
          imported: records.length,
          totalAvailable: transactions.length,
          period: `${startDate} a ${endDate}`
        });
      } catch (syncError) {
        console.error('❌ Erro ao sincronizar transações do webhook:', syncError);
        return NextResponse.json({
          success: false,
          error: 'Erro ao sincronizar transações',
          details: syncError instanceof Error ? syncError.message : 'Erro desconhecido'
        }, { status: 500 });
      }
    }

    // Outros eventos (item.error, etc.)
    if (event === 'item.error') {
      console.warn('⚠️ Erro no item Pluggy:', {
        itemId,
        error: body.error || body.data?.error
      });
      // TODO: Registrar erro no banco ou notificar administradores
    }

    // Responder 200 para todos os eventos (Pluggy espera isso)
    return NextResponse.json({
      success: true,
      message: 'Webhook recebido',
      event,
      itemId
    });
  } catch (error) {
    console.error('❌ Erro ao processar webhook Pluggy:', error);
    // Sempre retornar 200 para evitar retentativas desnecessárias da Pluggy
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 200 }); // 200 para evitar retentativas
  }
}

// GET para verificação/health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint ativo',
    endpoint: '/api/pluggy/webhook',
    method: 'POST'
  });
}

