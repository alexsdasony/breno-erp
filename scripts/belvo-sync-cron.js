#!/usr/bin/env node
import cron from 'node-cron';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

const envFile = process.env.BELVO_ENV_FILE || '.env.local';
dotenv.config({ path: envFile });

const targetUrl = process.env.BELVO_SYNC_URL || 'http://localhost:3000/api/belvo/sync';
const serviceToken = process.env.BELVO_SYNC_SERVICE_TOKEN || '';
const defaultLink = process.env.BELVO_DEFAULT_LINK_ID || undefined;
const cronExpression = process.env.BELVO_CRON_EXPRESSION || '0 8 * * *';
const timezone = process.env.BELVO_CRON_TZ || 'America/Sao_Paulo';

async function runSync(trigger = 'manual') {
  const startedAt = new Date();
  console.log(`🕗 [Belvo Cron] Iniciando sincronização (${trigger}) às ${startedAt.toISOString()}`);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(serviceToken ? { Authorization: `Bearer ${serviceToken}` } : {})
      },
      body: JSON.stringify({
        linkId: defaultLink
      })
    });

    const result = await response.json().catch(() => ({}));
    const finishedAt = new Date();

    console.log(`✅ [Belvo Cron] Finalizado em ${finishedAt.toISOString()} (duração ${(finishedAt.getTime() - startedAt.getTime()) / 1000}s)`, {
      status: response.status,
      summary: result
    });

    if (!response.ok) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error('❌ [Belvo Cron] Erro durante sincronização:', error);
    process.exitCode = 1;
  }
}

console.log('⏰ [Belvo Cron] Agendando sincronização diária', {
  expression: cronExpression,
  timezone,
  targetUrl
});

cron.schedule(cronExpression, () => runSync('agendado'), { timezone });

if (process.env.BELVO_CRON_RUN_ON_START !== 'false') {
  runSync('inicial');
}



