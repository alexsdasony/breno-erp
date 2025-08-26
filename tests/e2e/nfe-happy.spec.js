import { test, expect } from '@playwright/test';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

// Happy path: login -> go to NF-e -> create a new NF-e -> verify in list

test.describe('E2E NFe - caminho feliz (criar e listar)', () => {
  test('criar NF-e e validar listagem', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('#login-email', USER.email);
    await page.fill('#login-password', USER.password);
    await page.click('#login-submit-button');
    await page.waitForURL('**/dashboard', { timeout: 20000 });

    // Navegar para NF-e
    await page.click('#menu-nfe');
    await page.waitForURL('**/nfe', { timeout: 15000 });

    const unique = Date.now();
    const customer = `Cliente NF-e E2E ${unique}`;
    const invoice = `NF${unique}`;

    // Preencher formulário
    await page.getByPlaceholder('Cliente').fill(customer);
    await page.getByPlaceholder('Número').fill(invoice);
    // A data já vem preenchida; total e imposto são 0 inicialmente
    await page.getByPlaceholder('Total').fill('100.50');
    await page.getByPlaceholder('Imposto').fill('10.00');
    await page.getByPlaceholder('Status').fill('pending');

    await page.getByRole('button', { name: 'Adicionar' }).click();

    // Validar item na lista
    const item = page.locator('div.border.rounded', { hasText: customer });
    await expect(item).toBeVisible({ timeout: 20000 });
    await expect(item).toContainText(invoice);
  });
});
