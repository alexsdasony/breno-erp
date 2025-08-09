import { test, expect } from '@playwright/test';

const USER = {
  email: 'admin@breno-erp.com',
  password: 'Admin@2024',
};

test.describe('E2E - Segments CRUD', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Login
    await page.fill('input[type="email"]', USER.email);
    await page.fill('input[type="password"]', USER.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard', { timeout: 20000 });
  });

  test('criar, editar e excluir segmento', async ({ page }) => {
    // Navegar para Segmentos
    await page.click('#menu-segments');
    await page.waitForURL('**/segments', { timeout: 10000 });

    const unique = Date.now();
    const name = `Segmento E2E ${unique}`;
    const nameUpdated = `${name} - Editado`;

    // Criar
    await page.click('#segments-new-button');
    await page.fill('#segmentName', name);
    await page.fill('#segmentDescription', 'Descrição automática de teste');
    await page.click('#segments-submit-button');

    // Verificar criação em lista
    await expect(page.locator('table')).toContainText(name);

    // Editar (primeiro item correspondente)
    const row = page.locator('tbody tr', { hasText: name }).first();
    await row.locator(`#segments-edit-:text-is(${name})`).click({ trial: true }).catch(async () => {
      await row.locator('button[title="Editar"]').click();
    });
    await page.fill('#segmentName', nameUpdated);
    await page.click('#segments-submit-button');
    await expect(page.locator('tbody tr', { hasText: nameUpdated }).first()).toBeVisible({ timeout: 15000 });

    // Excluir
    const rowUpdated = page.locator('tbody tr', { hasText: nameUpdated }).first();
    await rowUpdated.locator('button[title="Excluir"]').click();
    // Confirmar no dialog
    await expect(page.locator('text=Você tem certeza?')).toBeVisible();
    const confirmButtons = page.locator('button:has-text("Excluir")');
    await confirmButtons.nth(1).click();

    // Validar remoção (pode levar um tempo para refletir)
    await expect(page.locator('tbody')).not.toContainText(nameUpdated, { timeout: 15000 });
  });
});


