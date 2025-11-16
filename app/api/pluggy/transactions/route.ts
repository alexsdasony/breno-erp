import { NextRequest, NextResponse } from 'next/server';
import { fetchPluggyTransactions } from '@/lib/pluggyClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
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
 * GET /api/pluggy/transactions
 * Busca transações da Pluggy e opcionalmente persiste no banco
 * 
 * Query params:
 * - itemId ou item_id: ID do item (conexão) da Pluggy (obrigatório se não houver accountId)
 * - accountId ou account_id: ID da conta (opcional)
 * - dateFrom ou from: Data inicial (YYYY-MM-DD, padrão: 30 dias atrás)
 * - dateTo ou to: Data final (YYYY-MM-DD, padrão: hoje)
 * - limit: Limite por request (máximo 500, padrão: 500)
 * - persist: Se true, persiste as transações no banco (padrão: false)
 * 
 * Exemplo:
 * GET /api/pluggy/transactions?item_id=abc123&from=2025-08-01&to=2025-09-30&limit=500&persist=true
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId') || searchParams.get('item_id');
    const accountId = searchParams.get('accountId') || searchParams.get('account_id');
    const dateFrom = searchParams.get('dateFrom') || searchParams.get('from');
    const dateTo = searchParams.get('dateTo') || searchParams.get('to');
    const limitParam = searchParams.get('limit');
    const persist = searchParams.get('persist') === 'true';
    const limit = limitParam ? Math.min(parseInt(limitParam), 500) : 500;

    console.log('📊 Buscando transações Pluggy:', {
      itemId,
      accountId,
      dateFrom,
      dateTo,
      limit,
      persist
    });

    if (!itemId && !accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'É necessário informar itemId ou accountId'
        },
        { status: 400 }
      );
    }

    const { transactions, startDate, endDate } = await fetchPluggyTransactions({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      itemId: itemId || undefined,
      accountId: accountId || undefined,
      limit
    });

    console.log('✅ Transações obtidas:', {
      total: transactions.length,
      startDate,
      endDate
    });

    // Se persist=true, salvar no banco
    let persistResult = null;
    if (persist && transactions.length > 0) {
      try {
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
        // IMPORTANTE: Filtrar transações sem ID (não podem ser sincronizadas)
        const records = transactions
          .filter((t) => t.id && typeof t.id === 'string' && t.id.trim().length > 0) // Garantir que tem ID válido
          .filter((t) => !existingSet.has(t.id)) // Filtrar duplicatas
          .map((transaction: PluggyTransaction) => {
            const account = resolveAccountId(transaction);
            const type = mapPluggyTypeToErp(transaction.type, transaction.amount);
            const direction = mapPluggyTypeToDirection(transaction.type, transaction.amount);
            const balance = resolveTransactionBalance(transaction);

            return {
              pluggy_id: transaction.id, // Sempre preenchido (garantido pelo filter acima)
              external_id: transaction.id, // Compatibilidade
              item_id: itemId || null,
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
              segment_id: null, // Pode ser obtido do item se necessário
              raw: transaction as unknown as Record<string, unknown>
            };
          });

        // Salvar transações
        if (records.length > 0) {
          const { error: upsertError } = await supabaseAdmin
            .from('financial_transactions')
            .upsert(records, { onConflict: 'pluggy_id' });

          if (upsertError) {
            throw upsertError;
          }

          persistResult = {
            imported: records.length,
            total: transactions.length,
            success: true
          };

          // Atualizar last_sync_at do item
          if (itemId) {
            await supabaseAdmin
              .from('pluggy_items')
              .update({ 
                last_sync_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('item_id', itemId);
          }
        }
      } catch (persistError) {
        console.error('❌ Erro ao persistir transações:', persistError);
        persistResult = {
          success: false,
          error: persistError instanceof Error ? persistError.message : 'Erro desconhecido'
        };
      }
    }

    return NextResponse.json({
      success: true,
      transactions,
      total: transactions.length,
      period: {
        from: startDate,
        to: endDate
      },
      persist: persistResult
    });
  } catch (error) {
    console.error('❌ Erro ao buscar transações Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

