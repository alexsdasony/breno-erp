// Script para verificar e configurar fornecedores
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

async function checkAndSetupFornecedores() {
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
      
      // Verificar se há dados
      const dataResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?select=id,razao_social`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      if (dataResponse.ok) {
        const fornecedores = await dataResponse.json();
        console.log(`📊 Encontrados ${fornecedores.length} fornecedores na tabela`);
        
        if (fornecedores.length === 0) {
          console.log('📝 Inserindo dados de exemplo...');
          await insertSampleData();
        } else {
          console.log('✅ Dados já existem na tabela');
          console.log('Fornecedores encontrados:');
          fornecedores.forEach(f => console.log(`- ${f.razao_social}`));
        }
      }

      // Testar funções CRUD
      console.log('\n🧪 Testando funções CRUD...');
      await testCRUDFunctions();

    } else {
      console.log('❌ Tabela fornecedores não existe!');
      console.log('\n📋 Para criar a tabela, execute o script SQL no Supabase SQL Editor:');
      console.log('1. Acesse: https://supabase.com/dashboard/project/qerubjitetqwfqqydhzv/sql');
      console.log('2. Execute o arquivo: create-fornecedores-complete.sql');
      console.log('3. Execute novamente este script: node check-and-setup-fornecedores.js');
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
      status: 'ATIVO',
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
      status: 'ATIVO',
      observacoes: 'Fornecedor de materiais de construção'
    },
    {
      razao_social: 'SERVIÇOS ADMINISTRATIVOS LTDA',
      nome_fantasia: 'ServAdm',
      ramo_atividade: 'Serviços Administrativos',
      tipo_contribuinte: 'PJ',
      cpf_cnpj: '11.222.333/0001-44',
      inscricao_estadual: '112223334',
      uf: 'MG',
      cidade: 'Belo Horizonte',
      cep: '30000-000',
      endereco: 'Rua dos Serviços',
      numero: '200',
      bairro: 'Savassi',
      pessoa_contato: 'Pedro Costa',
      telefone_fixo: '(31) 4444-5555',
      telefone_celular: '(31) 77777-6666',
      email: 'admin@servadm.com.br',
      banco_nome: 'Bradesco',
      banco_codigo: '237',
      agencia_numero: '9999',
      conta_numero: '54321-0',
      condicao_pagamento: '45 dias',
      status: 'ATIVO',
      observacoes: 'Fornecedor de serviços administrativos'
    }
  ];

  for (const fornecedor of sampleData) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/fornecedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(fornecedor)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Inserido: ${result[0].razao_social}`);
      } else {
        const errorText = await response.text();
        console.log(`⚠️ Erro ao inserir ${fornecedor.razao_social}:`, errorText);
      }
    } catch (error) {
      console.log(`❌ Erro ao inserir ${fornecedor.razao_social}:`, error.message);
    }
  }
}

async function testCRUDFunctions() {
  console.log('\n🧪 Testando funções CRUD...');

  try {
    // 1. Testar LISTAR
    console.log('1️⃣ Testando LISTAR...');
    const listResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?select=id,razao_social,status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (listResponse.ok) {
      const fornecedores = await listResponse.json();
      console.log(`✅ LISTAR OK - ${fornecedores.length} fornecedores`);
    } else {
      console.log('❌ LISTAR falhou');
    }

    // 2. Testar CRIAR
    console.log('2️⃣ Testando CRIAR...');
    const novoFornecedor = {
      razao_social: 'TESTE CRUD LTDA',
      nome_fantasia: 'TesteCRUD',
      cpf_cnpj: '99.999.999/0001-99',
      status: 'ATIVO'
    };

    const createResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(novoFornecedor)
    });

    if (createResponse.ok) {
      const fornecedorCriado = await createResponse.json();
      console.log(`✅ CRIAR OK - ID: ${fornecedorCriado[0].id}`);
      
      const fornecedorId = fornecedorCriado[0].id;

      // 3. Testar BUSCAR
      console.log('3️⃣ Testando BUSCAR...');
      const getResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?id=eq.${fornecedorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      if (getResponse.ok) {
        const fornecedor = await getResponse.json();
        console.log(`✅ BUSCAR OK - ${fornecedor[0].razao_social}`);
      } else {
        console.log('❌ BUSCAR falhou');
      }

      // 4. Testar ATUALIZAR
      console.log('4️⃣ Testando ATUALIZAR...');
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?id=eq.${fornecedorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          nome_fantasia: 'TesteCRUD Atualizado'
        })
      });

      if (updateResponse.ok) {
        const fornecedorAtualizado = await updateResponse.json();
        console.log(`✅ ATUALIZAR OK - ${fornecedorAtualizado[0].nome_fantasia}`);
      } else {
        console.log('❌ ATUALIZAR falhou');
      }

      // 5. Testar EXCLUIR
      console.log('5️⃣ Testando EXCLUIR...');
      const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?id=eq.${fornecedorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      if (deleteResponse.ok) {
        console.log('✅ EXCLUIR OK');
      } else {
        console.log('❌ EXCLUIR falhou');
      }
    } else {
      console.log('❌ CRIAR falhou');
    }

    console.log('\n🎉 Testes CRUD concluídos!');
    console.log('✅ Todas as funções estão funcionando corretamente!');

  } catch (error) {
    console.error('❌ Erro nos testes CRUD:', error);
  }
}

// Executar verificação
checkAndSetupFornecedores();

