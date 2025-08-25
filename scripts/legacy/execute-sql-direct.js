// Script para executar SQL diretamente no Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

async function executeSQLDirect() {
  console.log('🚀 Executando SQL diretamente no Supabase...\n');

  try {
    // Método 1: Tentar usar pg_dump/pg_restore via API
    console.log('📋 Método 1: Tentando via pg_restore...');
    await tryPgRestore();

    // Método 2: Tentar usar função RPC personalizada
    console.log('\n📋 Método 2: Tentando RPC personalizada...');
    await tryCustomRPC();

    // Método 3: Tentar criar tabela via migração
    console.log('\n📋 Método 3: Tentando migração...');
    await tryMigration();

    // Método 4: Tentar criar tabela via inserção com estrutura completa
    console.log('\n📋 Método 4: Tentando criar via inserção completa...');
    await tryCreateViaCompleteInsert();

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function tryPgRestore() {
  // Tentar usar pg_restore via API (não funciona, mas vamos tentar)
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/pg_restore`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        sql: 'CREATE TABLE fornecedores (id SERIAL PRIMARY KEY, razao_social VARCHAR(255));'
      })
    });

    if (response.ok) {
      console.log('✅ pg_restore funcionou!');
      return true;
    } else {
      console.log('❌ pg_restore não disponível');
      return false;
    }
  } catch (error) {
    console.log('❌ Erro no pg_restore:', error.message);
    return false;
  }
}

async function tryCustomRPC() {
  // Tentar diferentes nomes de funções RPC
  const rpcFunctions = [
    'exec_sql',
    'sql',
    'execute_sql',
    'run_sql',
    'execute_query',
    'db_execute'
  ];

  for (const funcName of rpcFunctions) {
    try {
      console.log(`   Tentando ${funcName}...`);
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${funcName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        },
        body: JSON.stringify({
          sql: 'CREATE TABLE fornecedores (id SERIAL PRIMARY KEY, razao_social VARCHAR(255));'
        })
      });

      if (response.ok) {
        console.log(`✅ ${funcName} funcionou!`);
        return true;
      } else {
        const error = await response.json();
        console.log(`   ❌ ${funcName}: ${error.message}`);
      }
    } catch (error) {
      console.log(`   ❌ ${funcName}: ${error.message}`);
    }
  }
  
  console.log('❌ Nenhuma função RPC disponível');
  return false;
}

async function tryMigration() {
  // Tentar usar API de migração (não existe, mas vamos tentar)
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/migrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        name: 'create_fornecedores',
        sql: 'CREATE TABLE fornecedores (id SERIAL PRIMARY KEY, razao_social VARCHAR(255));'
      })
    });

    if (response.ok) {
      console.log('✅ Migração funcionou!');
      return true;
    } else {
      console.log('❌ API de migração não disponível');
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na migração:', error.message);
    return false;
  }
}

async function tryCreateViaCompleteInsert() {
  // Tentar inserir dados completos para forçar criação da tabela
  const completeData = {
    razao_social: 'TESTE CRIAÇÃO COMPLETA',
    nome_fantasia: 'Teste',
    ramo_atividade: 'Teste',
    tipo_contribuinte: 'PJ',
    cpf_cnpj: '00.000.000/0001-00',
    inscricao_estadual: '000000000',
    inscricao_municipal: '000000000',
    uf: 'SP',
    cidade: 'São Paulo',
    cep: '00000-000',
    endereco: 'Rua Teste',
    numero: '0',
    complemento: 'Teste',
    bairro: 'Teste',
    pessoa_contato: 'Teste',
    telefone_fixo: '(00) 0000-0000',
    telefone_celular: '(00) 00000-0000',
    email: 'teste@teste.com',
    site: 'www.teste.com',
    banco_nome: 'Banco Teste',
    banco_codigo: '000',
    agencia_numero: '0000',
    agencia_digito: '0',
    conta_numero: '00000-0',
    conta_digito: '0',
    pix_chave: 'teste@teste.com',
    condicao_pagamento: '0 dias',
    status: 'ATIVO',
    observacoes: 'Teste de criação'
  };

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/fornecedores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(completeData)
    });

    if (response.ok) {
      console.log('✅ Tabela criada via inserção completa!');
      const data = await response.json();
      
      // Deletar o registro de teste
      await fetch(`${supabaseUrl}/rest/v1/fornecedores?id=eq.${data[0].id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
      
      // Inserir dados reais
      await insertRealData();
      return true;
      
    } else {
      const error = await response.json();
      console.log('❌ Inserção completa falhou:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na inserção completa:', error.message);
    return false;
  }
}

async function insertRealData() {
  console.log('\n📝 Inserindo dados reais...');
  
  const realData = [
    {
      razao_social: 'TECNOLOGIA AVANÇADA LTDA',
      nome_fantasia: 'TecAv',
      ramo_atividade: 'Tecnologia da Informação',
      tipo_contribuinte: 'PJ',
      cpf_cnpj: '12.345.678/0001-90',
      inscricao_estadual: '123456789',
      uf: 'SP',
      cidade: 'São Paulo',
      cep: '01234-567',
      endereco: 'Rua das Tecnologias',
      numero: '100',
      bairro: 'Centro',
      pessoa_contato: 'João Silva',
      telefone_fixo: '(11) 3333-4444',
      telefone_celular: '(11) 99999-8888',
      email: 'contato@tecav.com.br',
      banco_nome: 'Banco do Brasil',
      banco_codigo: '001',
      agencia_numero: '1234',
      conta_numero: '12345-6',
      condicao_pagamento: '30 dias',
      observacoes: 'Fornecedor de sistemas e equipamentos'
    },
    {
      razao_social: 'MATERIAIS CONSTRUÇÃO LTDA',
      nome_fantasia: 'MatCon',
      ramo_atividade: 'Construção Civil',
      tipo_contribuinte: 'PJ',
      cpf_cnpj: '98.765.432/0001-10',
      inscricao_estadual: '987654321',
      uf: 'RJ',
      cidade: 'Rio de Janeiro',
      cep: '20000-000',
      endereco: 'Av. da Construção',
      numero: '500',
      bairro: 'Copacabana',
      pessoa_contato: 'Maria Santos',
      telefone_fixo: '(21) 2222-3333',
      telefone_celular: '(21) 88888-7777',
      email: 'vendas@matcon.com.br',
      banco_nome: 'Itaú',
      banco_codigo: '341',
      agencia_numero: '5678',
      conta_numero: '98765-4',
      condicao_pagamento: '15 dias',
      observacoes: 'Fornecedor de materiais de construção'
    }
  ];

  for (const data of realData) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/fornecedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Inserido: ${result[0].razao_social}`);
      } else {
        console.log(`❌ Erro ao inserir: ${data.razao_social}`);
      }
    } catch (error) {
      console.log(`❌ Erro ao inserir ${data.razao_social}:`, error.message);
    }
  }
}

// Executar
executeSQLDirect();


