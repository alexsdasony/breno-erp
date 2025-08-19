import { test, expect } from '@playwright/test';

const USER = {
  email: 'admin@breno-erp.com',
  password: 'Admin@2024',
};

test.describe('E2E - Cost Centers CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[type="email"]', USER.email);
    await page.fill('input[type="password"]', USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 20000 });
  });

  test('criar centro de custo', async ({ page }) => {
    // Navegar para Centros de Custo
    await page.click('#menu-cost-centers');
    await page.waitForURL('**/cost-centers', { timeout: 10000 });

    const unique = Date.now();
    const name = `Centro de Custo E2E ${unique}`;

    // Criar
    await page.click('#cost-centers-new-button');
    await page.fill('#costCenterName', name);
    await page.fill('#costCenterDescription', 'Descrição automática de teste');
    await page.fill('#costCenterBudget', '10000');
    await page.fill('#costCenterManager', 'Gerente Teste');
    await page.click('#cost-centers-submit-button');

    // Verificar criação em lista
    await expect(page.locator('table')).toContainText(name);
  });

  test('excluir centro de custo mais recente', async ({ page }) => {
    // Navegar para Centros de Custo
    await page.click('#menu-cost-centers');
    await page.waitForURL('**/cost-centers', { timeout: 10000 });

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
