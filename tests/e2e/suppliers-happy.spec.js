import { test, expect } from '@playwright/test';
import fs from 'fs';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

test('E2E Suppliers - listar e criar fornecedor (caminho feliz)', async ({ page }) => {
  await page.goto('/login');
  await page.fill('#login-email', USER.email);
  await page.fill('#login-password', USER.password);
  await page.click('#login-submit-button');
  await page.waitForURL('**/dashboard', { timeout: 20000 });

  await page.click('#menu-suppliers');
  await page.waitForURL('**/suppliers', { timeout: 10000 });

  await page.click('#suppliers-new-button');

  const unique = Date.now();
  const name = `Fornecedor E2E ${unique}`;
  await page.selectOption('#suppliers-segment-select', { index: 1 });
  await page.fill('#suppliers-name-input', name);
  await page.fill('#suppliers-doc-input', String(unique));
  await page.fill('#suppliers-email-input', `for${unique}@mail.com`);
  await page.click('#suppliers-submit-button');

  const successToast = page.locator('[id^="toast-default-"], [id^="toast-success-"]');
  const errorToast = page.locator('[id^="toast-destructive-"]');
  await Promise.race([
    successToast.first().waitFor({ state: 'visible', timeout: 15000 }),
    errorToast.first().waitFor({ state: 'visible', timeout: 15000 })
  ]);
  if (await errorToast.first().isVisible()) throw new Error('Falha no toast de fornecedor');

  // Ler o id diretamente da primeira linha e validar
  const firstRow = page.locator('tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 10000 });
  const rowId = await firstRow.getAttribute('id');
  expect(rowId).toBeTruthy();
  await expect(firstRow).toContainText(name);
});


