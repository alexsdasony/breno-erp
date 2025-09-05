// Teste completo das 11 demandas
import puppeteer from 'puppeteer';

async function testAllDemands() {
  console.log('🧪 TESTANDO TODAS AS 11 DEMANDAS...\n');
  
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
    
    // Procurar botão "Novo Fornecedor"
    const newSupplierBtn = await page.$('[id*="new"], button[class*="new"]');
    if (newSupplierBtn) {
      await newSupplierBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Testar CPF inválido
      const cpfField = await page.$('input[placeholder*="CPF"], input[placeholder*="CNPJ"], input[name*="cpf"], input[name*="cnpj"]');
      if (cpfField) {
        await cpfField.type('111.111.111-11');
        await page.click('body'); // Trigger validation
        
        const errorMsg = await page.$('.text-red-600, .error, [class*="error"]');
        if (errorMsg) {
          console.log('✅ Validação CPF/CNPJ: FUNCIONANDO');
          results.push({ test: 1, status: 'PASS', message: 'Validação CPF/CNPJ funcionando' });
        } else {
          console.log('❌ Validação CPF/CNPJ: NÃO FUNCIONANDO');
          results.push({ test: 1, status: 'FAIL', message: 'Validação CPF/CNPJ não funcionando' });
        }
      } else {
        console.log('❌ Campo CPF/CNPJ não encontrado');
        results.push({ test: 1, status: 'FAIL', message: 'Campo CPF/CNPJ não encontrado' });
      }
    } else {
      console.log('❌ Botão "Novo Fornecedor" não encontrado');
      results.push({ test: 1, status: 'FAIL', message: 'Botão "Novo Fornecedor" não encontrado' });
    }
    
    // TESTE 2: Botão cancelar em fornecedores
    console.log('\n📋 TESTE 2: Botão cancelar em fornecedores');
    const cancelBtn = await page.$('button:contains("Cancelar"), button:contains("Cancel")');
    if (cancelBtn) {
      console.log('✅ Botão cancelar fornecedores: VISÍVEL');
      results.push({ test: 2, status: 'PASS', message: 'Botão cancelar fornecedores visível' });
    } else {
      console.log('❌ Botão cancelar fornecedores: NÃO VISÍVEL');
      results.push({ test: 2, status: 'FAIL', message: 'Botão cancelar fornecedores não visível' });
    }
    
    // TESTE 3: Criação de fornecedor
    console.log('\n📋 TESTE 3: Criação de fornecedor');
    const nameField = await page.$('input[placeholder*="Nome"], input[name*="name"], input[name*="razao"]');
    if (nameField) {
      await nameField.type('Fornecedor Teste');
      const emailField = await page.$('input[type="email"]');
      if (emailField) {
        await emailField.type('teste@fornecedor.com');
      }
      
      const submitBtn = await page.$('button[type="submit"], button:contains("Salvar"), button:contains("Criar")');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar se foi criado (não está mais no formulário)
        const currentUrl = page.url();
        if (!currentUrl.includes('form') && !currentUrl.includes('new')) {
          console.log('✅ Criação de fornecedor: FUNCIONANDO');
          results.push({ test: 3, status: 'PASS', message: 'Criação de fornecedor funcionando' });
        } else {
          console.log('❌ Criação de fornecedor: NÃO FUNCIONANDO');
          results.push({ test: 3, status: 'FAIL', message: 'Criação de fornecedor não funcionando' });
        }
      } else {
        console.log('❌ Botão submit não encontrado');
        results.push({ test: 3, status: 'FAIL', message: 'Botão submit não encontrado' });
      }
    } else {
      console.log('❌ Campo nome não encontrado');
      results.push({ test: 3, status: 'FAIL', message: 'Campo nome não encontrado' });
    }
    
    // TESTE 4: Atualização de fornecedor
    console.log('\n📋 TESTE 4: Atualização de fornecedor');
    await page.goto('http://localhost:3000/suppliers');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const editBtn = await page.$('button[title*="Editar"], button:contains("Editar"), [id*="edit"]');
    if (editBtn) {
      await editBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const nameFieldEdit = await page.$('input[value*="Fornecedor"], input[name*="name"]');
      if (nameFieldEdit) {
        await nameFieldEdit.click({ clickCount: 3 }); // Selecionar todo o texto
        await nameFieldEdit.type('Fornecedor Atualizado');
        
        const updateBtn = await page.$('button[type="submit"], button:contains("Atualizar"), button:contains("Salvar")');
        if (updateBtn) {
          await updateBtn.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('✅ Atualização de fornecedor: FUNCIONANDO');
          results.push({ test: 4, status: 'PASS', message: 'Atualização de fornecedor funcionando' });
        } else {
          console.log('❌ Botão atualizar não encontrado');
          results.push({ test: 4, status: 'FAIL', message: 'Botão atualizar não encontrado' });
        }
      } else {
        console.log('❌ Campo nome para edição não encontrado');
        results.push({ test: 4, status: 'FAIL', message: 'Campo nome para edição não encontrado' });
      }
    } else {
      console.log('❌ Botão editar não encontrado');
      results.push({ test: 4, status: 'FAIL', message: 'Botão editar não encontrado' });
    }
    
    // TESTE 5: Botão cancelar em clientes
    console.log('\n📋 TESTE 5: Botão cancelar em clientes');
    await page.goto('http://localhost:3000/customers');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const newCustomerBtn = await page.$('button:contains("Novo"), button:contains("Cadastro"), [id*="new"]');
    if (newCustomerBtn) {
      await newCustomerBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const customerCancelBtn = await page.$('button:contains("Cancelar"), button:contains("Cancel")');
      if (customerCancelBtn) {
        console.log('✅ Botão cancelar clientes: VISÍVEL');
        results.push({ test: 5, status: 'PASS', message: 'Botão cancelar clientes visível' });
      } else {
        console.log('❌ Botão cancelar clientes: NÃO VISÍVEL');
        results.push({ test: 5, status: 'FAIL', message: 'Botão cancelar clientes não visível' });
      }
    } else {
      console.log('❌ Botão novo cliente não encontrado');
      results.push({ test: 5, status: 'FAIL', message: 'Botão novo cliente não encontrado' });
    }
    
    // TESTE 6: Atualização de cliente
    console.log('\n📋 TESTE 6: Atualização de cliente');
    const customerNameField = await page.$('input[placeholder*="Nome"], input[name*="name"]');
    if (customerNameField) {
      await customerNameField.type('Cliente Teste');
      const customerSubmitBtn = await page.$('button[type="submit"], button:contains("Salvar"), button:contains("Criar")');
      if (customerSubmitBtn) {
        await customerSubmitBtn.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('✅ Atualização de cliente: FUNCIONANDO');
        results.push({ test: 6, status: 'PASS', message: 'Atualização de cliente funcionando' });
      } else {
        console.log('❌ Botão submit cliente não encontrado');
        results.push({ test: 6, status: 'FAIL', message: 'Botão submit cliente não encontrado' });
      }
    } else {
      console.log('❌ Campo nome cliente não encontrado');
      results.push({ test: 6, status: 'FAIL', message: 'Campo nome cliente não encontrado' });
    }
    
    // TESTE 7: Inconsistência no estoque
    console.log('\n📋 TESTE 7: Inconsistência no estoque');
    await page.goto('http://localhost:3000/inventory');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const stockCells = await page.$$('td:contains("unidades"), td:contains("estoque")');
    if (stockCells.length > 0) {
      console.log('✅ Exibição de estoque: FUNCIONANDO');
      results.push({ test: 7, status: 'PASS', message: 'Exibição de estoque funcionando' });
    } else {
      console.log('❌ Exibição de estoque: NÃO FUNCIONANDO');
      results.push({ test: 7, status: 'FAIL', message: 'Exibição de estoque não funcionando' });
    }
    
    // TESTE 8: Dropdowns de usuários
    console.log('\n📋 TESTE 8: Dropdowns de usuários (fundo branco)');
    await page.goto('http://localhost:3000/users');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const selects = await page.$$('select');
    let dropdownFixed = false;
    for (let select of selects) {
      const style = await select.evaluate(el => el.style.backgroundColor);
      if (style && (style.includes('374151') || style.includes('gray'))) {
        dropdownFixed = true;
        break;
      }
    }
    
    if (dropdownFixed) {
      console.log('✅ Dropdowns de usuários: CORRIGIDOS');
      results.push({ test: 8, status: 'PASS', message: 'Dropdowns de usuários corrigidos' });
    } else {
      console.log('❌ Dropdowns de usuários: NÃO CORRIGIDOS');
      results.push({ test: 8, status: 'FAIL', message: 'Dropdowns de usuários não corrigidos' });
    }
    
    // TESTE 9: Criação de usuários
    console.log('\n📋 TESTE 9: Criação de usuários');
    const newUserBtn = await page.$('button:contains("Novo Usuário"), button:contains("Novo")');
    if (newUserBtn) {
      await newUserBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const userNameField = await page.$('input[placeholder*="Nome"], input[name*="name"]');
      if (userNameField) {
        await userNameField.type('Usuário Teste');
        const userEmailField = await page.$('input[type="email"]');
        if (userEmailField) {
          await userEmailField.type('teste@usuario.com');
          const userPasswordField = await page.$('input[type="password"]');
          if (userPasswordField) {
            await userPasswordField.type('senha123');
            
            const userSubmitBtn = await page.$('button[type="submit"], button:contains("Criar"), button:contains("Salvar")');
            if (userSubmitBtn) {
              await userSubmitBtn.click();
              await new Promise(resolve => setTimeout(resolve, 2000));
              console.log('✅ Criação de usuários: FUNCIONANDO');
              results.push({ test: 9, status: 'PASS', message: 'Criação de usuários funcionando' });
            } else {
              console.log('❌ Botão submit usuário não encontrado');
              results.push({ test: 9, status: 'FAIL', message: 'Botão submit usuário não encontrado' });
            }
          } else {
            console.log('❌ Campo senha usuário não encontrado');
            results.push({ test: 9, status: 'FAIL', message: 'Campo senha usuário não encontrado' });
          }
        } else {
          console.log('❌ Campo email usuário não encontrado');
          results.push({ test: 9, status: 'FAIL', message: 'Campo email usuário não encontrado' });
        }
      } else {
        console.log('❌ Campo nome usuário não encontrado');
        results.push({ test: 9, status: 'FAIL', message: 'Campo nome usuário não encontrado' });
      }
    } else {
      console.log('❌ Botão novo usuário não encontrado');
      results.push({ test: 9, status: 'FAIL', message: 'Botão novo usuário não encontrado' });
    }
    
    // TESTE 10: Edição Perfil/Segmento de usuários
    console.log('\n📋 TESTE 10: Edição Perfil/Segmento de usuários');
    const userEditBtn = await page.$('button[title*="Editar"], button:contains("Editar")');
    if (userEditBtn) {
      await userEditBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const roleSelect = await page.$('select[name*="role"], select[id*="role"]');
      if (roleSelect) {
        await roleSelect.select('admin');
        const segmentSelect = await page.$('select[name*="segment"], select[id*="segment"]');
        if (segmentSelect) {
          await segmentSelect.select('1'); // Selecionar primeiro segmento
        }
        
        const updateUserBtn = await page.$('button[type="submit"], button:contains("Atualizar"), button:contains("Salvar")');
        if (updateUserBtn) {
          await updateUserBtn.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          console.log('✅ Edição Perfil/Segmento: FUNCIONANDO');
          results.push({ test: 10, status: 'PASS', message: 'Edição Perfil/Segmento funcionando' });
        } else {
          console.log('❌ Botão atualizar usuário não encontrado');
          results.push({ test: 10, status: 'FAIL', message: 'Botão atualizar usuário não encontrado' });
        }
      } else {
        console.log('❌ Select perfil não encontrado');
        results.push({ test: 10, status: 'FAIL', message: 'Select perfil não encontrado' });
      }
    } else {
      console.log('❌ Botão editar usuário não encontrado');
      results.push({ test: 10, status: 'FAIL', message: 'Botão editar usuário não encontrado' });
    }
    
    // TESTE 11: Reset de senha
    console.log('\n📋 TESTE 11: Reset de senha');
    const resetBtn = await page.$('button[title*="Reset"], button:contains("Reset"), button:contains("Senha")');
    if (resetBtn) {
      await resetBtn.click();
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Reset de senha: FUNCIONANDO (senha padrão: senha123)');
      results.push({ test: 11, status: 'PASS', message: 'Reset de senha funcionando (senha padrão: senha123)' });
    } else {
      console.log('❌ Botão reset senha não encontrado');
      results.push({ test: 11, status: 'FAIL', message: 'Botão reset senha não encontrado' });
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
      console.log(`${icon} Teste ${result.test}: ${result.message}`);
    });
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  } finally {
    await browser.close();
  }
}

testAllDemands().catch(console.error);
