import { test, expect } from '@playwright/test';

const USER = {
  email: 'admin@breno-erp.com',
  password: 'Admin@2024',
};

test.describe('E2E - Billings CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[type="email"]', USER.email);
    await page.fill('input[type="password"]', USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 20000 });
  });

  test('criar cobrança', async ({ page }) => {
    // Navegar para Cobranças
    await page.click('#menu-billing');
    await page.waitForURL('**/billing', { timeout: 10000 });

    const unique = Date.now();
    const invoiceNumber = `INV-${unique}`;

    // Criar
    await page.click('#billing-new-button');
    await page.fill('#billingInvoiceNumber', invoiceNumber);
    await page.fill('#billingAmount', '1500.00');
    await page.fill('#billingTaxAmount', '150.00');
    await page.fill('#billingTotalAmount', '1650.00');
    await page.click('#billing-submit-button');

    // Verificar criação em lista
    await expect(page.locator('table')).toContainText(invoiceNumber);
  });

  test('excluir cobrança mais recente', async ({ page }) => {
    // Navegar para Cobranças
    await page.click('#menu-billing');
    await page.waitForURL('**/billing', { timeout: 10000 });

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
