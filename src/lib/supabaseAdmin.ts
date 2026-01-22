import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Limpeza da chave para remover quebras de linha e espaços extras
supabaseKey = supabaseKey.replace(/\n/g, '').replace(/\r/g, '').trim();

// Debug das variáveis de ambiente
console.log('🔍 SupabaseAdmin - Verificando variáveis:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Definida e limpa' : '❌ Não definida');

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL não está definida!');
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não está definida');
}

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não está definida!');
  throw new Error('SUPABASE_SERVICE_ROLE_KEY não está definida');
}

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

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    fetch: fetchWithTimeoutAndRetry,
  },
});
