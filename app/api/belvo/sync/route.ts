import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  fetchBelvoTransactions,
  inferInstitution,
  mapBelvoTypeToErp,
  resolveAccountId,
  resolveTransactionBalance,
  sanitizeDescription
} from '@/lib/belvoClient';

interface SyncRequestBody {
  linkId?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  pageSize?: number;
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
  const serviceToken = process.env.BELVO_SYNC_SERVICE_TOKEN;
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

function resolveLinkId(requestBody: SyncRequestBody): string | undefined {
  if (requestBody.linkId) {
    return requestBody.linkId;
  }

  const defaultLink = process.env.BELVO_DEFAULT_LINK_ID;
  return defaultLink || undefined;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando sincronização Belvo /api/belvo/sync');

    const authContext = await ensureAuthorization(request);
    const body: SyncRequestBody = await request.json().catch(() => ({}));

    const linkId = resolveLinkId(body);
    const accountId = body.accountId;

    if (!linkId && !accountId) {
      return NextResponse.json(
        {
          success: false,
          error: 'É necessário informar linkId ou configurar BELVO_DEFAULT_LINK_ID.'
        },
        { status: 400 }
      );
    }

    const { transactions, startDate, endDate } = await fetchBelvoTransactions({
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      linkId,
      accountId,
      pageSize: body.pageSize
    });

    console.log('📦 Transações obtidas da Belvo:', {
      total: transactions.length,
      startDate,
      endDate,
      linkId,
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

    const externalIds = transactions.map((t) => t.id).filter(Boolean);

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from('financial_transactions')
      .select('external_id')
      .in('external_id', externalIds);

    if (existingError) {
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

    const existingSet = new Set((existingRows || []).map((row) => row.external_id));

    const records = transactions.map((transaction) => {
      const account = resolveAccountId(transaction);
      const type = mapBelvoTypeToErp(transaction.type, transaction.amount);
      const balance = resolveTransactionBalance(transaction);

      return {
        external_id: transaction.id,
        date: transaction.value_date,
        description: sanitizeDescription(transaction.description),
        amount: Number(transaction.amount.toFixed(2)),
        type,
        institution: inferInstitution(transaction),
        account_id: account,
        balance: balance != null ? Number(balance.toFixed(2)) : null
      };
    });

    const newRecords = records.filter((record) => !existingSet.has(record.external_id));
    const upsertPayload = records;

    const { error: upsertError } = await supabaseAdmin
      .from('financial_transactions')
      .upsert(upsertPayload, { onConflict: 'external_id' });

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

    console.log('✅ Sincronização Belvo concluída:', {
      total: records.length,
      imported: importedCount,
      updated: updatedCount,
      period: `${startDate} a ${endDate}`,
      scope: authContext.scope,
      userId: authContext.userId
    });

    return NextResponse.json({
      success: true,
      imported: importedCount,
      updated: updatedCount,
      period: `${startDate} a ${endDate}`
    });
  } catch (error) {
    console.error('❌ Erro na sincronização Belvo:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido durante sincronização'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}



