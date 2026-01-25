/**
 * CRÍTICO (credibilidade): Garante que Receita Total / Despesas / Lucro do header
 * sempre coincidem com Entradas / Saídas / Saldo da página Financeiro em /financial.
 * Evita divergência que prejudica credibilidade junto ao cliente.
 *
 * @see ErpLayout (header) e FinancialView (KPIs)
 */

import { test, expect } from '@playwright/test';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

/** "R$ 1.234,56" ou "R$ -1.234,56" -> 1234.56 ou -1234.56 */
function parseCurrencyBR(s) {
  if (!s || typeof s !== 'string') return NaN;
  const t = s.replace(/\s/g, '').replace(/R\$/g, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(t) || NaN;
}

test('E2E Financial - header Receita/Despesas/Lucro = Entradas/Saídas/Saldo da página (credibilidade)', async ({ page }) => {
  await page.goto('/');
  if (!page.url().includes('/login')) await page.goto('/login');
  await page.waitForSelector('#login-email', { timeout: 15000 });
  await page.fill('#login-email', USER.email);
  await page.fill('#login-password', USER.password);
  await page.click('#login-submit-button');
  await page.waitForURL('**/dashboard', { timeout: 20000 });

  await page.click('#menu-financial');
  await page.waitForURL('**/financial', { timeout: 10000 });

  // Aguardar KPIs carregarem (não "Carregando...")
  const entradasVal = page.locator('[data-testid="financial-kpi-entradas-value"]');
  await expect(entradasVal).toBeVisible({ timeout: 15000 });
  await expect(entradasVal).not.toHaveText('Carregando...', { timeout: 20000 });

  const receitaVal = page.locator('[data-testid="header-receita-value"]');
  const despesasVal = page.locator('[data-testid="header-despesas-value"]');
  const lucroVal = page.locator('[data-testid="header-lucro-value"]');
  const saidasVal = page.locator('[data-testid="financial-kpi-saidas-value"]');
  const saldoVal = page.locator('[data-testid="financial-kpi-saldo-value"]');

  await expect(receitaVal).toBeVisible();
  await expect(despesasVal).toBeVisible();
  await expect(lucroVal).toBeVisible();
  await expect(saidasVal).toBeVisible();
  await expect(saldoVal).toBeVisible();

  const hReceita = await receitaVal.innerText();
  const hDespesas = await despesasVal.innerText();
  const hLucro = await lucroVal.innerText();
  const fEntradas = await entradasVal.innerText();
  const fSaidas = await saidasVal.innerText();
  const fSaldo = await saldoVal.innerText();

  const n = (s) => parseCurrencyBR(s);

  expect(n(hReceita)).toBeCloseTo(n(fEntradas), 2);
  expect(n(hDespesas)).toBeCloseTo(n(fSaidas), 2);
  expect(n(hLucro)).toBeCloseTo(n(fSaldo), 2);
});
