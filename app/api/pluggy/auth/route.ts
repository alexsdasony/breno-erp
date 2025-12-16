import { NextRequest, NextResponse } from 'next/server';
import { getPluggyApiKey } from '@/lib/pluggyAuth';

/**
 * POST /api/pluggy/auth
 * Obtém a API Key da Pluggy (opcional, só no server)
 * 
 * Esta rota é útil para debug ou quando você precisa da API Key no servidor.
 * Normalmente, a API Key é obtida automaticamente pelo cliente Pluggy.
 * 
 * Retorna: { apiKey: string, expiresAt: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔑 Obtendo API Key Pluggy');

    const apiKey = await getPluggyApiKey();

    // Não retornar a API Key completa por segurança (apenas primeiros caracteres para debug)
    const maskedKey = apiKey.substring(0, 20) + '...';

    console.log('✅ API Key obtida:', maskedKey);

    return NextResponse.json({
      success: true,
      apiKey, // Retornar completa para uso no servidor
      masked: maskedKey, // Versão mascarada para logs
      message: 'API Key obtida com sucesso. Use no header X-API-KEY nas requisições.'
    });
  } catch (error) {
    console.error('❌ Erro ao obter API Key Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao obter API Key'
      },
      { status: 500 }
    );
  }
}

// GET para verificação/health check
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Endpoint de autenticação Pluggy ativo',
    endpoint: '/api/pluggy/auth',
    method: 'POST',
    description: 'Use POST para obter a API Key'
  });
}


