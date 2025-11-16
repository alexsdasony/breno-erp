/**
 * Autenticação Pluggy - Obtém API Key com cache
 * 
 * Endpoint: POST https://api.pluggy.ai/auth
 * Retorna: { apiKey: string, expiresIn?: number }
 * 
 * A API Key é armazenada em cache em memória por X minutos conforme TTL retornado pela API
 */

type PluggyEnvironment = 'development' | 'production' | string;

interface CachedApiKey {
  apiKey: string;
  expiresAt: number;
}

class PluggyAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PluggyAuthError';
  }
}

class PluggyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PluggyConfigError';
  }
}

function getPluggyBaseUrl(env: PluggyEnvironment): string {
  // Priorizar PLUGGY_API_BASE se configurado
  const apiBase = process.env.PLUGGY_API_BASE;
  if (apiBase && apiBase.startsWith('http')) {
    return apiBase;
  }

  const normalized = (env || 'development').toLowerCase();

  switch (normalized) {
    case 'development':
    case 'dev':
    case 'sandbox':
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

// Cache em memória para API Key
let apiKeyCache: CachedApiKey | null = null;

/**
 * Obtém a API Key da Pluggy com cache automático
 * 
 * A API Key é armazenada em cache por X minutos conforme TTL retornado pela API.
 * Se o cache expirar ou não existir, uma nova requisição é feita automaticamente.
 * 
 * @returns Promise<string> API Key para usar no header x-api-key
 */
export async function getPluggyApiKey(): Promise<string> {
  // Verificar se há cache válido
  if (apiKeyCache && apiKeyCache.expiresAt > Date.now()) {
    return apiKeyCache.apiKey;
  }

  const clientId = process.env.PLUGGY_CLIENT_ID;
  const clientSecret = process.env.PLUGGY_CLIENT_SECRET;
  const env = process.env.PLUGGY_ENV || 'development';

  if (!clientId || !clientSecret) {
    throw new PluggyConfigError('Credenciais PLUGGY_CLIENT_ID/PLUGGY_CLIENT_SECRET não configuradas.');
  }

  const baseUrl = getPluggyBaseUrl(env);

  // POST /auth com clientId e clientSecret no body
  const res = await fetch(`${baseUrl}/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      clientId,
      clientSecret
    }),
    cache: 'no-store'
  });

  if (res.status === 401) {
    throw new PluggyAuthError('Credenciais Pluggy inválidas (401).');
  }

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Falha ao obter API Key Pluggy: ${res.status} - ${errorBody}`);
  }

  const json = await res.json();
  let apiKey = json.apiKey || json.key;

  if (!apiKey) {
    throw new Error('API Key não retornada pela Pluggy. Resposta: ' + JSON.stringify(json));
  }

  // IMPORTANTE: Não sanitizar ou modificar a API Key
  // A API Key deve ser usada exatamente como retornada pela Pluggy
  // Remover qualquer whitespace que possa ter sido adicionado acidentalmente
  apiKey = String(apiKey).trim();

  // Validar que a API Key não está vazia após trim
  if (!apiKey || apiKey.length === 0) {
    throw new Error('API Key inválida (vazia após sanitização)');
  }

  // Calcular TTL usando variável de ambiente ou valor retornado pela API
  const cacheTtl = process.env.PLUGGY_X_API_KEY_CACHE_TTL 
    ? parseInt(process.env.PLUGGY_X_API_KEY_CACHE_TTL, 10)
    : (json.expiresIn || 600); // Padrão: 10 minutos (600s) ou expiresIn da API
  
  const expiresIn = Math.max(cacheTtl, 60); // Mínimo 60 segundos
  const expiresAt = Date.now() + (expiresIn * 1000);

  // Armazenar no cache (API Key exata, sem modificações)
  apiKeyCache = {
    apiKey, // API Key exata como retornada pela Pluggy
    expiresAt
  };

  console.log(`✅ API Key Pluggy obtida e cacheada até ${new Date(expiresAt).toISOString()} (TTL: ${expiresIn}s)`);

  return apiKey;
}

/**
 * Limpa o cache da API Key (útil para testes ou forçar renovação)
 */
export function clearPluggyApiKeyCache(): void {
  apiKeyCache = null;
}
