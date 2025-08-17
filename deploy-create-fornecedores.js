// Script para fazer deploy da Edge Function create-fornecedores
const { exec } = require('child_process');
const path = require('path');

async function deployCreateFornecedores() {
  console.log('🚀 Fazendo deploy da Edge Function create-fornecedores...\n');

  try {
    // Verificar se o Supabase CLI está instalado
    console.log('📋 Verificando Supabase CLI...');
    await executeCommand('supabase --version');

    // Fazer deploy da função
    console.log('\n📋 Fazendo deploy da função create-fornecedores...');
    const deployCommand = 'supabase functions deploy create-fornecedores --project-ref qerubjitetqwfqqydhzv';
    
    await executeCommand(deployCommand);

    console.log('\n✅ Deploy concluído!');
    console.log('🌐 URL da função: https://qerubjitetqwfqqydhzv.supabase.co/functions/v1/create-fornecedores');
    
    // Testar a função
    console.log('\n🧪 Testando a função...');
    await testFunction();

  } catch (error) {
    console.error('❌ Erro no deploy:', error.message);
    
    // Instruções alternativas
    console.log('\n📋 Instruções alternativas:');
    console.log('1. Instale o Supabase CLI: npm install -g supabase');
    console.log('2. Faça login: supabase login');
    console.log('3. Execute: supabase functions deploy create-fornecedores --project-ref qerubjitetqwfqqydhzv');
  }
}

function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Executando: ${command}`);
    
    exec(command, { cwd: process.cwd() }, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Erro: ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.log(`⚠️ Aviso: ${stderr}`);
      }
      
      console.log(`✅ Sucesso: ${stdout}`);
      resolve(stdout);
    });
  });
}

async function testFunction() {
  const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

  try {
    console.log('📋 Chamando a Edge Function...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/create-fornecedores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({})
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Função executada com sucesso!');
      console.log('📋 Resultado:', result);
      
      // Verificar se a tabela foi criada
      console.log('\n🔍 Verificando se a tabela foi criada...');
      await verifyTableCreation();
      
    } else {
      const error = await response.json();
      console.log('❌ Erro na função:', error);
    }

  } catch (error) {
    console.error('❌ Erro ao testar função:', error);
  }
}

async function verifyTableCreation() {
  const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/fornecedores?select=*&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Verificação OK: ${data.length} fornecedores encontrados`);
      
      if (data.length > 0) {
        console.log('📋 Fornecedores criados:');
        data.forEach((supplier, index) => {
          console.log(`   ${index + 1}. ${supplier.razao_social} (${supplier.uf})`);
        });
      }
      
      console.log('\n🎉 Tabela fornecedores criada com sucesso!');
      console.log('🌐 Acesse: http://localhost:3000/suppliers');
      console.log('✅ Sistema pronto para uso!');
      
    } else {
      console.log('❌ Erro na verificação da tabela');
    }
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar deploy
deployCreateFornecedores();


