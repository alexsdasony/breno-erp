import { test, expect } from '@playwright/test';

const USER = {
  email: 'admin@breno-erp.com',
  password: 'Admin@2024',
};

test.describe('E2E - Sales CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[type="email"]', USER.email);
    await page.fill('input[type="password"]', USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 20000 });
  });

  test('criar venda', async ({ page }) => {
    // Navegar para Vendas
    await page.click('#menu-sales');
    await page.waitForURL('**/sales', { timeout: 10000 });

    const unique = Date.now();
    const saleValue = '2500.00';

    // Criar
    await page.click('#sales-new-button');
    await page.fill('#salesTotalAmount', saleValue);
    await page.fill('#salesFinalAmount', saleValue);
    await page.selectOption('#salesPaymentMethod', 'credit_card');
    await page.click('#sales-submit-button');

    // Verificar criação em lista
    await expect(page.locator('table')).toContainText(saleValue);
  });

  test('excluir venda mais recente', async ({ page }) => {
    // Navegar para Vendas
    await page.click('#menu-sales');
    await page.waitForURL('**/sales', { timeout: 10000 });

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
