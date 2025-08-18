import { test, expect } from '@playwright/test';
import fs from 'fs';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

test('E2E Products - criar e listar produto (caminho feliz)', async ({ page }) => {
  // Login
  await page.goto('/');
  if (!page.url().includes('/login')) {
    await page.goto('/login');
  }
  await page.waitForSelector('#login-email', { timeout: 15000 });
  await page.fill('#login-email', USER.email);
  await page.fill('#login-password', USER.password);
  await page.click('#login-submit-button');
  await page.waitForURL('**/dashboard', { timeout: 20000 });

  // Navegar para Estoque (Produtos)
  await page.click('#menu-inventory');
  await page.waitForURL('**/inventory', { timeout: 10000 });

  // Garantir que a tabela existe
  await expect(page.locator('#inventory-table')).toBeVisible();

  // Criar novo produto
  await page.click('#inventory-new-button');

  // Aguardar formulário aparecer
  await page.waitForSelector('#productName', { timeout: 5000 });

  // Preencher formulário
  const unique = Date.now();
  const productName = `Produto E2E ${unique}`;
  
  // Preencher formulário - aguardar campos estarem disponíveis
  await page.waitForSelector('#productName', { timeout: 5000 });
  await page.fill('#productName', productName);
  await page.fill('#productCategory', 'Eletrônicos');
  await page.fill('#productPrice', '299.99');
  await page.fill('#productCost', '150.00');
  await page.fill('#productStock', '15');
  await page.fill('#productMinStock', '3');
  
  // Selecionar primeiro segmento disponível
  const segmentOptions = await page.locator('#productSegment option').count();
  if (segmentOptions > 1) {
    await page.selectOption('#productSegment', { index: 1 });
  }

  await page.click('#inventory-submit-button');

  // Verificar toast de sucesso
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

  // Aguardar o produto aparecer na tabela (sem reload - usa refetch automático do hook)
  await page.waitForTimeout(3000); // Aguardar refetch automático

  // Listar: verificar se produto aparece na tabela procurando por nome
  const productRow = page.locator(`tr:has-text("${productName}")`).first();
  await expect(productRow).toBeVisible({ timeout: 10000 });
});




