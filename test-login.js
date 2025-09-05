// Teste de login
import puppeteer from 'puppeteer';

async function testLogin() {
  console.log('🧪 TESTANDO LOGIN...\n');
  
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
    
    // Verificar campos disponíveis
    const emailField = await page.$('input[type="email"]');
    const passwordField = await page.$('input[type="password"]');
    const submitButton = await page.$('button[type="submit"]');
    
    console.log('2️⃣ Campos encontrados:');
    console.log('  - Email:', emailField ? '✅' : '❌');
    console.log('  - Password:', passwordField ? '✅' : '❌');
    console.log('  - Submit:', submitButton ? '✅' : '❌');
    
    if (emailField && passwordField && submitButton) {
      // Tentar diferentes credenciais
      const credentials = [
        { email: 'admin@erppro.com', password: 'admin123' },
        { email: 'admin@brenoerp.com', password: 'admin123' },
        { email: 'admin', password: 'admin' },
        { email: 'admin@admin.com', password: 'admin' }
      ];
      
      for (let cred of credentials) {
        console.log(`3️⃣ Tentando: ${cred.email} / ${cred.password}`);
        
        // Limpar campos
        await page.evaluate(() => {
          document.querySelector('input[type="email"]').value = '';
          document.querySelector('input[type="password"]').value = '';
        });
        
        // Preencher campos
        await page.type('input[type="email"]', cred.email);
        await page.type('input[type="password"]', cred.password);
        
        // Clicar em submit
        await page.click('button[type="submit"]');
        
        // Aguardar resposta
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const currentUrl = page.url();
        console.log(`   URL atual: ${currentUrl}`);
        
        if (currentUrl !== 'http://localhost:3000/login') {
          console.log('✅ Login funcionou!');
          break;
        } else {
          console.log('❌ Login falhou');
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
  } finally {
    await browser.close();
  }
}

testLogin().catch(console.error);
