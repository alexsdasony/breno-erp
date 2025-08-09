import { test, expect } from '@playwright/test';
import fs from 'fs';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

test('E2E Products - listar, criar, atualizar e deletar (caminho feliz)', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('#login-email', USER.email);
  await page.fill('#login-password', USER.password);
  await page.click('#login-submit-button');
  await page.waitForURL('**/dashboard', { timeout: 20000 });

  // Navegar para Estoque (Produtos)
  await page.click('#menu-inventory');
  await page.waitForURL('**/inventory', { timeout: 15000 });

  // Listar: garantir visibilidade da tabela
  await expect(page.locator('#products-table')).toBeVisible();

  // Criar produto
  await page.click('#products-new-button');

  const unique = Date.now();
  const name = `Produto E2E ${unique}`;

  // Selecionar primeiro segmento disponível
  const segSel = page.locator('#products-segment-select');
  await segSel.selectOption({ index: 1 });
  await page.fill('#products-name-input', name);
  await page.fill('#products-category-input', 'Categoria E2E');
  await page.fill('#products-stock-input', '10');
  await page.fill('#products-minStock-input', '2');
  await page.fill('#products-price-input', '199.90');
  await page.click('#products-submit-button');

  // Toasts
  const successToast = page.locator('[id^="toast-default-"], [id^="toast-success-"]');
  const errorToast = page.locator('[id^="toast-destructive-"]');
  await Promise.race([
    successToast.first().waitFor({ state: 'visible', timeout: 15000 }),
    errorToast.first().waitFor({ state: 'visible', timeout: 15000 })
  ]);
  if (await errorToast.first().isVisible()) {
    const txt = await errorToast.first().innerText();
    throw new Error('Toast de erro exibido: ' + txt);
  }

  // Validar criação: primeira linha deve conter id e nome
  const firstRow = page.locator('tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 10000 });
  const createdRowId = await firstRow.getAttribute('id');
  expect(createdRowId).toBeTruthy();
  await expect(firstRow).toContainText(name);

  // Extrair o id criado a partir do atributo id="products-row-<id>"
  const createdId = createdRowId.replace('products-row-', '');

  // Atualizar: abrir edição e mudar preço
  await page.click(`#products-edit-button-${createdId}`);
  await page.fill('#products-price-input', '249.90');
  await page.click('#products-submit-button');

  await Promise.race([
    successToast.first().waitFor({ state: 'visible', timeout: 15000 }),
    errorToast.first().waitFor({ state: 'visible', timeout: 15000 })
  ]);
  if (await errorToast.first().isVisible()) {
    const txt = await errorToast.first().innerText();
    throw new Error('Toast de erro exibido ao atualizar: ' + txt);
  }

  // Deletar
  await page.click(`#products-delete-button-${createdId}`);
  await page.click('#products-confirm-delete-button');
  await Promise.race([
    successToast.first().waitFor({ state: 'visible', timeout: 15000 }),
    errorToast.first().waitFor({ state: 'visible', timeout: 15000 })
  ]);
  if (await errorToast.first().isVisible()) {
    const txt = await errorToast.first().innerText();
    throw new Error('Toast de erro exibido ao deletar: ' + txt);
  }

  // Validar ausência da linha
  await expect(page.locator(`#products-row-${createdId}`)).toHaveCount(0);
});



