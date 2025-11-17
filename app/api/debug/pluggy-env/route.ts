import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/debug/pluggy-env
 * Rota de debug para verificar se as variáveis de ambiente Pluggy estão configuradas
 * 
 * ⚠️ ATENÇÃO: Esta rota expõe informações sensíveis. Remover em produção ou proteger com autenticação.
 */
export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;
    const env = process.env.PLUGGY_ENV;
    const syncToken = process.env.SYNC_SECRET_TOKEN;

    // Listar todas as variáveis que começam com PLUGGY
    const allPluggyVars = Object.keys(process.env)
      .filter(key => key.includes('PLUGGY'))
      .reduce((acc, key) => {
        const value = process.env[key];
        acc[key] = {
          exists: !!value,
          length: value?.length || 0,
          prefix: value?.substring(0, 5) || 'N/A',
        };
        return acc;
      }, {} as Record<string, { exists: boolean; length: number; prefix: string }>);

    return NextResponse.json({
      success: true,
      environment: {
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
        hasEnv: !!env,
        hasSyncToken: !!syncToken,
        envValue: env || 'not set',
        clientIdLength: clientId?.length || 0,
        clientSecretLength: clientSecret?.length || 0,
        clientIdPrefix: clientId?.substring(0, 5) || 'N/A',
        allPluggyVars,
      },
      message: clientId && clientSecret 
        ? '✅ Variáveis Pluggy configuradas corretamente'
        : '❌ Variáveis Pluggy não configuradas',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

