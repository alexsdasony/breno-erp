import { NextRequest, NextResponse } from 'next/server';
import {
  createPluggyWebhook,
  listPluggyWebhooks,
  deletePluggyWebhook
} from '@/lib/pluggyClient';

interface CreateWebhookBody {
  url: string;
  events: string[];
  active?: boolean;
}

/**
 * GET /api/pluggy/webhooks
 * Lista webhooks registrados na Pluggy
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Listando webhooks Pluggy');

    const webhooks = await listPluggyWebhooks();

    return NextResponse.json({
      success: true,
      ...webhooks
    });
  } catch (error) {
    console.error('❌ Erro ao listar webhooks Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pluggy/webhooks
 * Cria um novo webhook na Pluggy
 * 
 * Body:
 * {
 *   "url": "https://seu-dominio.com/api/pluggy/webhook",
 *   "events": ["transactions.updated", "item.updated", "item.error"],
 *   "active": true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Criando webhook Pluggy');

    const body: CreateWebhookBody = await request.json();

    if (!body.url || !body.events || !Array.isArray(body.events)) {
      return NextResponse.json(
        {
          success: false,
          error: 'url e events (array) são obrigatórios'
        },
        { status: 400 }
      );
    }

    const webhook = await createPluggyWebhook({
      url: body.url,
      events: body.events,
      active: body.active !== false
    });

    console.log('✅ Webhook criado:', {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events
    });

    return NextResponse.json({
      success: true,
      webhook
    });
  } catch (error) {
    console.error('❌ Erro ao criar webhook Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido ao criar webhook'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pluggy/webhooks?id=webhook-id
 * Deleta um webhook
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('id');

    if (!webhookId) {
      return NextResponse.json(
        {
          success: false,
          error: 'id do webhook é obrigatório'
        },
        { status: 400 }
      );
    }

    console.log('🗑️ Deletando webhook Pluggy:', webhookId);

    await deletePluggyWebhook(webhookId);

    return NextResponse.json({
      success: true,
      message: 'Webhook deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar webhook Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

