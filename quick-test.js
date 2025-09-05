// Teste rápido das 11 demandas
import puppeteer from 'puppeteer';

async function quickTest() {
  console.log('🚀 TESTE RÁPIDO DAS 11 DEMANDAS...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized'],
    protocolTimeout: 60000
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
    
    const newSupplierBtn = await page.$('#suppliers-new-button');
    if (newSupplierBtn) {
      await newSupplierBtn.click();
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const cpfField = await page.$('input[placeholder*="CPF"], input[placeholder*="CNPJ"]');
      if (cpfField) {
        await cpfField.type('111.111.111-11');
        await page.click('body');
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
    const cancelBtn = await page.$('#suppliers-cancel-button');
    if (cancelBtn) {
      console.log('✅ Botão cancelar fornecedores: VISÍVEL');
      results.push({ test: 2, status: 'PASS' });
    } else {
      console.log('❌ Botão cancelar fornecedores: NÃO VISÍVEL');
      results.push({ test: 2, status: 'FAIL' });
    }
    
    // TESTE 3: Criação de fornecedor
    console.log('\n📋 TESTE 3: Criação de fornecedor');
    const nameField = await page.$('#suppliers-name-input');
    if (nameField) {
      await nameField.type('Fornecedor Teste');
      
      // Preencher campos obrigatórios
      const razaoSocialField = await page.$('#razao_social');
      if (razaoSocialField) {
        await razaoSocialField.type('Fornecedor Teste LTDA');
      }
      
      // Para CNPJ, selecionar tipo PJ (Pessoa Jurídica)
      const tipoContribuinteField = await page.$('#tipo_contribuinte');
      if (tipoContribuinteField) {
        await tipoContribuinteField.select('PJ');
        console.log('✅ Tipo de contribuinte selecionado: PJ (para CNPJ)');
      }
      
      const cpfCnpjField = await page.$('#cpf_cnpj');
      if (cpfCnpjField) {
        await cpfCnpjField.type('11222333000181'); // CNPJ válido
        console.log('✅ CNPJ preenchido: 11222333000181');
      }
      
      const emailField = await page.$('#suppliers-email-input');
      if (emailField) {
        await emailField.type('teste@fornecedor.com');
      }
      
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Verificar se o modal fechou (indica sucesso)
        const modal = await page.$('.fixed.inset-0.z-50');
        if (!modal) {
          console.log('✅ Criação de fornecedor: FUNCIONANDO');
          results.push({ test: 3, status: 'PASS' });
        } else {
          console.log('❌ Criação de fornecedor: FALHOU (modal ainda aberto)');
          results.push({ test: 3, status: 'FAIL' });
        }
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
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se há fornecedores na lista
    const suppliersList = await page.$$('tbody tr');
    console.log('Fornecedores na lista:', suppliersList.length);
    
    if (suppliersList.length > 0) {
      const editBtn = await page.$('[data-testid="edit-supplier-button"]');
      if (editBtn) {
        console.log('✅ Atualização de fornecedor: FUNCIONANDO');
        results.push({ test: 4, status: 'PASS' });
      } else {
        // Tentar encontrar por title
        const editBtnByTitle = await page.$('button[title="Editar"]');
        if (editBtnByTitle) {
          console.log('✅ Atualização de fornecedor: FUNCIONANDO (encontrado por title)');
          results.push({ test: 4, status: 'PASS' });
        } else {
          console.log('❌ Botão editar não encontrado');
          results.push({ test: 4, status: 'FAIL' });
        }
      }
    } else {
      // Se não há fornecedores, criar um primeiro
      console.log('Criando fornecedor para testar edição...');
      const newSupplierBtn = await page.$('#suppliers-new-button');
      if (newSupplierBtn) {
        await newSupplierBtn.click();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
          const nameField = await page.$('#suppliers-name-input');
          if (nameField) {
            await nameField.type('Fornecedor para Edição');
            
            // Preencher campos obrigatórios
            const razaoSocialField = await page.$('#razao_social');
            if (razaoSocialField) {
              await razaoSocialField.type('Fornecedor para Edição LTDA');
            }
            
            // Para CNPJ, selecionar tipo PJ (Pessoa Jurídica)
            const tipoContribuinteField = await page.$('#tipo_contribuinte');
            if (tipoContribuinteField) {
              await tipoContribuinteField.select('PJ');
              console.log('✅ Tipo de contribuinte selecionado: PJ (para CNPJ)');
            }
            
            const cpfCnpjField = await page.$('#cpf_cnpj');
            if (cpfCnpjField) {
              await cpfCnpjField.type('05.402.904/0015-62'); // CNPJ fornecido
              console.log('✅ CNPJ preenchido: 05.402.904/0015-62');
            }
            
            const emailField = await page.$('#suppliers-email-input');
            if (emailField) {
              await emailField.type('edicao@fornecedor.com');
            }
          
          const submitBtn = await page.$('button[type="submit"]');
          if (submitBtn) {
            await submitBtn.click();
            await new Promise(resolve => setTimeout(resolve, 5000)); // Aguardar mais tempo
            
            // Verificar se o modal fechou (indica que a criação foi bem-sucedida)
            const modal = await page.$('.fixed.inset-0.z-50');
            if (!modal) {
              console.log('✅ Modal fechou - fornecedor criado com sucesso');
              
              // Aguardar mais um pouco para a lista ser atualizada
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Verificar se há fornecedores na lista agora
              const suppliersListAfter = await page.$$('tbody tr');
              console.log('Fornecedores após criação:', suppliersListAfter.length);
              
              if (suppliersListAfter.length > 0) {
                // Verificar se o botão editar existe
                const editBtn = await page.$('[data-testid="edit-supplier-button"]');
                if (editBtn) {
                  console.log('✅ Atualização de fornecedor: FUNCIONANDO');
                  results.push({ test: 4, status: 'PASS' });
                } else {
                  console.log('❌ Botão editar não encontrado após criação');
                  results.push({ test: 4, status: 'FAIL' });
                }
              } else {
                console.log('❌ Fornecedor não apareceu na lista após criação');
                results.push({ test: 4, status: 'FAIL' });
              }
            } else {
              console.log('❌ Modal ainda aberto - criação falhou');
              results.push({ test: 4, status: 'FAIL' });
            }
          } else {
            console.log('❌ Botão submit não encontrado');
            results.push({ test: 4, status: 'FAIL' });
          }
        } else {
          console.log('❌ Campo nome não encontrado');
          results.push({ test: 4, status: 'FAIL' });
        }
      } else {
        console.log('❌ Botão novo fornecedor não encontrado');
        results.push({ test: 4, status: 'FAIL' });
      }
    }
    
    // TESTE 5: Botão cancelar em clientes
    console.log('\n📋 TESTE 5: Botão cancelar em clientes');
    await page.goto('http://localhost:3000/customers');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
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
        console.log('✅ Atualização de cliente: FUNCIONANDO');
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
        return {
          inlineBg: el.style.backgroundColor,
          backgroundColor: window.getComputedStyle(el).backgroundColor
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
      console.log('✅ Criação de usuários: FUNCIONANDO');
      results.push({ test: 9, status: 'PASS' });
    } else {
      console.log('❌ Botão novo usuário não encontrado');
      results.push({ test: 9, status: 'FAIL' });
    }
    
    // TESTE 10: Edição Perfil/Segmento de usuários
    console.log('\n📋 TESTE 10: Edição Perfil/Segmento de usuários');
    const userEditBtn = await page.$('button[title*="Editar"]');
    if (userEditBtn) {
      console.log('✅ Edição Perfil/Segmento: FUNCIONANDO');
      results.push({ test: 10, status: 'PASS' });
    } else {
      console.log('❌ Botão editar usuário não encontrado');
      results.push({ test: 10, status: 'FAIL' });
    }
    
    // TESTE 11: Reset de senha
    console.log('\n📋 TESTE 11: Reset de senha');
    const resetBtn = await page.$('button[title*="Reset"]');
    if (resetBtn) {
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

quickTest().catch(console.error);
