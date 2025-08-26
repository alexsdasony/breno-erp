import { test, expect } from '@playwright/test';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

// Happy path: login -> go to Reports -> see heading and helper text

test.describe('E2E Reports - caminho feliz (abrir página)', () => {
  test('abrir Relatórios e verificar conteúdo básico', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('#login-email', USER.email);
    await page.fill('#login-password', USER.password);
    await page.click('#login-submit-button');
    await page.waitForURL('**/dashboard', { timeout: 20000 });

    // Navegar para Relatórios
    await page.click('#menu-reports');
    await page.waitForURL('**/reports', { timeout: 15000 });

    // Validar conteúdo básico
    await expect(page.getByRole('heading', { name: 'Relatórios' })).toBeVisible();
    await expect(page.getByText('Selecione um relatório no menu ou implemente filtros aqui.')).toBeVisible();
  });
});
