import { test, expect } from '@playwright/test';

const USER = {
  email: 'admin@breno-erp.com',
  password: 'Admin@2024',
};

// Happy path: login -> go to Segments -> create new segment -> verify in list
// Uses stable IDs from app/(admin)/segments/_components/SegmentsView.tsx

test.describe('E2E Segments - caminho feliz (criar e listar)', () => {
  test('criar segmento e validar listagem', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('#login-email', USER.email);
    await page.fill('#login-password', USER.password);
    await page.click('#login-submit-button');
    await page.waitForURL('**/dashboard', { timeout: 20000 });

    // Navegar para Segmentos
    await page.click('#menu-segments');
    await page.waitForURL('**/segments', { timeout: 15000 });

    // Abrir formulário de novo segmento
    await page.click('#segments-new-button');

    const unique = Date.now();
    const name = `Segmento E2E ${unique}`;
    const description = `Descrição automática ${unique}`;

    // Preencher e enviar
    await page.fill('#segmentName', name);
    await page.fill('#segmentDescription', description);
    await page.click('#segments-submit-button');

    // Validar exibição na tabela
    const row = page.locator('#segments-table tbody tr', { hasText: name }).first();
    await expect(row).toBeVisible({ timeout: 20000 });
    await expect(row).toContainText(description);
  });
});
