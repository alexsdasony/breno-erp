#!/usr/bin/env node
import cron from 'node-cron';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

const envFile = process.env.PLUGGY_ENV_FILE || '.env.local';
dotenv.config({ path: envFile });

const targetUrl = process.env.PLUGGY_SYNC_URL || 'http://localhost:3000/api/pluggy/sync';
const serviceToken = process.env.PLUGGY_SYNC_SERVICE_TOKEN || '';
const defaultItemId = process.env.PLUGGY_DEFAULT_CONNECTION_ID || undefined;
const cronExpression = process.env.PLUGGY_CRON_EXPRESSION || '0 */6 * * *'; // A cada 6 horas por padrão
const timezone = process.env.PLUGGY_CRON_TZ || 'America/Sao_Paulo';

async function runSync(trigger = 'manual') {
  const startedAt = new Date();
  console.log(`🕗 [Pluggy Cron] Iniciando sincronização (${trigger}) às ${startedAt.toISOString()}`);

  try {
    const body = {};
    if (defaultItemId) {
      body.itemId = defaultItemId;
    }

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(serviceToken ? { Authorization: `Bearer ${serviceToken}` } : {})
      },
      body: JSON.stringify(body)
    });

    const result = await response.json().catch(() => ({}));
    const finishedAt = new Date();

    console.log(`✅ [Pluggy Cron] Finalizado em ${finishedAt.toISOString()} (duração ${(finishedAt.getTime() - startedAt.getTime()) / 1000}s)`, {
      status: response.status,
      summary: result
    });

    if (!response.ok) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('❌ [Pluggy Cron] Erro durante sincronização:', error);
    process.exitCode = 1;
  }
}

console.log('⏰ [Pluggy Cron] Agendando sincronização', {
  expression: cronExpression,
  timezone,
  targetUrl,
  defaultItemId: defaultItemId || 'não configurado'
});

cron.schedule(cronExpression, () => runSync('agendado'), { timezone });

if (process.env.PLUGGY_CRON_RUN_ON_START !== 'false') {
  runSync('inicial');
}


