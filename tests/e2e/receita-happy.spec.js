import { test, expect } from '@playwright/test';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

// Happy path: login -> go to Receita -> perform CPF and CNPJ queries and see a result area update

test.describe('E2E Receita - caminho feliz (consultas CPF/CNPJ)', () => {
  test('consultar CPF e CNPJ e exibir resultado', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('#login-email', USER.email);
    await page.fill('#login-password', USER.password);
    await page.click('#login-submit-button');
    await page.waitForURL('**/dashboard', { timeout: 20000 });

    // Navegar para Receita Federal
    await page.click('#menu-receita');
    await page.waitForURL('**/receita', { timeout: 15000 });

    // Consultar CPF
    await page.getByPlaceholder('Digite o CPF').fill('12345678901');
    await page.getByRole('button', { name: 'Consultar CPF' }).click();

    // Deve atualizar a área de resultado (stringify)
    await expect(page.locator('pre')).not.toHaveText('Sem resultado.', { timeout: 15000 });

    // Consultar CNPJ
    await page.getByPlaceholder('Digite o CNPJ').fill('12345678000199');
    await page.getByRole('button', { name: 'Consultar CNPJ' }).click();

    // Deve atualizar novamente
    await expect(page.locator('pre')).not.toHaveText('Sem resultado.', { timeout: 15000 });
  });
});
