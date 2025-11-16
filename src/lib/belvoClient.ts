import { formatISO, parseISO, subDays } from 'date-fns';

type BelvoEnvironment = 'sandbox' | 'development' | 'production' | string;

export interface BelvoTransaction {
  id: string;
  account: {
    id: string;
    name?: string | null;
    institution?: {
      name?: string | null;
      id?: string | null;
    } | null;
    current_balance?: number | null;
    balance?: {
      available?: number | null;
      current?: number | null;
      limit?: number | null;
    } | null;
  };
  value_date: string;
  description: string | null;
  amount: number;
  type: string | null;
  currency?: string | null;
  meta?: Record<string, unknown> | null;
}

export interface BelvoTransactionsResponse {
  results: BelvoTransaction[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

interface FetchTransactionsParams {
  token: string;
  dateFrom: string;
  dateTo: string;
  linkId?: string;
  accountId?: string;
  pageSize?: number;
}

interface FetchTransactionsResult {
  transactions: BelvoTransaction[];
  startDate: string;
  endDate: string;
}

class BelvoAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BelvoAuthError';
  }
}

class BelvoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BelvoConfigError';
  }
}

export function getBelvoBaseUrl(env: BelvoEnvironment): string {
  const normalized = (env || 'sandbox').toLowerCase();

  switch (normalized) {
    case 'sandbox':
      return 'https://sandbox.belvo.com';
    case 'development':
    case 'staging':
      return 'https://development.belvo.com';
    case 'production':
      return 'https://api.belvo.com';
    default:
      if (normalized.startsWith('http')) {
        return normalized;
      }
      throw new BelvoConfigError(`Ambiente Belvo inválido: ${env}`);
  }
}

async function requestBelvoToken(): Promise<{ access: string; refresh: string; expires_in: number }> {
  const clientId = process.env.BELVO_ID;
  const clientSecret = process.env.BELVO_SECRET;
  const env = process.env.BELVO_ENV || 'sandbox';

  if (!clientId || !clientSecret) {
    throw new BelvoConfigError('Credenciais BELVO_ID/BELVO_SECRET não configuradas.');
  }

  const baseUrl = getBelvoBaseUrl(env);
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${baseUrl}/api/token/`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({}),
    cache: 'no-store'
  });

  if (response.status === 401) {
    throw new BelvoAuthError('Credenciais Belvo inválidas (401).');
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Falha ao obter token Belvo: ${response.status} - ${errorBody}`);
  }

  return response.json();
}

async function fetchTransactionsPage(params: FetchTransactionsParams, pageUrl?: string) {
  const { token, dateFrom, dateTo, linkId, accountId, pageSize = 100 } = params;
  const env = process.env.BELVO_ENV || 'sandbox';
  const baseUrl = getBelvoBaseUrl(env);

  const url = pageUrl
    ? new URL(pageUrl)
    : new URL(`${baseUrl}/api/transactions/`);

  if (!pageUrl) {
    url.searchParams.set('page_size', String(pageSize));
    url.searchParams.set('date_from', dateFrom);
    url.searchParams.set('date_to', dateTo);

    if (linkId) {
      url.searchParams.set('link', linkId);
    }

    if (accountId) {
      url.searchParams.set('account', accountId);
    }
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  return response;
}

export async function fetchBelvoTransactions(params: {
  dateFrom?: string;
  dateTo?: string;
  linkId?: string;
  accountId?: string;
  pageSize?: number;
}): Promise<FetchTransactionsResult> {
  const now = new Date();
  const dateTo = params.dateTo
    ? params.dateTo
    : formatISO(now, { representation: 'date' });
  const dateFrom = params.dateFrom
    ? params.dateFrom
    : formatISO(subDays(now, 30), { representation: 'date' });

  const periodStart = parseISO(dateFrom);
  const periodEnd = parseISO(dateTo);

  if (periodStart > periodEnd) {
    throw new Error('dateFrom não pode ser maior que dateTo.');
  }

  let tokenBundle = await requestBelvoToken();
  let accessToken = tokenBundle.access;

  const aggregated: BelvoTransaction[] = [];
  let nextPage: string | null | undefined;
  let attempt = 0;

  do {
    const response = await fetchTransactionsPage(
      {
        token: accessToken,
        dateFrom,
        dateTo,
        linkId: params.linkId,
        accountId: params.accountId,
        pageSize: params.pageSize
      },
      nextPage || undefined
    );

    if (response.status === 401 && attempt < 1) {
      attempt += 1;
      tokenBundle = await requestBelvoToken();
      accessToken = tokenBundle.access;
      nextPage = null;
      continue;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Erro ao buscar transações Belvo: ${response.status} - ${body}`);
    }

    const payload: BelvoTransactionsResponse = await response.json();
    aggregated.push(...(payload.results || []));
    nextPage = payload.next;

  } while (nextPage);

  return {
    transactions: aggregated,
    startDate: formatISO(periodStart, { representation: 'date' }),
    endDate: formatISO(periodEnd, { representation: 'date' })
  };
}

export function mapBelvoTypeToErp(type: string | null, amount: number): 'receita' | 'despesa' {
  if (type) {
    const normalized = type.toLowerCase();
    if (['credit', 'income', 'inflow', 'entrada', 'receita'].includes(normalized)) {
      return 'receita';
    }
    if (['debit', 'expense', 'outflow', 'saida', 'despesa'].includes(normalized)) {
      return 'despesa';
    }
  }

  return amount >= 0 ? 'receita' : 'despesa';
}

export function resolveTransactionBalance(transaction: BelvoTransaction): number | null {
  if (transaction.account?.balance?.available != null) {
    return Number(transaction.account.balance.available);
  }

  if (transaction.account?.balance?.current != null) {
    return Number(transaction.account.balance.current);
  }

  if (transaction.account?.current_balance != null) {
    return Number(transaction.account.current_balance);
  }

  return null;
}

export function sanitizeDescription(description: string | null): string | null {
  if (!description) return null;
  return description.trim().replace(/\s+/g, ' ');
}

export function inferInstitution(transaction: BelvoTransaction): string | null {
  return transaction.account?.institution?.name || null;
}

export function resolveAccountId(transaction: BelvoTransaction): string {
  return transaction.account?.id || 'unknown-account';
}

