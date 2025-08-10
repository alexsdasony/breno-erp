import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

// Configurar faker para português brasileiro
faker.locale = 'pt_BR';

const USER = { email: 'admin@breno-erp.com', password: 'Admin@2024' };

// Função para gerar CPF válido
function generateValidCPF() {
  const cpf = faker.string.numeric(11);
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Função para gerar CNPJ válido
function generateValidCNPJ() {
  const cnpj = faker.string.numeric(14);
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Função para gerar RG válido
function generateValidRG() {
  const rg = faker.string.numeric(9);
  return rg.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
}

// Função para gerar CEP válido
function generateValidCEP() {
  const cep = faker.string.numeric(8);
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}

test('Formulário de Clientes - Caminho Feliz Completo com Dados Realistas', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('#login-email', USER.email);
  await page.fill('#login-password', USER.password);
  await page.click('#login-submit-button');
  await page.waitForURL('**/dashboard', { timeout: 20000 });

  // Ir para Clientes e abrir formulário
  await page.click('#menu-customers');
  await page.waitForURL('**/customers', { timeout: 10000 });
  await page.click('#customers-new-button');
  await page.waitForURL('**/customer-form', { timeout: 10000 });

  // Gerar dados realistas brasileiros (apenas campos que são salvos na tabela partners)
  const customerData = {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    cpf: generateValidCPF(),
    phone: faker.phone.number('(##) #####-####'),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.helpers.arrayElement(['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO']),
    cep: generateValidCEP()
  };

  console.log('📝 Dados gerados:', customerData);

  // ABA 1: Dados Pessoais (apenas campos essenciais)
  console.log('🔄 Preenchendo dados pessoais...');
  await page.waitForSelector('#customer-segment-select', { timeout: 10000 });
  await page.selectOption('#customer-segment-select', { index: 1 });
  await page.fill('#customer-name-input', customerData.name);
  await page.selectOption('#customer-person-type-select', 'pf');
  await page.fill('#customer-document-input', customerData.cpf);

  // ABA 3: Contato
  console.log('🔄 Preenchendo dados de contato...');
  await page.click('#customer-tab-contato');
  await page.waitForTimeout(1000);
  await page.fill('#customer-email-input', customerData.email);
  await page.fill('#customer-phone-input', customerData.phone);

  // ABA 4: Endereço
  console.log('🔄 Preenchendo dados de endereço...');
  await page.click('#customer-tab-endereco');
  await page.waitForTimeout(1000);
  await page.fill('#customer-address-input', customerData.address);
  await page.fill('#customer-address-number-input', faker.number.int({ min: 1, max: 9999 }).toString());
  await page.fill('#customer-neighborhood-input', faker.helpers.arrayElement(['Centro', 'Vila Nova', 'Jardim América', 'Boa Vista', 'São José']));
  await page.fill('#customer-city-input', customerData.city);
  await page.selectOption('#customer-state-select', customerData.state);
  await page.fill('#customer-cep-input', customerData.cep);

  // Salvar cliente
  console.log('💾 Salvando cliente...');
  await page.click('#customer-form-save-button');
  
  // Aguardar qualquer toast (sucesso ou erro)
  const anyToast = page.locator('[id^="toast-"]');
  await anyToast.first().waitFor({ state: 'visible', timeout: 15000 });
  
  // Verificar se foi redirecionado para a lista de clientes
  await page.waitForURL('**/customers', { timeout: 10000 });
  
  // Aguardar um pouco para garantir que os dados foram carregados
  await page.waitForTimeout(3000);
  
  // Verificar se a tabela está visível
  await page.waitForSelector('#customers-table', { timeout: 10000 });
  await page.waitForSelector('tbody', { timeout: 10000 });
  
  // Verificar se o cliente foi realmente salvo na lista
  const customerRow = page.locator(`tr:has-text("${customerData.name}")`);
  await expect(customerRow).toBeVisible();
  
  // Verificar se a linha tem o ID único esperado (customers-row-{id})
  const rowId = await customerRow.getAttribute('id');
  console.log('🔍 ID da linha encontrada:', rowId);
  
  // Verificar se o ID segue o padrão esperado
  expect(rowId).toMatch(/^customers-row-/);
  
  console.log('✅ Formulário de clientes funcionando perfeitamente!');
  console.log('👤 Cliente criado:', customerData.name);
  console.log('🆔 ID da linha:', rowId);
});

test('Teste de Validação - Campos Obrigatórios', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('#login-email', USER.email);
  await page.fill('#login-password', USER.password);
  await page.click('#login-submit-button');
  await page.waitForURL('**/dashboard', { timeout: 20000 });

  // Ir para Clientes e abrir formulário
  await page.click('#menu-customers');
  await page.waitForURL('**/customers', { timeout: 10000 });
  await page.click('#customers-new-button');
  await page.waitForURL('**/customer-form', { timeout: 10000 });

  // Tentar salvar sem preencher campos obrigatórios
  await page.click('#customer-form-save-button');
  
  // Aguardar toast de erro
  const errorToast = page.locator('[id^="toast-destructive-"]');
  await errorToast.first().waitFor({ state: 'visible', timeout: 5000 });
  
  console.log('✅ Validação de campos obrigatórios funcionando!');
});

test('Teste de Navegação entre Abas', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('#login-email', USER.email);
  await page.fill('#login-password', USER.password);
  await page.click('#login-submit-button');
  await page.waitForURL('**/dashboard', { timeout: 20000 });

  // Ir para Clientes e abrir formulário
  await page.click('#menu-customers');
  await page.waitForURL('**/customers', { timeout: 10000 });
  await page.click('#customers-new-button');
  await page.waitForURL('**/customer-form', { timeout: 10000 });

  // Testar navegação entre todas as abas
  const tabs = [
    'dados-pessoais',
    'dados-profissionais', 
    'contato',
    'endereco',
    'patrimonio',
    'sistema'
  ];

  for (const tab of tabs) {
    await page.click(`#customer-tab-${tab}`);
    await page.waitForTimeout(500);
    await expect(page.locator(`#customer-tab-${tab}`)).toHaveClass(/border-purple-500/);
    console.log(`✅ Aba ${tab} acessada com sucesso`);
  }

  console.log('✅ Navegação entre abas funcionando perfeitamente!');
});
