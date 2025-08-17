// Script para testar a saúde do sistema
console.log('🏥 Testando saúde do sistema...');

// Testar se o servidor está respondendo
async function testServerHealth() {
  try {
    const ports = [3000, 3001, 3002];
    
    for (const port of ports) {
      try {
        const response = await fetch(`http://localhost:${port}`);
        if (response.ok) {
          console.log(`✅ Servidor rodando na porta ${port}`);
          return port;
        }
      } catch (error) {
        console.log(`❌ Porta ${port} não está respondendo`);
      }
    }
    
    console.log('❌ Nenhum servidor está rodando');
    return null;
  } catch (error) {
    console.error('❌ Erro ao testar servidor:', error);
    return null;
  }
}

// Testar se a API está funcionando
async function testAPIHealth() {
  try {
    const response = await fetch('http://localhost:3000/api/health');
    if (response.ok) {
      console.log('✅ API está funcionando');
      return true;
    } else {
      console.log('⚠️ API retornou status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ API não está respondendo');
    return false;
  }
}

// Testar se o Supabase está acessível
async function testSupabaseConnection() {
  try {
    const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
    const response = await fetch(`${supabaseUrl}/rest/v1/segments?select=id&limit=1`, {
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc'
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase está acessível');
      return true;
    } else {
      console.log('⚠️ Supabase retornou status:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Supabase não está acessível:', error.message);
    return false;
  }
}

// Executar todos os testes
async function runHealthChecks() {
  console.log('\n🔍 Iniciando verificações de saúde...\n');
  
  const serverPort = await testServerHealth();
  const apiHealth = await testAPIHealth();
  const supabaseHealth = await testSupabaseConnection();
  
  console.log('\n📊 Resumo dos testes:');
  console.log(`- Servidor: ${serverPort ? '✅ Funcionando' : '❌ Não funcionando'}`);
  console.log(`- API: ${apiHealth ? '✅ Funcionando' : '❌ Não funcionando'}`);
  console.log(`- Supabase: ${supabaseHealth ? '✅ Funcionando' : '❌ Não funcionando'}`);
  
  if (serverPort && supabaseHealth) {
    console.log('\n🎉 Sistema está saudável!');
    console.log(`🌐 Acesse: http://localhost:${serverPort}`);
  } else {
    console.log('\n⚠️ Sistema tem problemas que precisam ser corrigidos');
  }
}

// Executar os testes
runHealthChecks();


