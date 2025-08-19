import { test, expect } from '@playwright/test';

const USER = {
  email: 'admin@breno-erp.com',
  password: 'Admin@2024',
};

test.describe('E2E - Chart of Accounts CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[type="email"]', USER.email);
    await page.fill('input[type="password"]', USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 20000 });
  });

  test('criar conta contábil', async ({ page }) => {
    // Navegar para Plano de Contas
    await page.click('#menu-chart-of-accounts');
    await page.waitForURL('**/chart-of-accounts', { timeout: 10000 });

    const unique = Date.now();
    const accountCode = `${unique}`;
    const accountName = `Conta E2E ${unique}`;

    // Criar
    await page.click('#chart-of-accounts-new-button');
    await page.fill('#chartOfAccountsCode', accountCode);
    await page.fill('#chartOfAccountsName', accountName);
    await page.selectOption('#chartOfAccountsType', 'asset');
    await page.click('#chart-of-accounts-submit-button');

    // Verificar criação em lista
    await expect(page.locator('table')).toContainText(accountName);
  });

  test('excluir conta contábil mais recente', async ({ page }) => {
    // Navegar para Plano de Contas
    await page.click('#menu-chart-of-accounts');
    await page.waitForURL('**/chart-of-accounts', { timeout: 10000 });

    // Aguardar carregamento da tabela
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Excluir primeiro item (mais recente)
    const firstRow = page.locator('table tbody tr').first();
    await firstRow.locator('button[title="Excluir"]').click();

    // Confirmar no dialog
    await expect(page.locator('text=Você tem certeza?')).toBeVisible();
    await page.locator('button:has-text("Excluir")').last().click();

    // Aguardar confirmação da exclusão
    await page.waitForTimeout(2000);
  });
});
