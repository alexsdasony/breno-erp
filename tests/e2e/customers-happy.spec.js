import { test, expect } from '@playwright/test';
import fs from 'fs';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

test('E2E Customers - listar e criar cliente (caminho feliz)', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('#login-email', USER.email);
  await page.fill('#login-password', USER.password);
  await page.click('#login-submit-button');
  await page.waitForURL('**/dashboard', { timeout: 20000 });

  // Ir para Clientes
  await page.click('#menu-customers');
  await page.waitForURL('**/customers', { timeout: 10000 });

  // Abrir modal novo cliente
  await page.click('#customers-new-button');

  // Preencher formulário
  const unique = Date.now();
  const name = `Cliente E2E ${unique}`;
  await page.selectOption('#customers-segment-select', { index: 1 });
  await page.fill('#customers-name-input', name);
  await page.selectOption('#customers-person-type-select', 'pf');
  await page.fill('#customers-doc-input', `${unique}`);
  await page.fill('#customers-email-input', `e2e${unique}@mail.com`);

  await page.click('#customers-submit-button');

  // Verificar toast
  const successToast = page.locator('[id^="toast-default-"], [id^="toast-success-"]');
  const errorToast = page.locator('[id^="toast-destructive-"]');
  await Promise.race([
    successToast.first().waitFor({ state: 'visible', timeout: 15000 }),
    errorToast.first().waitFor({ state: 'visible', timeout: 15000 })
  ]);
  if (await errorToast.first().isVisible()) {
    throw new Error('Falha no toast de cliente');
  }

  // Ler o id diretamente da primeira linha (lista ordenada desc) e validar presença
  const firstRow = page.locator('tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 10000 });
  const rowId = await firstRow.getAttribute('id');
  expect(rowId).toBeTruthy();
  // Confirmar que a linha do topo contém o nome
  await expect(firstRow).toContainText(name);
});


