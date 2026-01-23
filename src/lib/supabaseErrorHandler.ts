/**
 * Helper para tratar erros do Supabase de forma consistente
 */

export interface SupabaseErrorInfo {
  isNetworkError: boolean;
  isConfigError: boolean;
  isDnsError: boolean;
  errorMessage: string;
  hostname?: string;
  shouldReturnEmpty: boolean; // Para GET requests, retornar dados vazios em vez de erro
}

export function analyzeSupabaseError(error: unknown): SupabaseErrorInfo {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  const errCause = error instanceof Error && 'cause' in error 
    ? (error as Error & { cause?: unknown }).cause 
    : null;
  
  const causeCode = errCause && typeof errCause === 'object' && 'code' in errCause 
    ? String(errCause.code) 
    : '';
  const hostname = errCause && typeof errCause === 'object' && 'hostname' in errCause 
    ? String(errCause.hostname) 
    : undefined;

  const isConfigError = errorMessage.includes('não está definida') || 
                       errorMessage.includes('SUPABASE') ||
                       (error as any)?.isConfigError === true;
  
  const isDnsError = errorMessage.includes('ENOTFOUND') || 
                    causeCode === 'ENOTFOUND' ||
                    errorMessage.includes('getaddrinfo ENOTFOUND');
  
  const isNetworkError = isDnsError ||
                       errorMessage.includes('fetch failed') ||
                       errorMessage.includes('ECONNRESET') ||
                       errorMessage.includes('ECONNREFUSED') ||
                       errorMessage.includes('ENETUNREACH') ||
                       errorMessage.includes('ETIMEDOUT') ||
                       causeCode === 'ECONNRESET' ||
                       causeCode === 'ECONNREFUSED' ||
                       causeCode === 'ENETUNREACH' ||
                       causeCode === 'ETIMEDOUT';

  // Para GET requests com erro de rede, retornar dados vazios em vez de quebrar o frontend
  const shouldReturnEmpty = isNetworkError && !isConfigError;

  return {
    isNetworkError,
    isConfigError,
    isDnsError,
    errorMessage,
    hostname,
    shouldReturnEmpty,
  };
}

export function formatSupabaseErrorResponse(errorInfo: SupabaseErrorInfo) {
  if (errorInfo.isConfigError) {
    return {
      error: 'Erro de configuração',
      details: errorInfo.errorMessage,
      hint: 'Verifique se NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão configuradas no Render',
      troubleshooting: [
        '1. Acesse o dashboard do Render → Environment',
        '2. Verifique se NEXT_PUBLIC_SUPABASE_URL está definida',
        '3. Verifique se SUPABASE_SERVICE_ROLE_KEY está definida',
        '4. Após alterar, faça um novo deploy'
      ]
    };
  }

  if (errorInfo.isDnsError) {
    return {
      error: 'Erro de conexão com Supabase',
      details: `Não foi possível resolver o hostname: ${errorInfo.hostname || 'desconhecido'}`,
      hint: 'O projeto Supabase pode estar pausado ou a URL pode estar incorreta',
      troubleshooting: [
        '1. Acesse https://supabase.com/dashboard',
        '2. Verifique se o projeto ainda existe e está ativo',
        '3. Se estiver pausado, reative o projeto',
        '4. Verifique a URL em Settings → API',
        '5. Confirme que a URL no Render corresponde à URL do Supabase',
        '6. Verifique Network Restrictions no Supabase (Settings → Database)'
      ]
    };
  }

  if (errorInfo.isNetworkError) {
    return {
      error: 'Erro de rede ao conectar com Supabase',
      details: errorInfo.errorMessage,
      hint: 'Problema temporário de conectividade. Tente novamente em alguns instantes.',
      troubleshooting: [
        '1. Verifique se o Supabase está online',
        '2. Verifique logs do Render para mais detalhes',
        '3. Tente novamente em alguns minutos'
      ]
    };
  }

  return {
    error: 'Erro ao processar requisição',
    details: errorInfo.errorMessage
  };
}
