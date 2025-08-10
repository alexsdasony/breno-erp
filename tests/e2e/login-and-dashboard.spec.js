import { test, expect } from '@playwright/test';

test.describe('Login e Dashboard - Teste Completo', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página de login
    await page.goto('http://localhost:3000/login');
  });

  test('Login completo e acesso ao dashboard', async ({ page }) => {
    // 1. Verificar se a página de login carrega
    await expect(page.locator('h1')).toContainText('ERP PRO');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // 2. Preencher credenciais
    await page.fill('input[type="email"]', 'admin@erppro.com');
    await page.fill('input[type="password"]', 'admin123');

    // 3. Fazer login
    await page.click('button[type="submit"]');

    // 4. Verificar redirecionamento para dashboard
    await page.waitForURL('**/dashboard');
    
    // 5. Verificar elementos do dashboard
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // 6. Verificar sidebar
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Financeiro')).toBeVisible();
    await expect(page.locator('text=Vendas')).toBeVisible();
    await expect(page.locator('text=Clientes')).toBeVisible();
    await expect(page.locator('text=Produtos')).toBeVisible();

    // 7. Verificar métricas do dashboard
    await expect(page.locator('[data-testid="total-revenue"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-sales"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-customers"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-products"]')).toBeVisible();

    console.log('✅ Login e dashboard funcionando corretamente');
  });

  test('Navegação entre módulos', async ({ page }) => {
    // 1. Fazer login
    await page.fill('input[type="email"]', 'admin@erppro.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // 2. Navegar para Financeiro
    await page.click('text=Financeiro');
    await page.waitForURL('**/financial');
    await expect(page.locator('h1')).toContainText('Financeiro');

    // 3. Navegar para Vendas
    await page.click('text=Vendas');
    await page.waitForURL('**/sales');
    await expect(page.locator('h1')).toContainText('Vendas');

    // 4. Navegar para Clientes
    await page.click('text=Clientes');
    await page.waitForURL('**/customers');
    await expect(page.locator('h1')).toContainText('Clientes');

    // 5. Navegar para Produtos
    await page.click('text=Produtos');
    await page.waitForURL('**/inventory');
    await expect(page.locator('h1')).toContainText('Produtos');

    console.log('✅ Navegação entre módulos funcionando');
  });

  test('Persistência de dados após refresh', async ({ page }) => {
    // 1. Fazer login
    await page.fill('input[type="email"]', 'admin@erppro.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // 2. Verificar se está logado
    await expect(page.locator('h1')).toContainText('Dashboard');

    // 3. Fazer refresh da página
    await page.reload();

    // 4. Verificar se ainda está logado (não foi redirecionado para login)
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page).not.toHaveURL('**/login');

    console.log('✅ Persistência de sessão funcionando');
  });

  test('Logout funcional', async ({ page }) => {
    // 1. Fazer login
    await page.fill('input[type="email"]', 'admin@erppro.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // 2. Fazer logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Sair');

    // 3. Verificar redirecionamento para login
    await page.waitForURL('**/login');
    await expect(page.locator('h1')).toContainText('ERP PRO');

    console.log('✅ Logout funcionando corretamente');
  });
});
