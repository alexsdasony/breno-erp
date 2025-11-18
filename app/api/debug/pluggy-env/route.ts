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

    // Listar todas as variáveis de ambiente (primeiras 30 para debug)
    const allEnvKeys = Object.keys(process.env).slice(0, 30);
    const allEnvKeysWithPluggy = Object.keys(process.env).filter(k => k.includes('PLUGGY'));

    // Verificar se há variáveis similares (com typos)
    const similarKeys = Object.keys(process.env).filter(k => 
      k.toLowerCase().includes('plug') || 
      k.toLowerCase().includes('client') ||
      k.toLowerCase().includes('secret')
    );

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
        // Informações de debug adicionais
        debug: {
          totalEnvVars: Object.keys(process.env).length,
          allPluggyKeysFound: allEnvKeysWithPluggy,
          similarKeysFound: similarKeys,
          sampleEnvKeys: allEnvKeys,
          nodeEnv: process.env.NODE_ENV,
          renderServiceId: process.env.RENDER_SERVICE_ID || 'not set',
          renderInstanceId: process.env.RENDER_INSTANCE_ID || 'not set',
        }
      },
      message: clientId && clientSecret 
        ? '✅ Variáveis Pluggy configuradas corretamente'
        : '❌ Variáveis Pluggy não configuradas',
      troubleshooting: !clientId || !clientSecret ? {
        step1: 'Verifique se as variáveis foram adicionadas DIRETAMENTE no serviço (não apenas no Environment Group)',
        step2: 'Verifique se os nomes estão corretos: PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET (case-sensitive)',
        step3: 'REINICIE o serviço após adicionar as variáveis (Manual Deploy ou Restart)',
        step4: 'Verifique se o domínio customizado aponta para o serviço correto',
        step5: 'Aguarde 2-5 minutos após reiniciar para as variáveis serem carregadas',
      } : null,
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

