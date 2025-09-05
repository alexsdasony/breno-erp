// Teste simples das demandas
import puppeteer from 'puppeteer';

async function simpleTest() {
  console.log('🧪 TESTE SIMPLES DAS DEMANDAS...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Ir para o sistema
    console.log('1️⃣ Acessando sistema...');
    await page.goto('http://localhost:3000/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Fazer login
    console.log('2️⃣ Fazendo login...');
    await page.type('input[type="email"]', 'admin@brenoerp.com');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar se está logado
    const currentUrl = page.url();
    console.log('3️⃣ URL atual:', currentUrl);
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ Login funcionando');
      
      // Testar rota de fornecedores
      console.log('4️⃣ Testando rota de fornecedores...');
      await page.goto('http://localhost:3000/suppliers');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const suppliersUrl = page.url();
      console.log('URL fornecedores:', suppliersUrl);
      
      // Verificar se há erros no console
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (errors.length > 0) {
        console.log('❌ Erros encontrados:');
        errors.forEach(error => console.log('  -', error));
      } else {
        console.log('✅ Nenhum erro no console');
      }
      
      // Verificar se a página carregou
      const pageContent = await page.content();
      if (pageContent.includes('Gestão de Fornecedores')) {
        console.log('✅ Página de fornecedores carregou');
      } else {
        console.log('❌ Página de fornecedores não carregou');
      }
      
    } else {
      console.log('❌ Login não funcionou');
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  } finally {
    await browser.close();
  }
}

simpleTest().catch(console.error);
