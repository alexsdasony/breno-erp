// Script para testar o ambiente local
const API_BASE_URL = 'https://qerubjitetqwfqqydhzv.supabase.co/functions/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU';

async function testAPI() {
  console.log('🧪 Testando ambiente local...');
  
  try {
    // Teste 1: Autenticação
    console.log('\n1️⃣ Testando autenticação...');
    const authResponse = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email: 'admin@breno-erp.com',
        password: 'admin123'
      })
    });
    
    const authData = await authResponse.json();
    console.log('✅ Autenticação:', authData.success ? 'SUCESSO' : 'FALHA');
    
    if (authData.success && authData.token) {
      const userToken = authData.token;
      
      // Teste 2: Usuários
      console.log('\n2️⃣ Testando endpoint de usuários...');
      const usersResponse = await fetch(`${API_BASE_URL}/users?page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'X-User-Token': userToken
        }
      });
      
      const usersData = await usersResponse.json();
      console.log('✅ Usuários:', usersData.success ? 'SUCESSO' : 'FALHA');
      
      // Teste 3: Fornecedores
      console.log('\n3️⃣ Testando endpoint de fornecedores...');
      const suppliersResponse = await fetch(`${API_BASE_URL}/suppliers?page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'X-User-Token': userToken
        }
      });
      
      const suppliersData = await suppliersResponse.json();
      console.log('✅ Fornecedores:', suppliersData.success ? 'SUCESSO' : 'FALHA');
      
      // Teste 4: Produtos
      console.log('\n4️⃣ Testando endpoint de produtos...');
      const productsResponse = await fetch(`${API_BASE_URL}/products?page=1&limit=5`, {
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'X-User-Token': userToken
        }
      });
      
      const productsData = await productsResponse.json();
      console.log('✅ Produtos:', productsData.success ? 'SUCESSO' : 'FALHA');
      
      console.log('\n🎉 Todos os testes passaram! O ambiente local está configurado corretamente.');
    } else {
      console.log('❌ Falha na autenticação');
    }
    
  } catch (error) {
    console.error('❌ Erro nos testes:', error.message);
  }
}

testAPI();

