import { test, expect, chromium } from '@playwright/test';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

test('E2E Products - editar produto existente', async ({ page, browser }) => {
  
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
  
  // Aguardar carregamento da tabela
  await page.waitForTimeout(2000);
  
  // Fechar browser e reabrir para testar edição com nova sessão
  await browser.close();
  
  // Reabrir browser
  const newBrowser = await chromium.launch({ headless: false });
  const newContext = await newBrowser.newContext();
  const newPage = await newContext.newPage();
  
  // Fazer login novamente
  await newPage.goto('http://localhost:3000/');
  if (!newPage.url().includes('/login')) {
    await newPage.goto('http://localhost:3000/login');
  }
  await newPage.waitForSelector('#login-email', { timeout: 15000 });
  await newPage.fill('#login-email', USER.email);
  await newPage.fill('#login-password', USER.password);
  await newPage.click('#login-submit-button');
  await newPage.waitForURL('**/dashboard', { timeout: 20000 });

  // Navegar para Estoque (Produtos)
  await newPage.click('#menu-inventory');
  await newPage.waitForURL('**/inventory', { timeout: 10000 });

  // Garantir que a tabela existe
  await expect(newPage.locator('#inventory-table')).toBeVisible();
  
  // Aguardar carregamento da tabela
  await newPage.waitForTimeout(2000);
  
  // Pegar o primeiro produto da lista para editar
  const firstProductRow = newPage.locator('#inventory-table tbody tr').first();
  await expect(firstProductRow).toBeVisible({ timeout: 10000 });
  
  // Clicar no primeiro botão de editar da tabela (sem depender do ID)
  const firstEditButton = newPage.locator('#inventory-table tbody tr').first().locator('button[title="Editar"]');
  await firstEditButton.click();
  
  // Aguardar modal abrir e campos serem preenchidos
  await newPage.waitForSelector('#productName', { timeout: 5000 });
  
  // Alterar TODOS os campos
  const editedData = {
    name: 'Produto Editado E2E',
    price: '599.99',
    stock: '50',
    minStock: '5',
    category: 'Categoria Editada',
    description: 'Descrição editada pelo teste E2E'
  };
  
  await newPage.fill('#productName', editedData.name);
  await newPage.fill('#productPrice', editedData.price);
  await newPage.fill('#productStock', editedData.stock);
  await newPage.fill('#productMinStock', editedData.minStock);
  await newPage.fill('#productCategory', editedData.category);
  await newPage.fill('#productDescription', editedData.description);
  
  // Salvar alterações
  await newPage.click('#inventory-submit-button');
  
  // Verificar toast de sucesso
  const newSuccessToast = newPage.locator('[data-state="open"]:has-text("sucesso")');
  const newErrorToast = newPage.locator('[data-state="open"]:has-text("erro")');
  
  await Promise.race([
    newSuccessToast.first().waitFor({ state: 'visible', timeout: 15000 }),
    newErrorToast.first().waitFor({ state: 'visible', timeout: 15000 })
  ]);

  if (await newErrorToast.first().isVisible()) {
    const txt = await newErrorToast.first().innerText();
    throw new Error('Toast de erro exibido na edição: ' + txt);
  }

  // Aguardar refetch automático após edição
  await newPage.waitForTimeout(3000);
  
  // Verificar se as alterações aparecem na tabela (primeiro produto)
  const updatedRow = newPage.locator('#inventory-table tbody tr').first();
  await expect(updatedRow).toContainText(editedData.name);
  await expect(updatedRow).toContainText(editedData.price.replace('.', ','));
  
  // Fechar novo browser
  await newBrowser.close();
});
