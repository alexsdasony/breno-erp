// Debug específico para o modal de fornecedores
import puppeteer from 'puppeteer';

async function debugSupplierModal() {
  console.log('🔍 DEBUGGING MODAL DE FORNECEDORES...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Login
    console.log('🔐 Fazendo login...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'admin@erppro.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Ir para fornecedores
    console.log('📋 Acessando fornecedores...');
    await page.goto('http://localhost:3000/suppliers');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se o botão existe
    const newSupplierBtn = await page.$('#suppliers-new-button');
    console.log('Botão "Novo Fornecedor" encontrado:', newSupplierBtn ? 'SIM' : 'NÃO');
    
    if (newSupplierBtn) {
      // Verificar se o botão está visível
      const isVisible = await newSupplierBtn.isVisible();
      console.log('Botão "Novo Fornecedor" visível:', isVisible ? 'SIM' : 'NÃO');
      
      // Verificar se o botão está habilitado
      const isEnabled = await newSupplierBtn.evaluate(el => !el.disabled);
      console.log('Botão "Novo Fornecedor" habilitado:', isEnabled ? 'SIM' : 'NÃO');
      
      // Clicar no botão
      console.log('🖱️ Clicando no botão...');
      await newSupplierBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Verificar se o modal foi aberto
      const modal = await page.$('.fixed.inset-0.z-50');
      console.log('Modal encontrado:', modal ? 'SIM' : 'NÃO');
      
      if (modal) {
        const isModalVisible = await modal.isVisible();
        console.log('Modal visível:', isModalVisible ? 'SIM' : 'NÃO');
        
        // Verificar se o botão cancelar existe
        const cancelBtn = await page.$('#suppliers-cancel-button');
        console.log('Botão cancelar encontrado:', cancelBtn ? 'SIM' : 'NÃO');
        
        if (cancelBtn) {
          const isCancelVisible = await cancelBtn.isVisible();
          console.log('Botão cancelar visível:', isCancelVisible ? 'SIM' : 'NÃO');
        }
      }
      
      // Verificar erros no console
      const errors = await page.evaluate(() => {
        return window.console.errors || [];
      });
      console.log('Erros no console:', errors.length > 0 ? errors : 'NENHUM');
      
    } else {
      console.log('❌ Botão "Novo Fornecedor" não encontrado!');
    }
    
  } catch (error) {
    console.error('❌ Erro durante debug:', error.message);
  } finally {
    await browser.close();
  }
}

debugSupplierModal().catch(console.error);
