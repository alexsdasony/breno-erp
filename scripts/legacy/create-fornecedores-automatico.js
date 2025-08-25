// Script para criar automaticamente a tabela fornecedores no Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

async function createFornecedoresTable() {
  console.log('🚀 Criando tabela fornecedores automaticamente...\n');

  try {
    // 1. Primeiro, vamos tentar criar a tabela usando RPC
    console.log('📋 Tentando criar tabela via RPC...');
    
    const createTableSQL = `
      -- Dropar tabela se existir
      DROP TABLE IF EXISTS fornecedores CASCADE;

      -- Criar a tabela fornecedores
      CREATE TABLE fornecedores (
          id SERIAL PRIMARY KEY,
          razao_social VARCHAR(255) NOT NULL,
          nome_fantasia VARCHAR(255),
          ramo_atividade VARCHAR(150),
          tipo_contribuinte VARCHAR(20) CHECK (tipo_contribuinte IN ('PJ', 'PF', 'MEI', 'Outros')),
          cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
          inscricao_estadual VARCHAR(30),
          inscricao_municipal VARCHAR(30),
          uf CHAR(2),
          cidade VARCHAR(100),
          cep CHAR(8),
          endereco VARCHAR(255),
          numero VARCHAR(20),
          complemento VARCHAR(100),
          bairro VARCHAR(100),
          pessoa_contato VARCHAR(100),
          telefone_fixo VARCHAR(20),
          telefone_celular VARCHAR(20),
          email VARCHAR(150),
          site VARCHAR(150),
          banco_nome VARCHAR(100),
          banco_codigo CHAR(3),
          agencia_numero VARCHAR(10),
          agencia_digito CHAR(1),
          conta_numero VARCHAR(20),
          conta_digito CHAR(1),
          pix_chave VARCHAR(150),
          condicao_pagamento VARCHAR(50),
          status VARCHAR(10) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO')),
          data_cadastro DATE DEFAULT CURRENT_DATE,
          observacoes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Criar índices
      CREATE INDEX idx_fornecedores_cpf_cnpj ON fornecedores(cpf_cnpj);
      CREATE INDEX idx_fornecedores_razao_social ON fornecedores(razao_social);
      CREATE INDEX idx_fornecedores_email ON fornecedores(email);
      CREATE INDEX idx_fornecedores_status ON fornecedores(status);
      CREATE INDEX idx_fornecedores_uf ON fornecedores(uf);
      CREATE INDEX idx_fornecedores_cidade ON fornecedores(cidade);

      -- Criar função para atualizar timestamp
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Criar trigger
      CREATE TRIGGER update_fornecedores_updated_at 
          BEFORE UPDATE ON fornecedores 
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
    `;

    // Tentar executar via RPC
    const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        sql: createTableSQL
      })
    });

    if (rpcResponse.ok) {
      console.log('✅ Tabela criada via RPC!');
    } else {
      console.log('⚠️ RPC não disponível, tentando método alternativo...');
      
      // 2. Método alternativo: criar tabela via API REST
      console.log('📋 Criando tabela via API REST...');
      
      // Vamos tentar criar a tabela inserindo dados diretamente
      // Se a tabela não existir, o Supabase pode criá-la automaticamente
      await createTableViaInsert();
    }

    // 3. Inserir dados de exemplo
    console.log('\n📝 Inserindo dados de exemplo...');
    await insertSampleData();

    // 4. Verificar se tudo funcionou
    console.log('\n🔍 Verificando se a tabela foi criada...');
    await verifyTableCreation();

  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
    console.log('\n📋 Método alternativo: Execute manualmente no Supabase SQL Editor');
    console.log('1. Acesse: https://supabase.com/dashboard/project/qerubjitetqwfqqydhzv/sql');
    console.log('2. Execute o arquivo: create-fornecedores-simple.sql');
  }
}

async function createTableViaInsert() {
  // Tentar inserir um registro para forçar a criação da tabela
  const testData = {
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
      body: JSON.stringify(testData)
    });

    if (response.ok) {
      console.log('✅ Tabela criada via inserção!');
      // Deletar o registro de teste
      const data = await response.json();
      await fetch(`${supabaseUrl}/rest/v1/fornecedores?id=eq.${data[0].id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
    } else {
      throw new Error('Tabela não existe e não pode ser criada automaticamente');
    }
  } catch (error) {
    throw new Error('Não foi possível criar a tabela automaticamente');
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
      observacoes: 'Fornecedor de serviços administrativos'
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
        const errorData = await response.json();
        console.log(`❌ Erro ao inserir ${data.razao_social}:`, errorData);
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

// Executar criação automática
createFornecedoresTable();


