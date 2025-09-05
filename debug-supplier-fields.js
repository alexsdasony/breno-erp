// Debug específico para campos do formulário de fornecedor
import puppeteer from 'puppeteer';

async function debugSupplierFields() {
  console.log('🔍 DEBUG CAMPOS DO FORMULÁRIO DE FORNECEDOR...\n');
  
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
    
    // Abrir modal
    console.log('🆕 Abrindo modal de fornecedor...');
    const newSupplierBtn = await page.$('#suppliers-new-button');
    if (newSupplierBtn) {
      await newSupplierBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Listar todos os campos do formulário
      const allInputs = await page.$$('input');
      console.log(`\n📝 Total de campos encontrados: ${allInputs.length}`);
      
      for (let i = 0; i < allInputs.length; i++) {
        const input = allInputs[i];
        const type = await input.evaluate(el => el.type);
        const placeholder = await input.evaluate(el => el.placeholder);
        const name = await input.evaluate(el => el.name);
        const id = await input.evaluate(el => el.id);
        const required = await input.evaluate(el => el.required);
        const value = await input.evaluate(el => el.value);
        
        console.log(`\nCampo ${i + 1}:`);
        console.log(`  - Tipo: ${type}`);
        console.log(`  - Placeholder: "${placeholder}"`);
        console.log(`  - Name: "${name}"`);
        console.log(`  - ID: "${id}"`);
        console.log(`  - Obrigatório: ${required}`);
        console.log(`  - Valor: "${value}"`);
      }
      
      // Verificar se há validação de formulário
      const form = await page.$('form');
      if (form) {
        const formAction = await form.evaluate(el => el.action);
        const formMethod = await form.evaluate(el => el.method);
        console.log(`\n📋 Formulário encontrado:`);
        console.log(`  - Action: "${formAction}"`);
        console.log(`  - Method: "${formMethod}"`);
      }
      
      // Verificar se há botões de submit
      const submitButtons = await page.$$('button[type="submit"]');
      console.log(`\n🔘 Botões de submit encontrados: ${submitButtons.length}`);
      
      for (let i = 0; i < submitButtons.length; i++) {
        const button = submitButtons[i];
        const text = await button.evaluate(el => el.textContent);
        const disabled = await button.evaluate(el => el.disabled);
        console.log(`  - Botão ${i + 1}: "${text}" (disabled: ${disabled})`);
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

debugSupplierFields().catch(console.error);
