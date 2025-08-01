import { test, expect } from '@playwright/test';

// Usuário principal documentado no README.md
const USER = {
  email: 'admin@breno-erp.com',
  password: 'Admin@2024'
};

test('🔐 Login e Visualizar Dashboard', async ({ page }) => {
  console.log('🧪 Iniciando login para ver o dashboard...');
  
  // 1. Navegar para a página inicial
  await page.goto('/');
  console.log('✅ Página carregada');
  
  // 2. Aguardar um pouco para a página carregar
  await page.waitForTimeout(3000);
  
  // 3. Preencher email
  await page.fill('input[type="email"]', USER.email);
  console.log('✅ Email preenchido:', USER.email);
  
  // 4. Preencher senha
  await page.fill('input[type="password"]', USER.password);
  console.log('✅ Senha preenchida');
  
  // 5. Clicar no botão de login
  await page.click('button[type="submit"]');
  console.log('✅ Botão de login clicado');
  
  // 6. Aguardar um pouco para o login processar
  await page.waitForTimeout(5000);
  
  // 7. Verificar se há erro de conexão
  const errorMessage = page.locator('text=Erro no Login, text=Falha na conexão');
  if (await errorMessage.isVisible()) {
    console.log('⚠️ Erro de conexão detectado, tentando novamente...');
    
    // Aguardar um pouco mais e tentar novamente
    await page.waitForTimeout(3000);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
  }
  
  // 8. Aguardar redirecionamento para o dashboard (com timeout maior)
  try {
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    console.log('✅ Redirecionamento para dashboard realizado');
  } catch (error) {
    console.log('⚠️ Timeout no redirecionamento, verificando URL atual...');
    console.log('🌐 URL atual:', page.url());
    
    // Se não redirecionou, verificar se ainda está na página de login
    if (page.url().includes('login') || page.url().endsWith('/')) {
      console.log('❌ Ainda na página de login, verificando erros...');
      
      // Verificar se há mensagens de erro
      const errors = await page.locator('text=Erro, text=Error, text=Falha').all();
      for (const error of errors) {
        if (await error.isVisible()) {
          console.log('❌ Erro encontrado:', await error.textContent());
        }
      }
      
      // Aguardar mais tempo para visualizar
      await page.waitForTimeout(10000);
      throw new Error('Login falhou - verificar backend e credenciais');
    }
  }
  
  // 9. Verificar se estamos no dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  console.log('✅ Dashboard confirmado!');
  console.log('🌐 URL atual:', page.url());
  
  // 10. Aguardar mais tempo para visualizar o dashboard
  console.log('👀 Visualizando dashboard por 15 segundos...');
  await page.waitForTimeout(15000);
  
  console.log('🎉 Login realizado com sucesso e dashboard visualizado!');
}); 