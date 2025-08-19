import { test, expect } from '@playwright/test';
import fs from 'fs';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

test('E2E Financial - listar e criar transação (caminho feliz)', async ({ page }) => {
  // Login
  await page.goto('/');
  // Garantir que estamos na tela de login
  if (!page.url().includes('/login')) {
    await page.goto('/login');
  }
  await page.waitForSelector('#login-email', { timeout: 15000 });
  await page.fill('#login-email', USER.email);
  await page.fill('#login-password', USER.password);
  await page.click('#login-submit-button');
  await page.waitForURL('**/dashboard', { timeout: 20000 });

  // Ir para Financeiro
  await page.click('#menu-financial');
  await page.waitForURL('**/financial', { timeout: 10000 });

  // Garantir que a tabela existe
  await expect(page.locator('#financial-transactions-table')).toBeVisible();

  // Criar nova transação receita simples
  await page.click('#financial-new-transaction-button');

  // Preencher formulário
  // Selecionar segmento (pegar primeiro option válido)
  const segmentSelect = page.locator('#financial-segment-select');
  await segmentSelect.selectOption({ index: 1 });

  await page.selectOption('#financial-type-select', 'receita');
  const unique = Date.now();
  const desc = `Receita E2E ${unique}`;
  await page.fill('#financial-description-input', desc);
  await page.fill('#financial-category-input', 'Vendas');
  await page.fill('#financial-amount-input', '123.45');
  await page.fill('#financial-date-input', '2025-08-09');

  await page.click('#financial-submit-button');

  // Verificar toast de sucesso e falha o teste se erro
  const successToast = page.locator('[id^="toast-default-"], [id^="toast-success-"]');
  const errorToast = page.locator('[id^="toast-destructive-"]');
  await Promise.race([
    successToast.first().waitFor({ state: 'visible', timeout: 15000 }),
    errorToast.first().waitFor({ state: 'visible', timeout: 15000 })
  ]);

  if (await errorToast.first().isVisible()) {
    const txt = await errorToast.first().innerText();
    throw new Error('Toast de erro exibido: ' + txt);
  }

  // Verificação robusta: consultar diretamente a Edge Function até encontrar a descrição
  const envText = fs.readFileSync('env.example', 'utf-8');
  const getEnv = (k) => (envText.match(new RegExp('^' + k + '=(.*)$', 'm')) || [null, ''])[1].trim();
  const baseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!baseUrl || !anonKey) {
    throw new Error('Variáveis do Supabase não encontradas em env.example');
  }

  const apiBase = `${baseUrl}/functions/v1`;
  const deadline = Date.now() + 20000;
  let found = false;
  while (Date.now() < deadline && !found) {
    const resp = await page.request.get(`${apiBase}/transactions`, {
      headers: { Authorization: `Bearer ${anonKey}`, apikey: anonKey }
    });
    expect(resp.ok()).toBeTruthy();
    const body = await resp.json();
    const arr = body.transactions || body.data || [];
    found = Array.isArray(arr) && arr.some((t) => (t.description || '').includes(desc));
    if (!found) await page.waitForTimeout(1000);
  }
  expect(found, 'Transação recém-criada não foi encontrada via API').toBeTruthy();
});


