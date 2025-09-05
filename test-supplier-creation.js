// Teste específico para criação de fornecedor
import puppeteer from 'puppeteer';

async function testSupplierCreation() {
  console.log('🧪 TESTANDO CRIAÇÃO DE FORNECEDOR...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized'],
    protocolTimeout: 60000
  });
  
  const page = await browser.newPage();
  
  // Capturar logs do console
  page.on('console', msg => {
    console.log('CONSOLE:', msg.text());
  });
  
  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });
  
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
    
    // Criar fornecedor
    console.log('🆕 Criando fornecedor...');
    const newSupplierBtn = await page.$('#suppliers-new-button');
    if (newSupplierBtn) {
      await newSupplierBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nameField = await page.$('input[placeholder*="Nome do fornecedor"]');
      if (nameField) {
        await nameField.type('Fornecedor Teste Final');
        const emailField = await page.$('input[type="email"]');
        if (emailField) {
          await emailField.type('teste@final.com');
        }
        
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
          console.log('🖱️ Clicando em submit...');
          await submitBtn.click();
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Verificar se o modal fechou
          const modal = await page.$('.fixed.inset-0.z-50');
          console.log('Modal ainda aberto:', modal ? 'SIM' : 'NÃO');
          
          // Verificar fornecedores após criação
          const suppliersListAfter = await page.$$('tbody tr');
          console.log('Fornecedores após criação:', suppliersListAfter.length);
          
          if (suppliersListAfter.length > 0) {
            console.log('✅ Fornecedor criado com sucesso!');
            
            // Verificar botão editar
            const editBtn = await page.$('[data-testid="edit-supplier-button"]');
            if (editBtn) {
              console.log('✅ Botão editar encontrado!');
            } else {
              console.log('❌ Botão editar não encontrado');
            }
          } else {
            console.log('❌ Fornecedor não apareceu na lista');
          }
        } else {
          console.log('❌ Botão submit não encontrado');
        }
      } else {
        console.log('❌ Campo nome não encontrado');
      }
    } else {
      console.log('❌ Botão novo fornecedor não encontrado');
    }
    
  } catch (error) {
    console.error('❌ Erro durante teste:', error.message);
  } finally {
    await browser.close();
  }
}

testSupplierCreation().catch(console.error);
