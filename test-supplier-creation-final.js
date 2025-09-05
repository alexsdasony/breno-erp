// Teste final para criação de fornecedor
import puppeteer from 'puppeteer';

async function testSupplierCreationFinal() {
  console.log('🧪 TESTE FINAL - CRIAÇÃO DE FORNECEDOR...\n');
  
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
      
      // Preencher todos os campos obrigatórios
      const nameField = await page.$('#suppliers-name-input');
      if (nameField) {
        await nameField.type('Fornecedor Teste Final');
        console.log('✅ Campo nome preenchido');
      }
      
      const razaoSocialField = await page.$('#razao_social');
      if (razaoSocialField) {
        await razaoSocialField.type('Fornecedor Teste Final LTDA');
        console.log('✅ Campo razão social preenchido');
      }
      
      const cpfCnpjField = await page.$('#cpf_cnpj');
      if (cpfCnpjField) {
        await cpfCnpjField.type('12.345.678/0001-90');
        console.log('✅ Campo CPF/CNPJ preenchido');
      }
      
      const emailField = await page.$('#suppliers-email-input');
      if (emailField) {
        await emailField.type('teste@final.com');
        console.log('✅ Campo email preenchido');
      }
      
      // Aguardar um pouco para garantir que os campos foram preenchidos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar se todos os campos obrigatórios estão preenchidos
      const nameValue = await nameField.evaluate(el => el.value);
      const razaoValue = await razaoSocialField.evaluate(el => el.value);
      const cpfValue = await cpfCnpjField.evaluate(el => el.value);
      const emailValue = await emailField.evaluate(el => el.value);
      
      console.log(`\n📝 Valores dos campos:`);
      console.log(`  - Nome: "${nameValue}"`);
      console.log(`  - Razão Social: "${razaoValue}"`);
      console.log(`  - CPF/CNPJ: "${cpfValue}"`);
      console.log(`  - Email: "${emailValue}"`);
      
      // Clicar no botão submit
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        console.log('🖱️ Clicando em submit...');
        await submitBtn.click();
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Verificar se o modal fechou
        const modal = await page.$('.fixed.inset-0.z-50');
        if (!modal) {
          console.log('✅ Modal fechou - fornecedor criado com sucesso!');
          
          // Verificar se o fornecedor apareceu na lista
          const suppliersList = await page.$$('tbody tr');
          console.log(`📋 Fornecedores na lista: ${suppliersList.length}`);
          
          if (suppliersList.length > 0) {
            console.log('🎉 SUCESSO TOTAL! Fornecedor criado e apareceu na lista!');
          } else {
            console.log('⚠️ Fornecedor criado mas não apareceu na lista');
          }
        } else {
          console.log('❌ Modal ainda aberto - criação falhou');
          
          // Verificar se há mensagens de erro
          const errorMessages = await page.$$('.text-red-500, .text-destructive, [role="alert"]');
          console.log(`❌ Mensagens de erro encontradas: ${errorMessages.length}`);
          
          for (let i = 0; i < errorMessages.length; i++) {
            const errorText = await errorMessages[i].evaluate(el => el.textContent);
            console.log(`  - Erro ${i + 1}: "${errorText}"`);
          }
        }
      } else {
        console.log('❌ Botão submit não encontrado');
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

testSupplierCreationFinal().catch(console.error);
