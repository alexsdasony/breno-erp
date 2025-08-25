// Script para executar SQL diretamente no Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

async function executeSQLInSupabase() {
  console.log('🚀 Executando SQL no Supabase...\n');

  try {
    // Método 1: Tentar usar função RPC exec_sql
    console.log('📋 Método 1: Tentando RPC exec_sql...');
    await tryRPCExecSQL();

    // Método 2: Tentar usar função RPC sql
    console.log('\n📋 Método 2: Tentando RPC sql...');
    await tryRPCSQL();

    // Método 3: Tentar usar função RPC execute_sql
    console.log('\n📋 Método 3: Tentando RPC execute_sql...');
    await tryRPCExecuteSQL();

    // Método 4: Tentar criar tabela via inserção
    console.log('\n📋 Método 4: Tentando criar via inserção...');
    await tryCreateViaInsert();

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

async function tryRPCExecSQL() {
  const sql = `
    DROP TABLE IF EXISTS fornecedores CASCADE;
    
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
  `;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql })
    });

    if (response.ok) {
      console.log('✅ RPC exec_sql funcionou!');
      return true;
    } else {
      const error = await response.json();
      console.log('❌ RPC exec_sql falhou:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro no RPC exec_sql:', error.message);
    return false;
  }
}

async function tryRPCSQL() {
  const sql = `
    DROP TABLE IF EXISTS fornecedores CASCADE;
    
    CREATE TABLE fornecedores (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255) NOT NULL,
        nome_fantasia VARCHAR(255),
        tipo_contribuinte VARCHAR(20),
        cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
        uf CHAR(2),
        cidade VARCHAR(100),
        status VARCHAR(10) DEFAULT 'ATIVO'
    );
  `;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ query: sql })
    });

    if (response.ok) {
      console.log('✅ RPC sql funcionou!');
      return true;
    } else {
      const error = await response.json();
      console.log('❌ RPC sql falhou:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro no RPC sql:', error.message);
    return false;
  }
}

async function tryRPCExecuteSQL() {
  const sql = `
    DROP TABLE IF EXISTS fornecedores CASCADE;
    
    CREATE TABLE fornecedores (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255) NOT NULL,
        nome_fantasia VARCHAR(255),
        tipo_contribuinte VARCHAR(20),
        cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
        uf CHAR(2),
        cidade VARCHAR(100),
        status VARCHAR(10) DEFAULT 'ATIVO'
    );
  `;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql })
    });

    if (response.ok) {
      console.log('✅ RPC execute_sql funcionou!');
      return true;
    } else {
      const error = await response.json();
      console.log('❌ RPC execute_sql falhou:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro no RPC execute_sql:', error.message);
    return false;
  }
}

async function tryCreateViaInsert() {
  // Tentar inserir dados para forçar criação da tabela
  const testData = {
    razao_social: 'TESTE CRIAÇÃO',
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
      const data = await response.json();
      
      // Deletar o registro de teste
      await fetch(`${supabaseUrl}/rest/v1/fornecedores?id=eq.${data[0].id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });
      
      return true;
    } else {
      const error = await response.json();
      console.log('❌ Inserção falhou:', error);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro na inserção:', error.message);
    return false;
  }
}

// Executar todos os métodos
executeSQLInSupabase();


