import { NextRequest, NextResponse } from 'next/server';

interface CreateConnectTokenBody {
  language?: string;
  country?: string;
  institution?: string;
  connector?: string;
  webhookUrl?: string;
  clientUserId?: string;
}

/**
 * POST /api/pluggy/connect-token
 * Cria um Connect Token para usar com o Pluggy Connect Widget
 * 
 * Implementação simplificada que faz as chamadas diretas à API Pluggy
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔗 Criando Connect Token Pluggy');

    const body: CreateConnectTokenBody = await request.json().catch(() => ({}));

    // 1. Obter API Key da Pluggy
    const authRes = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET,
      }),
    });

    if (!authRes.ok) {
      const errorText = await authRes.text();
      throw new Error(`Erro ao obter API Key: ${authRes.status} - ${errorText}`);
    }

    const { apiKey } = await authRes.json();

    if (!apiKey) {
      throw new Error('API Key não retornada pela Pluggy');
    }

    // 2. Criar Connect Token
    const tokenRes = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: body.language || 'pt',
        country: body.country,
        institution: body.institution,
        connector: body.connector,
        webhookUrl: body.webhookUrl,
        clientUserId: body.clientUserId,
      }),
    });

    if (!tokenRes.ok) {
      const errorText = await tokenRes.text();
      throw new Error(`Erro ao criar Connect Token: ${tokenRes.status} - ${errorText}`);
    }

    const data = await tokenRes.json();

    // A Pluggy pode retornar 'accessToken' ou 'connectToken'
    const connectToken = data.connectToken || data.accessToken;

    console.log('✅ Connect Token criado:', {
      connectToken: connectToken?.substring(0, 20) + '...',
      expiresAt: data.expiresAt
    });

    return NextResponse.json({
      success: true,
      connectToken, // Garantir que sempre retorne como 'connectToken'
      ...data
    });
  } catch (error) {
    console.error('❌ Erro ao criar Connect Token Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao criar Connect Token'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pluggy/connect-token
 * Método GET para facilitar testes (usa parâmetros padrão)
 */
export async function GET(request: NextRequest) {
  try {
    // Obter API Key
    const authRes = await fetch('https://api.pluggy.ai/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: process.env.PLUGGY_CLIENT_ID,
        clientSecret: process.env.PLUGGY_CLIENT_SECRET,
      }),
    });

    if (!authRes.ok) {
      throw new Error('Erro ao obter API Key');
    }

    const { apiKey } = await authRes.json();

    // Criar Connect Token com padrão
    const tokenRes = await fetch('https://api.pluggy.ai/connect_token', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: 'pt',
      }),
    });

    if (!tokenRes.ok) {
      throw new Error('Erro ao criar Connect Token');
    }

    const data = await tokenRes.json();

    // A Pluggy pode retornar 'accessToken' ou 'connectToken'
    const connectToken = data.connectToken || data.accessToken;

    return NextResponse.json({
      success: true,
      connectToken, // Garantir que sempre retorne como 'connectToken'
      ...data
    });
  } catch (error) {
    console.error('❌ Erro connect-token:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create connect token' 
      },
      { status: 500 }
    );
  }
}

