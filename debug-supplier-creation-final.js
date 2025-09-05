// Debug final para criação de fornecedor
import puppeteer from 'puppeteer';

async function debugSupplierCreationFinal() {
  console.log('🔍 DEBUG FINAL - CRIAÇÃO DE FORNECEDOR...\n');
  
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
    
    // Criar fornecedor
    console.log('🆕 Criando fornecedor...');
    const newSupplierBtn = await page.$('#suppliers-new-button');
    if (newSupplierBtn) {
      await newSupplierBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nameField = await page.$('input[placeholder*="Nome do fornecedor"]');
      if (nameField) {
        await nameField.type('Fornecedor Debug Final');
        const emailField = await page.$('input[type="email"]');
        if (emailField) {
          await emailField.type('debug@final.com');
        }
        
        const submitBtn = await page.$('button[type="submit"]');
        if (submitBtn) {
          console.log('🖱️ Clicando em submit...');
          await submitBtn.click();
          await new Promise(resolve => setTimeout(resolve, 5000));
          
          // Verificar se o modal fechou
          const modal = await page.$('.fixed.inset-0.z-50');
          console.log('Modal ainda aberto:', modal ? 'SIM' : 'NÃO');
          
          if (modal) {
            // Verificar se há mensagens de erro
            const errorMessages = await page.$$('.text-red-500, .text-destructive, [role="alert"]');
            console.log('Mensagens de erro encontradas:', errorMessages.length);
            
            for (let i = 0; i < errorMessages.length; i++) {
              const errorText = await errorMessages[i].evaluate(el => el.textContent);
              console.log(`Erro ${i + 1}:`, errorText);
            }
            
            // Verificar se há campos obrigatórios não preenchidos
            const requiredFields = await page.$$('input[required]');
            console.log('Campos obrigatórios encontrados:', requiredFields.length);
            
            for (let i = 0; i < requiredFields.length; i++) {
              const field = requiredFields[i];
              const value = await field.evaluate(el => el.value);
              const placeholder = await field.evaluate(el => el.placeholder);
              console.log(`Campo ${i + 1}: placeholder="${placeholder}", value="${value}"`);
            }
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
    console.error('❌ Erro durante debug:', error.message);
  } finally {
    await browser.close();
  }
}

debugSupplierCreationFinal().catch(console.error);
