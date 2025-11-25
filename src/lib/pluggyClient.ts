import { formatISO, parseISO, subDays } from 'date-fns';
import { getPluggyApiKey, clearPluggyApiKeyCache } from './pluggyAuth';

type PluggyEnvironment = 'development' | 'production' | string;

export interface PluggyTransaction {
  id: string;
  accountId: string;
  date: string;
  description: string | null;
  amount: number;
  type: string | null;
  currency?: string | null;
  balance?: number | null;
  category?: string | null;
  subcategory?: string | null;
  status?: string | null;
  metadata?: Record<string, unknown> | null;
  // Campos adicionais que podem vir da API
  [key: string]: unknown;
}

export interface PluggyTransactionsResponse {
  results: PluggyTransaction[];
  page?: number;
  totalPages?: number;
  totalResults?: number;
  next?: string | null; // URL para próxima página (se houver)
  previous?: string | null; // URL para página anterior (se houver)
}

interface FetchTransactionsParams {
  token: string;
  dateFrom: string;
  dateTo: string;
  itemId?: string;
  accountId?: string;
  limit?: number;
  page?: number; // Para paginação manual se necessário
}

interface FetchTransactionsResult {
  transactions: PluggyTransaction[];
  startDate: string;
  endDate: string;
}

class PluggyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PluggyConfigError';
  }
}

export function getPluggyBaseUrl(env: PluggyEnvironment): string {
  const normalized = (env || 'development').toLowerCase();

  switch (normalized) {
    case 'development':
    case 'dev':
      return 'https://api.pluggy.ai';
    case 'production':
    case 'prod':
      return 'https://api.pluggy.ai';
    default:
      if (normalized.startsWith('http')) {
        return normalized;
      }
      throw new PluggyConfigError(`Ambiente Pluggy inválido: ${env}`);
  }
}

async function fetchTransactionsPage(params: FetchTransactionsParams, pageUrl?: string) {
  const { token, dateFrom, dateTo, itemId, accountId, limit = 500, page } = params;
  const env = process.env.PLUGGY_ENV || 'development';
  const baseUrl = getPluggyBaseUrl(env);

  const url = pageUrl
    ? new URL(pageUrl)
    : new URL(`${baseUrl}/transactions`);

  if (!pageUrl) {
    // API Pluggy usa: item_id, account_id, from, to, limit
    url.searchParams.set('from', dateFrom);
    url.searchParams.set('to', dateTo);
    url.searchParams.set('limit', String(Math.min(limit, 500))); // Máximo 500 por request

    if (itemId) {
      url.searchParams.set('item_id', itemId); // Pluggy usa item_id (com underscore)
    }

    if (accountId) {
      url.searchParams.set('account_id', accountId); // Pluggy usa account_id (com underscore)
    }

    // Se houver paginação manual (não recomendado, mas suportado)
    if (page && page > 1) {
      url.searchParams.set('page', String(page));
    }
  }

  // A Pluggy usa X-API-KEY no header para autenticação
  // IMPORTANTE: Usar a API Key exatamente como recebida, sem sanitização
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-API-KEY': token, // API Key exata, sem modificações
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  return response;
}

export async function fetchPluggyTransactions(params: {
  dateFrom?: string;
  dateTo?: string;
  itemId?: string;
  accountId?: string;
  limit?: number; // Limite por request (máximo 500)
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

  // Obter API Key (com cache automático)
  let apiKey = await getPluggyApiKey();

  const aggregated: PluggyTransaction[] = [];
  const limit = Math.min(params.limit || 500, 500); // Máximo 500 por request
  let nextPageUrl: string | null | undefined = null;
  let attempt = 0;

  do {
    const response = await fetchTransactionsPage(
      {
        token: apiKey,
        dateFrom,
        dateTo,
        itemId: params.itemId,
        accountId: params.accountId,
        limit
      },
      nextPageUrl || undefined
    );

    // Se receber 401, tentar renovar a API Key uma vez
    if (response.status === 401 && attempt < 1) {
      attempt += 1;
      // Limpar cache e obter nova API Key
      clearPluggyApiKeyCache();
      apiKey = await getPluggyApiKey();
      nextPageUrl = null; // Resetar paginação
      continue;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Erro ao buscar transações Pluggy: ${response.status} - ${body}`);
    }

    const payload: PluggyTransactionsResponse = await response.json();
    aggregated.push(...(payload.results || []));
    
    // Usar next para paginação (se disponível)
    nextPageUrl = payload.next;

    // Se não houver next mas houver totalPages, usar paginação manual
    if (!nextPageUrl && payload.totalPages && payload.page && payload.page < payload.totalPages) {
      // Não há suporte direto para paginação manual na API Pluggy via parâmetro page
      // A paginação deve ser feita via next/previous URLs retornadas
      break;
    }

  } while (nextPageUrl);

  return {
    transactions: aggregated,
    startDate: formatISO(periodStart, { representation: 'date' }),
    endDate: formatISO(periodEnd, { representation: 'date' })
  };
}

/**
 * Mapeia o tipo da Pluggy para o tipo do ERP (receita/despesa)
 */
export function mapPluggyTypeToErp(type: string | null, amount: number): 'receita' | 'despesa' {
  if (type) {
    const normalized = type.toLowerCase();
    if (['credit', 'income', 'inflow', 'entrada', 'receita', 'deposit'].includes(normalized)) {
      return 'receita';
    }
    if (['debit', 'expense', 'outflow', 'saida', 'despesa', 'withdrawal', 'payment'].includes(normalized)) {
      return 'despesa';
    }
  }

  return amount >= 0 ? 'receita' : 'despesa';
}

/**
 * Normaliza o tipo da Pluggy para direction (receivable/payable)
 * credit → receivable (receita)
 * debit → payable (despesa)
 */
export function mapPluggyTypeToDirection(type: string | null, amount: number): 'receivable' | 'payable' {
  if (type) {
    const normalized = type.toLowerCase();
    if (['credit', 'income', 'inflow', 'entrada', 'receita', 'deposit', 'receipt'].includes(normalized)) {
      return 'receivable';
    }
    if (['debit', 'expense', 'outflow', 'saida', 'despesa', 'withdrawal', 'payment'].includes(normalized)) {
      return 'payable';
    }
  }

  return amount >= 0 ? 'receivable' : 'payable';
}

export function resolveTransactionBalance(transaction: PluggyTransaction): number | null {
  if (transaction.balance != null) {
    return Number(transaction.balance);
  }

  return null;
}

export function sanitizeDescription(description: string | null): string | null {
  if (!description) return null;
  return description.trim().replace(/\s+/g, ' ');
}

export function inferInstitution(transaction: PluggyTransaction): string | null {
  // A Pluggy pode retornar informações da instituição no metadata
  if (transaction.metadata?.institution) {
    return String(transaction.metadata.institution);
  }
  return null;
}

export function resolveAccountId(transaction: PluggyTransaction): string {
  return transaction.accountId || 'unknown-account';
}

// ========================================
// CONNECT TOKEN E ITEMS
// ========================================

export interface PluggyConnector {
  id: string;
  name: string;
  country: string;
  type: string;
  imageUrl?: string;
  primaryColor?: string;
  institutionUrl?: string;
  products?: string[];
  parameters?: Array<{
    name: string;
    label: string;
    type: string;
    required?: boolean;
  }>;
}

export interface PluggyConnectorsResponse {
  results: PluggyConnector[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export interface CreateConnectTokenParams {
  language?: string;
  country?: string;
  institution?: string;
  connector?: string;
  webhookUrl?: string;
  clientUserId?: string;
}

export interface ConnectTokenResponse {
  connectToken: string;
  expiresAt?: string;
}

export interface CreateItemParams {
  connector: string;
  credentials: Record<string, string>;
  metadata?: Record<string, unknown>;
  webhookUrl?: string;
  clientUserId?: string;
}

export interface PluggyItem {
  id: string;
  connector: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  status: string;
  error?: {
    code: string;
    message: string;
  };
  executionStatus: string;
  metadata?: Record<string, unknown>;
}

/**
 * Lista todos os conectores disponíveis na Pluggy
 */
export async function listPluggyConnectors(params?: {
  country?: string;
  name?: string;
  page?: number;
  pageSize?: number;
}): Promise<PluggyConnectorsResponse> {
  const apiKey = await getPluggyApiKey();
  const env = process.env.PLUGGY_ENV || 'development';
  const baseUrl = getPluggyBaseUrl(env);

  const url = new URL(`${baseUrl}/connectors`);
  
  if (params?.country) {
    url.searchParams.set('country', params.country);
  }
  if (params?.name) {
    url.searchParams.set('name', params.name);
  }
  if (params?.page) {
    url.searchParams.set('page', String(params.page));
  }
  if (params?.pageSize) {
    url.searchParams.set('pageSize', String(params.pageSize));
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ao listar conectores Pluggy: ${response.status} - ${body}`);
  }

  return response.json();
}

/**
 * Cria um Connect Token para usar com o Pluggy Connect Widget
 * Opção A - Recomendada para UX (usuário entra credenciais no widget)
 */
export async function createPluggyConnectToken(
  params?: CreateConnectTokenParams
): Promise<ConnectTokenResponse> {
  const apiKey = await getPluggyApiKey();
  const env = process.env.PLUGGY_ENV || 'development';
  const baseUrl = getPluggyBaseUrl(env);

  const response = await fetch(`${baseUrl}/connect_token`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language: params?.language || 'pt',
      country: params?.country,
      institution: params?.institution,
      connector: params?.connector,
      webhookUrl: params?.webhookUrl,
      clientUserId: params?.clientUserId
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ao criar Connect Token Pluggy: ${response.status} - ${body}`);
  }

  return response.json();
}

/**
 * Cria um Item (conexão) diretamente via API
 * Opção B - Criar conexão programaticamente (sem widget)
 * 
 * Exemplo para Bradesco sandbox:
 * createPluggyItem({
 *   connector: 'bradesco',
 *   credentials: {
 *     username: 'bnk100',
 *     password: 'combelvo'
 *   },
 *   metadata: { externalId: 'user-123' }
 * })
 */
export async function createPluggyItem(
  params: CreateItemParams
): Promise<PluggyItem> {
  const apiKey = await getPluggyApiKey();
  const env = process.env.PLUGGY_ENV || 'development';
  const baseUrl = getPluggyBaseUrl(env);

  const response = await fetch(`${baseUrl}/items`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      connector: params.connector,
      credentials: params.credentials,
      metadata: params.metadata,
      webhookUrl: params.webhookUrl,
      clientUserId: params.clientUserId
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ao criar Item Pluggy: ${response.status} - ${body}`);
  }

  return response.json();
}

/**
 * Busca um Item específico por ID
 */
export async function getPluggyItem(itemId: string): Promise<PluggyItem> {
  const apiKey = await getPluggyApiKey();
  const env = process.env.PLUGGY_ENV || 'development';
  const baseUrl = getPluggyBaseUrl(env);

  const response = await fetch(`${baseUrl}/items/${itemId}`, {
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ao buscar Item Pluggy: ${response.status} - ${body}`);
  }

  return response.json();
}

export interface PluggyAccount {
  id: string;
  type: string;
  subtype: string | null;
  name: string | null;
  balance: number | null;
  currencyCode: string | null;
  itemId: string;
  number: string | null;
  [key: string]: unknown;
}

export interface PluggyAccountsResponse {
  results: PluggyAccount[];
  page?: number;
  totalPages?: number;
  totalResults?: number;
  next?: string | null;
  previous?: string | null;
}

/**
 * Lista todas as contas (accounts) de um item Pluggy
 */
export async function listPluggyAccounts(itemId: string): Promise<PluggyAccountsResponse> {
  const apiKey = await getPluggyApiKey();
  const env = process.env.PLUGGY_ENV || 'development';
  const baseUrl = getPluggyBaseUrl(env);

  const url = new URL(`${baseUrl}/accounts`);
  url.searchParams.set('itemId', itemId);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ao listar contas Pluggy: ${response.status} - ${body}`);
  }

  return response.json();
}

export interface PluggyItemsResponse {
  results: PluggyItem[];
  page?: number;
  totalPages?: number;
  totalResults?: number;
  next?: string | null;
  previous?: string | null;
}

/**
 * Lista todos os itens da Pluggy (se disponível)
 * Nota: A Pluggy pode não permitir listar todos os itens por segurança
 * Esta função tenta buscar usando filtros opcionais
 */
export async function listPluggyItems(params?: {
  page?: number;
  pageSize?: number;
  clientUserId?: string;
}): Promise<PluggyItemsResponse> {
  const apiKey = await getPluggyApiKey();
  const env = process.env.PLUGGY_ENV || 'development';
  const baseUrl = getPluggyBaseUrl(env);

  const url = new URL(`${baseUrl}/items`);
  
  if (params?.page) {
    url.searchParams.set('page', String(params.page));
  }
  if (params?.pageSize) {
    url.searchParams.set('pageSize', String(params.pageSize));
  }
  if (params?.clientUserId) {
    url.searchParams.set('clientUserId', params.clientUserId);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text();
    // Se retornar 404 ou 403, pode ser que a API não permita listar todos os itens
    if (response.status === 404 || response.status === 403) {
      console.warn('⚠️ API Pluggy não permite listar todos os itens (comportamento esperado)');
      return { results: [] };
    }
    throw new Error(`Erro ao listar itens Pluggy: ${response.status} - ${body}`);
  }

  return response.json();
}

// ========================================
// WEBHOOKS
// ========================================

export interface CreateWebhookParams {
  url: string;
  events: string[]; // ['transactions.updated', 'item.updated', 'item.error']
  active?: boolean;
}

export interface PluggyWebhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cria um webhook na Pluggy
 * POST /webhooks
 */
export async function createPluggyWebhook(params: CreateWebhookParams): Promise<PluggyWebhook> {
  const apiKey = await getPluggyApiKey();
  const env = process.env.PLUGGY_ENV || 'development';
  const baseUrl = getPluggyBaseUrl(env);

  const response = await fetch(`${baseUrl}/webhooks`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      url: params.url,
      events: params.events,
      active: params.active !== false
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ao criar webhook Pluggy: ${response.status} - ${body}`);
  }

  return response.json();
}

/**
 * Lista webhooks registrados
 * GET /webhooks
 */
export async function listPluggyWebhooks(): Promise<{ results: PluggyWebhook[] }> {
  const apiKey = await getPluggyApiKey();
  const env = process.env.PLUGGY_ENV || 'development';
  const baseUrl = getPluggyBaseUrl(env);

  const response = await fetch(`${baseUrl}/webhooks`, {
    method: 'GET',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ao listar webhooks Pluggy: ${response.status} - ${body}`);
  }

  return response.json();
}

/**
 * Deleta um webhook
 * DELETE /webhooks/:id
 */
export async function deletePluggyWebhook(webhookId: string): Promise<void> {
  const apiKey = await getPluggyApiKey();
  const env = process.env.PLUGGY_ENV || 'development';
  const baseUrl = getPluggyBaseUrl(env);

  const response = await fetch(`${baseUrl}/webhooks/${webhookId}`, {
    method: 'DELETE',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Erro ao deletar webhook Pluggy: ${response.status} - ${body}`);
  }
}

