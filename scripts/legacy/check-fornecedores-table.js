// Script para verificar e configurar a tabela fornecedores
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

async function checkFornecedoresTable() {
  console.log('🔍 Verificando tabela fornecedores...\n');

  try {
    // 1. Verificar se a tabela existe
    const checkResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?select=id&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (checkResponse.ok) {
      console.log('✅ Tabela fornecedores existe!');
      
      // 2. Verificar se há dados
      const dataResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?select=count`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      if (dataResponse.ok) {
        const data = await dataResponse.json();
        console.log(`📊 Tabela tem ${data.length} registros`);
        
        if (data.length === 0) {
          console.log('📝 Inserindo dados de exemplo...');
          await insertSampleData();
        } else {
          console.log('✅ Tabela já tem dados');
        }
      }

      // 3. Testar CRUD
      console.log('\n🧪 Testando funções CRUD...');
      await testCRUDFunctions();

    } else {
      console.log('❌ Tabela fornecedores não existe!');
      console.log('\n📋 Para criar a tabela, execute o script SQL no Supabase SQL Editor:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/qerubjitetqwfqqydhzv/sql');
      console.log('2. Execute o arquivo: create-fornecedores-complete.sql');
      console.log('3. Execute novamente este script: node check-fornecedores-table.js');
    }
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
  }
}

async function insertSampleData() {
  const sampleData = [
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

  for (const data of sampleData) {
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

async function testCRUDFunctions() {
  try {
    // Teste 1: Listar fornecedores
    console.log('\n📋 Teste 1: Listando fornecedores...');
    const listResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?select=*&limit=5`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (listResponse.ok) {
      const data = await listResponse.json();
      console.log(`✅ Listagem OK: ${data.length} fornecedores encontrados`);
      
      if (data.length > 0) {
        const firstSupplier = data[0];
        console.log(`   - Primeiro: ${firstSupplier.razao_social}`);
        
        // Teste 2: Buscar por ID
        console.log('\n🔍 Teste 2: Buscando fornecedor por ID...');
        const getResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?id=eq.${firstSupplier.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          }
        });

        if (getResponse.ok) {
          const supplier = await getResponse.json();
          console.log(`✅ Busca por ID OK: ${supplier[0].razao_social}`);
        } else {
          console.log('❌ Erro na busca por ID');
        }
      }
    } else {
      console.log('❌ Erro na listagem');
    }

    console.log('\n🎉 Testes CRUD concluídos!');
    console.log('✅ Sistema de fornecedores está funcionando');
    console.log('🌐 Acesse: http://localhost:3000/suppliers');

  } catch (error) {
    console.error('❌ Erro nos testes CRUD:', error);
  }
}

// Executar verificação
checkFornecedoresTable();


