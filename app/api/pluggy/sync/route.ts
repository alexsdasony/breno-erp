import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  fetchPluggyTransactions,
  inferInstitution,
  mapPluggyTypeToErp,
  mapPluggyTypeToDirection,
  resolveAccountId,
  resolveTransactionBalance,
  sanitizeDescription,
  type PluggyTransaction
} from '@/lib/pluggyClient';

interface SyncRequestBody {
  itemId?: string; // item_id da Pluggy
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number; // Limite por request (máximo 500)
  segmentId?: string; // UUID do segmento para vincular transações
}

interface AuthContext {
  scope: 'service' | 'user';
  userId?: string;
  userEmail?: string;
}

function parseUserToken(token: string | null): { user_id: string; email?: string } | null {
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const payload = JSON.parse(decoded);
    if (payload?.user_id) {
      return {
        user_id: payload.user_id,
        email: payload.email
      };
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Falha ao decodificar X-User-Token:', error);
    return null;
  }
}

async function ensureAuthorization(request: NextRequest): Promise<AuthContext> {
  const serviceToken = process.env.PLUGGY_SYNC_SERVICE_TOKEN;
  const authHeader = request.headers.get('authorization');

  if (serviceToken && authHeader?.startsWith('Bearer ')) {
    const provided = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (provided === serviceToken) {
      return { scope: 'service' };
    }
  }

  const userHeader = request.headers.get('X-User-Token');
  const userToken = parseUserToken(userHeader);

  if (!userToken) {
    throw new Error('Unauthorized');
  }

  return {
    scope: 'user',
    userId: userToken.user_id,
    userEmail: userToken.email
  };
}

function resolveItemId(requestBody: SyncRequestBody): string | undefined {
  if (requestBody.itemId) {
    return requestBody.itemId;
  }

  const defaultConnection = process.env.PLUGGY_DEFAULT_CONNECTION_ID;
  return defaultConnection || undefined;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando sincronização Pluggy /api/pluggy/sync');

    const authContext = await ensureAuthorization(request);
    const body: SyncRequestBody = await request.json().catch(() => ({}));

    const itemId = resolveItemId(body);
    const accountId = body.accountId;

    if (!itemId && !accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'É necessário informar itemId ou configurar PLUGGY_DEFAULT_CONNECTION_ID.'
        },
        { status: 400 }
      );
    }

    const { transactions, startDate, endDate } = await fetchPluggyTransactions({
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      itemId,
      accountId,
      limit: body.limit || 500 // Máximo 500 por request conforme documentação Pluggy
    });

    console.log('📦 Transações obtidas da Pluggy:', {
      total: transactions.length,
      startDate,
      endDate,
      itemId,
      accountId
    });

    if (!transactions.length) {
      return NextResponse.json({
        success: true,
        imported: 0,
        updated: 0,
        period: `${startDate} a ${endDate}`,
        message: 'Nenhuma transação nova encontrada no período informado.'
      });
    }

    // Verificar duplicatas usando pluggy_id (ou external_id como fallback)
    const pluggyIds = transactions.map((t) => t.id).filter(Boolean);

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from('financial_transactions')
      .select('pluggy_id, external_id')
      .in('pluggy_id', pluggyIds);

    // Se não encontrar por pluggy_id, tentar por external_id (compatibilidade)
    let existingSet: Set<string>;
    if (existingRows && existingRows.length > 0) {
      existingSet = new Set(
        existingRows
          .map((row) => row.pluggy_id || row.external_id)
          .filter(Boolean)
      );
    } else {
      // Fallback: verificar por external_id
      const { data: existingByExternalId } = await supabaseAdmin
        .from('financial_transactions')
        .select('external_id')
        .in('external_id', pluggyIds);
      existingSet = new Set((existingByExternalId || []).map((row) => row.external_id).filter(Boolean));
    }

    if (existingError && existingError.code !== 'PGRST116') {
      // PGRST116 = nenhum resultado encontrado (não é erro crítico)
      console.error('❌ Erro ao verificar transações existentes:', existingError);
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao verificar transações já importadas.',
          details: existingError.message
        },
        { status: 500 }
      );
    }

    // Resolver segment_id (do body ou do usuário)
    let segmentId: string | null = null;
    if (body.segmentId) {
      segmentId = body.segmentId;
    } else if (authContext.userId) {
      // Buscar segment_id do usuário
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('segment_id')
        .eq('id', authContext.userId)
        .single();
      segmentId = userData?.segment_id || null;
    }

    // Mapear transações para o formato do banco
    // IMPORTANTE: Filtrar transações sem ID válido (não podem ser sincronizadas)
    const validTransactions = transactions.filter(
      (t) => t.id && typeof t.id === 'string' && t.id.trim().length > 0
    );
    
    const records = validTransactions.map((transaction: PluggyTransaction) => {
      const account = resolveAccountId(transaction);
      const type = mapPluggyTypeToErp(transaction.type, transaction.amount);
      const direction = mapPluggyTypeToDirection(transaction.type, transaction.amount);
      const balance = resolveTransactionBalance(transaction);

      return {
        // IDs e referências
        pluggy_id: transaction.id, // ID único da Pluggy (evita duplicatas)
        external_id: transaction.id, // Mantido para compatibilidade
        item_id: itemId || null, // ID do item (conexão) da Pluggy
        account_id: account, // ID da conta na Pluggy
        
        // Dados da transação
        date: transaction.date,
        description: sanitizeDescription(transaction.description),
        amount: Number(transaction.amount.toFixed(2)),
        type, // 'receita' ou 'despesa' (compatibilidade)
        direction, // 'receivable' ou 'payable' (novo campo)
        category: transaction.category || transaction.subcategory || null,
        status: transaction.status || 'POSTED',
        institution: inferInstitution(transaction),
        balance: balance != null ? Number(balance.toFixed(2)) : null,
        
        // Vinculações
        segment_id: segmentId,
        
        // Dados brutos (JSONB)
        raw: transaction as unknown as Record<string, unknown>
      };
    });

    const newRecords = records.filter((record) => !existingSet.has(record.pluggy_id));
    const upsertPayload = records;

    // Upsert usando pluggy_id como chave única
    // O Supabase usa o índice único automaticamente
    const { error: upsertError } = await supabaseAdmin
      .from('financial_transactions')
      .upsert(upsertPayload, { 
        onConflict: 'pluggy_id' // Usa o índice único idx_financial_transactions_pluggy_id
      });

    if (upsertError) {
      console.error('❌ Erro ao inserir transações financeiras:', upsertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao salvar transações no banco.',
          details: upsertError.message
        },
        { status: 500 }
      );
    }

    const importedCount = newRecords.length;
    const updatedCount = records.length - importedCount;

    // Atualizar last_sync_at do item (se itemId foi fornecido)
    if (itemId) {
      await supabaseAdmin
        .from('pluggy_items')
        .update({ 
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('item_id', itemId)
        .then(({ error }) => {
          if (error) {
            console.warn('⚠️ Erro ao atualizar last_sync_at:', error);
          }
        });
    }

    console.log('✅ Sincronização Pluggy concluída:', {
      total: records.length,
      imported: importedCount,
      updated: updatedCount,
      period: `${startDate} a ${endDate}`,
      scope: authContext.scope,
      userId: authContext.userId,
      itemId
    });

    return NextResponse.json({
      success: true,
      imported: importedCount,
      updated: updatedCount,
      period: `${startDate} a ${endDate}`
    });
  } catch (error) {
    console.error('❌ Erro na sincronização Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido durante sincronização'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

