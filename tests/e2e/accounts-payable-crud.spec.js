import { test, expect } from '@playwright/test';

const USER = {
  email: 'admin@breno-erp.com',
  password: 'Admin@2024',
};

test.describe('E2E - Accounts Payable CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[type="email"]', USER.email);
    await page.fill('input[type="password"]', USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 20000 });
  });

  test('criar conta a pagar', async ({ page }) => {
    // Navegar para Contas a Pagar
    await page.click('#menu-accounts-payable');
    await page.waitForURL('**/accounts-payable', { timeout: 10000 });

    const unique = Date.now();
    const description = `Conta E2E ${unique}`;

    // Criar
    await page.click('#accounts-payable-new-button');
    await page.fill('#accountsPayableDescription', description);
    await page.fill('#accountsPayableAmount', '1200.00');
    await page.click('#accounts-payable-submit-button');

    // Verificar criação em lista
    await expect(page.locator('table')).toContainText(description);
  });

  test('excluir conta a pagar mais recente', async ({ page }) => {
    // Navegar para Contas a Pagar
    await page.click('#menu-accounts-payable');
    await page.waitForURL('**/accounts-payable', { timeout: 10000 });

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
