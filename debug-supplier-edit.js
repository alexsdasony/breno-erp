// Debug específico para o botão editar de fornecedores
import puppeteer from 'puppeteer';

async function debugSupplierEdit() {
  console.log('🔍 DEBUGGING BOTÃO EDITAR FORNECEDOR...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized'],
    protocolTimeout: 60000
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
    
    // Verificar fornecedores existentes
    const suppliersList = await page.$$('tbody tr');
    console.log('Fornecedores existentes:', suppliersList.length);
    
    if (suppliersList.length === 0) {
      console.log('🆕 Criando fornecedor para teste...');
      
      // Criar fornecedor
      const newSupplierBtn = await page.$('#suppliers-new-button');
      if (newSupplierBtn) {
        await newSupplierBtn.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const nameField = await page.$('input[placeholder*="Nome do fornecedor"]');
        if (nameField) {
          await nameField.type('Fornecedor Teste Edição');
          const emailField = await page.$('input[type="email"]');
          if (emailField) {
            await emailField.type('teste@edicao.com');
          }
          
          const submitBtn = await page.$('button[type="submit"]');
          if (submitBtn) {
            await submitBtn.click();
            await new Promise(resolve => setTimeout(resolve, 3000));
            console.log('✅ Fornecedor criado');
          }
        }
      }
    }
    
    // Verificar fornecedores após criação
    const suppliersListAfter = await page.$$('tbody tr');
    console.log('Fornecedores após criação:', suppliersListAfter.length);
    
    if (suppliersListAfter.length > 0) {
      console.log('🔍 Procurando botão editar...');
      
      // Procurar por data-testid
      const editBtnByTestId = await page.$('[data-testid="edit-supplier-button"]');
      console.log('Botão editar por data-testid:', editBtnByTestId ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
      
      // Procurar por title
      const editBtnByTitle = await page.$('button[title="Editar"]');
      console.log('Botão editar por title:', editBtnByTitle ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
      
      // Procurar por ícone Edit
      const editBtnByIcon = await page.$('button svg');
      console.log('Botão com ícone SVG:', editBtnByIcon ? 'ENCONTRADO' : 'NÃO ENCONTRADO');
      
      // Procurar todos os botões na tabela
      const allButtons = await page.$$('tbody button');
      console.log('Total de botões na tabela:', allButtons.length);
      
      // Verificar cada botão
      for (let i = 0; i < allButtons.length; i++) {
        const button = allButtons[i];
        const title = await button.evaluate(el => el.getAttribute('title'));
        const testId = await button.evaluate(el => el.getAttribute('data-testid'));
        const text = await button.evaluate(el => el.textContent);
        const className = await button.evaluate(el => el.className);
        
        console.log(`Botão ${i + 1}: title="${title}", testId="${testId}", text="${text}", className="${className}"`);
      }
      
      // Verificar se há erros no console
      const errors = await page.evaluate(() => {
        return window.console.errors || [];
      });
      console.log('Erros no console:', errors.length > 0 ? errors : 'NENHUM');
      
    } else {
      console.log('❌ Nenhum fornecedor encontrado após criação');
    }
    
  } catch (error) {
    console.error('❌ Erro durante debug:', error.message);
  } finally {
    await browser.close();
  }
}

debugSupplierEdit().catch(console.error);
