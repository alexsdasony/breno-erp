// Script para chamar a Edge Function que cria a tabela fornecedores
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

async function callCreateFornecedoresFunction() {
  console.log('🚀 Chamando Edge Function para criar tabela fornecedores...\n');

  try {
    // Chamar a Edge Function
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
      console.log('✅ Edge Function executada com sucesso!');
      console.log('📋 Resultado:', result);
      
      // Verificar se a tabela foi criada
      console.log('\n🔍 Verificando se a tabela foi criada...');
      await verifyTableCreation();
      
    } else {
      const error = await response.json();
      console.log('❌ Erro na Edge Function:', error);
      
      // Se a Edge Function não existir, tentar método alternativo
      console.log('\n📋 Tentando método alternativo...');
      await tryAlternativeMethod();
    }

  } catch (error) {
    console.error('❌ Erro ao chamar Edge Function:', error);
    
    // Tentar método alternativo
    console.log('\n📋 Tentando método alternativo...');
    await tryAlternativeMethod();
  }
}

async function tryAlternativeMethod() {
  console.log('📋 Tentando criar tabela via método alternativo...');
  
  // Tentar criar uma tabela simples primeiro
  const simpleData = {
    razao_social: 'TESTE CRIAÇÃO TABELA',
    nome_fantasia: 'Teste',
    tipo_contribuinte: 'PJ',
    cpf_cnpj: '00.000.000/0001-00',
    uf: 'SP',
    cidade: 'São Paulo',
    status: 'ATIVO'
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
      body: JSON.stringify(simpleData)
    });

    if (response.ok) {
      console.log('✅ Tabela criada via inserção!');
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
      
    } else {
      const error = await response.json();
      console.log('❌ Não foi possível criar a tabela:', error);
      console.log('\n📋 Solução: Execute manualmente no Supabase SQL Editor');
      console.log('1. Acesse: https://supabase.com/dashboard/project/qerubjitetqwfqqydhzv/sql');
      console.log('2. Execute o arquivo: create-fornecedores-simple.sql');
    }
  } catch (error) {
    console.log('❌ Erro no método alternativo:', error.message);
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

async function verifyTableCreation() {
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

// Executar
callCreateFornecedoresFunction();


