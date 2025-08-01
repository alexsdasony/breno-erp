import { test, expect } from '@playwright/test';

// Usuários documentados no README.md
const USERS = {
  ADMIN_PRINCIPAL: {
    email: 'admin@breno-erp.com',
    password: 'Admin@2024',
    name: 'Administrador Sistema'
  },
  ADMIN_SECUNDARIO: {
    email: 'admin@erppro.com', 
    password: 'admin123',
    name: 'Admin ERP Pro'
  }
};

test.describe('🧪 Testes E2E - Login Breno ERP', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar para a página de login
    await page.goto('/');
    
    // Aguardar a página carregar
    await page.waitForLoadState('networkidle');
  });

  test('🔐 Login com usuário principal', async ({ page }) => {
    console.log('🧪 Testando login com usuário principal...');
    
    // Verificar se estamos na página de login
    await expect(page).toHaveTitle(/Breno ERP/);
    
    // Preencher email
    await page.fill('input[type="email"]', USERS.ADMIN_PRINCIPAL.email);
    
    // Preencher senha
    await page.fill('input[type="password"]', USERS.ADMIN_PRINCIPAL.password);
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para o dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verificar se o login foi bem-sucedido
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verificar se o nome do usuário aparece na interface
    await expect(page.locator('text=' + USERS.ADMIN_PRINCIPAL.name)).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Login com usuário principal realizado com sucesso!');
  });

  test('🔐 Login com usuário secundário', async ({ page }) => {
    console.log('🧪 Testando login com usuário secundário...');
    
    // Verificar se estamos na página de login
    await expect(page).toHaveTitle(/Breno ERP/);
    
    // Preencher email
    await page.fill('input[type="email"]', USERS.ADMIN_SECUNDARIO.email);
    
    // Preencher senha
    await page.fill('input[type="password"]', USERS.ADMIN_SECUNDARIO.password);
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento para o dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // Verificar se o login foi bem-sucedido
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verificar se o nome do usuário aparece na interface
    await expect(page.locator('text=' + USERS.ADMIN_SECUNDARIO.name)).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Login com usuário secundário realizado com sucesso!');
  });

  test('❌ Login com credenciais inválidas', async ({ page }) => {
    console.log('🧪 Testando login com credenciais inválidas...');
    
    // Preencher email inválido
    await page.fill('input[type="email"]', 'invalid@email.com');
    
    // Preencher senha inválida
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    // Aguardar mensagem de erro
    await page.waitForTimeout(2000);
    
    // Verificar se permanece na página de login
    await expect(page).toHaveURL(/.*login/);
    
    console.log('✅ Teste de credenciais inválidas passou!');
  });

  test('🔍 Verificar elementos da página de login', async ({ page }) => {
    console.log('🧪 Verificando elementos da página de login...');
    
    // Verificar se os campos de input estão presentes
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Verificar se o título da página está correto
    await expect(page).toHaveTitle(/Breno ERP/);
    
    // Verificar se há algum texto indicando que é a página de login
    await expect(page.locator('text=Login')).toBeVisible();
    
    console.log('✅ Elementos da página de login verificados!');
  });

  test('🚀 Fluxo completo: Login -> Dashboard -> Logout', async ({ page }) => {
    console.log('🧪 Testando fluxo completo de login...');
    
    // 1. Fazer login
    await page.fill('input[type="email"]', USERS.ADMIN_PRINCIPAL.email);
    await page.fill('input[type="password"]', USERS.ADMIN_PRINCIPAL.password);
    await page.click('button[type="submit"]');
    
    // 2. Aguardar redirecionamento para dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    
    // 3. Verificar se está no dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // 4. Verificar se o menu está visível
    await expect(page.locator('nav')).toBeVisible({ timeout: 5000 });
    
    // 5. Procurar e clicar no botão de logout
    // Pode estar em um menu dropdown ou como botão direto
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), [data-testid="logout"]').first();
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Se não encontrar botão de logout, tentar navegar para /logout
      await page.goto('/logout');
    }
    
    // 6. Verificar se foi redirecionado para a página de login
    await page.waitForURL('**/login', { timeout: 5000 });
    await expect(page).toHaveURL(/.*login/);
    
    console.log('✅ Fluxo completo de login/logout testado com sucesso!');
  });
}); 