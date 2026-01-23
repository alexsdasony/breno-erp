import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FETCH_TIMEOUT_MS = 25_000;
const FETCH_RETRIES = 1;
const RETRY_DELAY_MS = 2000;

function isRetryableFetchError(e: unknown): boolean {
  const msg = e instanceof Error ? e.message : String(e);
  const cause = e instanceof Error && 'cause' in e ? (e as Error & { cause?: { code?: string } }).cause : null;
  const code = cause && typeof cause === 'object' && 'code' in cause ? String((cause as { code?: string }).code) : '';
  return (
    msg.includes('fetch failed') ||
    msg.includes('ECONNRESET') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('ENETUNREACH') ||
    msg.includes('ETIMEDOUT') ||
    code === 'ECONNRESET' ||
    code === 'ECONNREFUSED' ||
    code === 'ENETUNREACH' ||
    code === 'ETIMEDOUT'
  );
}

async function fetchWithTimeoutAndRetry(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(input, { ...init, signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (e) {
      clearTimeout(timeoutId);
      lastError = e;
      const cause = e instanceof Error && 'cause' in e ? (e as Error & { cause?: unknown }).cause : null;
      console.error(`❌ Supabase fetch failed (tentativa ${attempt + 1}/${FETCH_RETRIES + 1}):`, e);
      console.error('❌ cause (diagnóstico rede):', cause);
      if (attempt < FETCH_RETRIES && isRetryableFetchError(e)) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
        continue;
      }
      throw e;
    }
  }
  throw lastError;
}

/**
 * Cria um cliente Supabase Admin (Service Role) no runtime.
 * 
 * ⚠️ IMPORTANTE: Este helper NÃO cria client global.
 * O client é criado a cada chamada, dentro do runtime da rota.
 * Isso previne problemas com recycle de container no Render.
 * 
 * @returns SupabaseClient configurado com Service Role Key
 * @throws Error se variáveis de ambiente não estiverem definidas
 */
export function getSupabaseAdmin(): SupabaseClient {
  // Log de diagnóstico em produção também para debug
  console.log('🔍 [getSupabaseAdmin] Verificando variáveis de ambiente...', {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Validação explícita com logs de erro claros
  if (!url) {
    const errorMsg = '❌ NEXT_PUBLIC_SUPABASE_URL não está definida no ambiente';
    console.error(errorMsg);
    console.error('🔍 Variáveis de ambiente disponíveis:', {
      hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', '),
    });
    const err = new Error(errorMsg);
    (err as any).isConfigError = true;
    throw err;
  }

  if (!key) {
    const errorMsg = '❌ SUPABASE_SERVICE_ROLE_KEY não está definida no ambiente';
    console.error(errorMsg);
    console.error('🔍 Variáveis de ambiente disponíveis:', {
      hasNextPublicSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      nodeEnv: process.env.NODE_ENV,
      urlLength: url?.length || 0,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', '),
    });
    const err = new Error(errorMsg);
    (err as any).isConfigError = true;
    throw err;
  }

  // Validação adicional: verificar se a chave não está vazia após limpeza
  const cleanedKey = key.replace(/\n/g, '').replace(/\r/g, '').trim();
  if (!cleanedKey || cleanedKey.length === 0) {
    const errorMsg = '❌ SUPABASE_SERVICE_ROLE_KEY está definida mas está vazia após limpeza';
    console.error(errorMsg);
    console.error('🔍 Tamanho da chave original:', key.length);
    throw new Error(errorMsg);
  }

  // Validação básica do formato da chave (deve começar com eyJ)
  if (!cleanedKey.startsWith('eyJ')) {
    console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY pode estar em formato incorreto (não começa com eyJ)');
  }

  // Log de sucesso (também em produção para debug inicial)
  console.log('✅ [getSupabaseAdmin] Supabase Admin client criado com sucesso', {
    url: url.substring(0, 30) + '...',
    keyLength: cleanedKey.length,
    keyPrefix: cleanedKey.substring(0, 20) + '...',
    timestamp: new Date().toISOString(),
  });

  return createClient(url, cleanedKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: fetchWithTimeoutAndRetry,
    },
  });
}
