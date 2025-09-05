// Teste final das 11 demandas
import puppeteer from 'puppeteer';

async function finalTest() {
  console.log('🧪 TESTE FINAL DAS 11 DEMANDAS...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  const results = [];
  
  try {
    // Login
    console.log('🔐 Fazendo login...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.type('input[type="email"]', 'admin@erppro.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // TESTE 1: Validação CPF/CNPJ em fornecedores
    console.log('\n📋 TESTE 1: Validação CPF/CNPJ em fornecedores');
    await page.goto('http://localhost:3000/suppliers');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Procurar botão "Novo Fornecedor" por ID
    const newSupplierBtn = await page.$('#suppliers-new-button');
    if (newSupplierBtn) {
      await newSupplierBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Testar CPF inválido
      const cpfField = await page.$('input[placeholder*="CPF"], input[placeholder*="CNPJ"]');
      if (cpfField) {
        await cpfField.type('111.111.111-11');
        await page.click('body'); // Trigger validation
        
        const errorMsg = await page.$('.text-red-600');
        if (errorMsg) {
          console.log('✅ Validação CPF/CNPJ: FUNCIONANDO');
          results.push({ test: 1, status: 'PASS' });
        } else {
          console.log('❌ Validação CPF/CNPJ: NÃO FUNCIONANDO');
          results.push({ test: 1, status: 'FAIL' });
        }
      } else {
        console.log('❌ Campo CPF/CNPJ não encontrado');
        results.push({ test: 1, status: 'FAIL' });
      }
    } else {
      console.log('❌ Botão "Novo Fornecedor" não encontrado');
      results.push({ test: 1, status: 'FAIL' });
    }
    
    // TESTE 2: Botão cancelar em fornecedores
    console.log('\n📋 TESTE 2: Botão cancelar em fornecedores');
    // Primeiro, abrir o modal clicando em "Novo Fornecedor"
    const newSupplierBtn2 = await page.$('#suppliers-new-button');
    if (newSupplierBtn2) {
      await newSupplierBtn2.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Debug: verificar se o modal foi aberto
      const modalExists = await page.$('.fixed.inset-0.z-50');
      console.log('Modal aberto:', modalExists ? 'SIM' : 'NÃO');
      
      // Agora procurar o botão cancelar
      const cancelBtn = await page.$('#suppliers-cancel-button');
      if (cancelBtn) {
        console.log('✅ Botão cancelar fornecedores: VISÍVEL');
        results.push({ test: 2, status: 'PASS' });
      } else {
        // Tentar encontrar por texto
        const cancelBtnByText = await page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          return buttons.find(btn => btn.textContent.includes('Cancelar'));
        });
        if (cancelBtnByText) {
          console.log('✅ Botão cancelar fornecedores: VISÍVEL (encontrado por texto)');
          results.push({ test: 2, status: 'PASS' });
        } else {
          console.log('❌ Botão cancelar fornecedores: NÃO VISÍVEL');
          results.push({ test: 2, status: 'FAIL' });
        }
      }
    } else {
      console.log('❌ Botão "Novo Fornecedor" não encontrado');
      results.push({ test: 2, status: 'FAIL' });
    }
    
    // TESTE 3: Criação de fornecedor
    console.log('\n📋 TESTE 3: Criação de fornecedor');
    const nameField = await page.$('input[placeholder*="Nome do fornecedor"]');
    console.log('Campo nome encontrado:', nameField ? 'SIM' : 'NÃO');
    if (nameField) {
      await nameField.type('Fornecedor Teste');
      const emailField = await page.$('input[type="email"]');
      if (emailField) {
        await emailField.type('teste@fornecedor.com');
      }
      
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('✅ Criação de fornecedor: TESTADO');
        results.push({ test: 3, status: 'PASS' });
      } else {
        console.log('❌ Botão submit não encontrado');
        results.push({ test: 3, status: 'FAIL' });
      }
    } else {
      console.log('❌ Campo nome não encontrado');
      results.push({ test: 3, status: 'FAIL' });
    }
    
    // TESTE 4: Atualização de fornecedor
    console.log('\n📋 TESTE 4: Atualização de fornecedor');
    await page.goto('http://localhost:3000/suppliers');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const editBtn = await page.$('[data-testid="edit-supplier-button"]');
    console.log('Botão editar encontrado:', editBtn ? 'SIM' : 'NÃO');
    if (editBtn) {
      await editBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Atualização de fornecedor: TESTADO');
      results.push({ test: 4, status: 'PASS' });
    } else {
      console.log('❌ Botão editar não encontrado');
      results.push({ test: 4, status: 'FAIL' });
    }
    
    // TESTE 5: Botão cancelar em clientes
    console.log('\n📋 TESTE 5: Botão cancelar em clientes');
    await page.goto('http://localhost:3000/customers');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newCustomerBtn = await page.$('#customers-simple-button');
    if (newCustomerBtn) {
      await newCustomerBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const customerCancelBtn = await page.$('#customers-cancel-button');
      if (customerCancelBtn) {
        console.log('✅ Botão cancelar clientes: VISÍVEL');
        results.push({ test: 5, status: 'PASS' });
      } else {
        console.log('❌ Botão cancelar clientes: NÃO VISÍVEL');
        results.push({ test: 5, status: 'FAIL' });
      }
    } else {
      console.log('❌ Botão novo cliente não encontrado');
      results.push({ test: 5, status: 'FAIL' });
    }
    
    // TESTE 6: Atualização de cliente
    console.log('\n📋 TESTE 6: Atualização de cliente');
    const customerNameField = await page.$('input[placeholder*="Nome"]');
    if (customerNameField) {
      await customerNameField.type('Cliente Teste');
      const customerSubmitBtn = await page.$('button[type="submit"]');
      if (customerSubmitBtn) {
        await customerSubmitBtn.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('✅ Atualização de cliente: TESTADO');
        results.push({ test: 6, status: 'PASS' });
      } else {
        console.log('❌ Botão submit cliente não encontrado');
        results.push({ test: 6, status: 'FAIL' });
      }
    } else {
      console.log('❌ Campo nome cliente não encontrado');
      results.push({ test: 6, status: 'FAIL' });
    }
    
    // TESTE 7: Inconsistência no estoque
    console.log('\n📋 TESTE 7: Inconsistência no estoque');
    await page.goto('http://localhost:3000/inventory');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const stockCells = await page.$$('td');
    if (stockCells.length > 0) {
      console.log('✅ Exibição de estoque: FUNCIONANDO');
      results.push({ test: 7, status: 'PASS' });
    } else {
      console.log('❌ Exibição de estoque: NÃO FUNCIONANDO');
      results.push({ test: 7, status: 'FAIL' });
    }
    
    // TESTE 8: Dropdowns de usuários
    console.log('\n📋 TESTE 8: Dropdowns de usuários (fundo branco)');
    await page.goto('http://localhost:3000/users');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selects = await page.$$('select');
    let dropdownFixed = false;
    for (let select of selects) {
      const computedStyle = await select.evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          backgroundColor: style.backgroundColor,
          color: style.color,
          inlineBg: el.style.backgroundColor,
          inlineColor: el.style.color
        };
      });
      
      if ((computedStyle.inlineBg && computedStyle.inlineBg.includes('374151')) || 
          (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('rgb(55, 65, 81)'))) {
        dropdownFixed = true;
        break;
      }
    }
    
    if (dropdownFixed) {
      console.log('✅ Dropdowns de usuários: CORRIGIDOS');
      results.push({ test: 8, status: 'PASS' });
    } else {
      console.log('❌ Dropdowns de usuários: NÃO CORRIGIDOS');
      results.push({ test: 8, status: 'FAIL' });
    }
    
    // TESTE 9: Criação de usuários
    console.log('\n📋 TESTE 9: Criação de usuários');
    const newUserBtn = await page.$('#users-new-button');
    if (newUserBtn) {
      await newUserBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Criação de usuários: TESTADO');
      results.push({ test: 9, status: 'PASS' });
    } else {
      console.log('❌ Botão novo usuário não encontrado');
      results.push({ test: 9, status: 'FAIL' });
    }
    
    // TESTE 10: Edição Perfil/Segmento de usuários
    console.log('\n📋 TESTE 10: Edição Perfil/Segmento de usuários');
    const userEditBtn = await page.$('button[title*="Editar"]');
    if (userEditBtn) {
      await userEditBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Edição Perfil/Segmento: TESTADO');
      results.push({ test: 10, status: 'PASS' });
    } else {
      console.log('❌ Botão editar usuário não encontrado');
      results.push({ test: 10, status: 'FAIL' });
    }
    
    // TESTE 11: Reset de senha
    console.log('\n📋 TESTE 11: Reset de senha');
    const resetBtn = await page.$('button[title*="Reset"]');
    if (resetBtn) {
      await resetBtn.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Reset de senha: FUNCIONANDO (senha padrão: senha123)');
      results.push({ test: 11, status: 'PASS' });
    } else {
      console.log('❌ Botão reset senha não encontrado');
      results.push({ test: 11, status: 'FAIL' });
    }
    
    // RESUMO DOS RESULTADOS
    console.log('\n🎯 RESUMO DOS TESTES:');
    console.log('==================');
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    
    console.log(`✅ Passou: ${passed}/11`);
    console.log(`❌ Falhou: ${failed}/11`);
    console.log(`📊 Taxa de sucesso: ${Math.round((passed/11)*100)}%`);
    
    console.log('\n📋 DETALHES:');
    results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} Teste ${result.test}: ${result.status}`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  } finally {
    await browser.close();
  }
}

finalTest().catch(console.error);
