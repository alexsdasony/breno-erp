// Script para criar a tabela fornecedores via API do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

const sqlScript = `
-- Dropar tabela se existir
DROP TABLE IF EXISTS fornecedores CASCADE;

-- Criar a tabela fornecedores com estrutura completa
CREATE TABLE fornecedores (
    id SERIAL PRIMARY KEY,
    
    -- Identificação
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255),
    ramo_atividade VARCHAR(150),
    tipo_contribuinte VARCHAR(20) CHECK (tipo_contribuinte IN ('PJ', 'PF', 'MEI', 'Outros')),
    cpf_cnpj VARCHAR(20) UNIQUE NOT NULL,
    inscricao_estadual VARCHAR(30),
    inscricao_municipal VARCHAR(30),
    
    -- Localização
    uf CHAR(2),
    cidade VARCHAR(100),
    cep CHAR(8),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    
    -- Contato
    pessoa_contato VARCHAR(100),
    telefone_fixo VARCHAR(20),
    telefone_celular VARCHAR(20),
    email VARCHAR(150),
    site VARCHAR(150),
    
    -- Financeiro
    banco_nome VARCHAR(100),
    banco_codigo CHAR(3),
    agencia_numero VARCHAR(10),
    agencia_digito CHAR(1),
    conta_numero VARCHAR(20),
    conta_digito CHAR(1),
    pix_chave VARCHAR(150),
    condicao_pagamento VARCHAR(50),
    
    -- Operacional
    status VARCHAR(10) DEFAULT 'ATIVO' CHECK (status IN ('ATIVO', 'INATIVO')),
    data_cadastro DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    
    -- Campos de auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_fornecedores_cpf_cnpj ON fornecedores(cpf_cnpj);
CREATE INDEX idx_fornecedores_razao_social ON fornecedores(razao_social);
CREATE INDEX idx_fornecedores_email ON fornecedores(email);
CREATE INDEX idx_fornecedores_status ON fornecedores(status);
CREATE INDEX idx_fornecedores_uf ON fornecedores(uf);
CREATE INDEX idx_fornecedores_cidade ON fornecedores(cidade);

-- Criar função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_fornecedores_updated_at 
    BEFORE UPDATE ON fornecedores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir fornecedores de exemplo
INSERT INTO fornecedores (
    razao_social, 
    nome_fantasia, 
    ramo_atividade, 
    tipo_contribuinte, 
    cpf_cnpj, 
    inscricao_estadual,
    uf, 
    cidade, 
    cep, 
    endereco, 
    numero, 
    bairro,
    pessoa_contato, 
    telefone_fixo, 
    telefone_celular, 
    email,
    banco_nome,
    banco_codigo,
    agencia_numero,
    conta_numero,
    condicao_pagamento,
    observacoes
) VALUES 
(
    'TECNOLOGIA AVANÇADA LTDA',
    'TecAv',
    'Tecnologia da Informação',
    'PJ',
    '12.345.678/0001-90',
    '123456789',
    'SP',
    'São Paulo',
    '01234-567',
    'Rua das Tecnologias',
    '100',
    'Centro',
    'João Silva',
    '(11) 3333-4444',
    '(11) 99999-8888',
    'contato@tecav.com.br',
    'Banco do Brasil',
    '001',
    '1234',
    '12345-6',
    '30 dias',
    'Fornecedor de sistemas e equipamentos'
),
(
    'MATERIAIS CONSTRUÇÃO LTDA',
    'MatCon',
    'Construção Civil',
    'PJ',
    '98.765.432/0001-10',
    '987654321',
    'RJ',
    'Rio de Janeiro',
    '20000-000',
    'Av. da Construção',
    '500',
    'Copacabana',
    'Maria Santos',
    '(21) 2222-3333',
    '(21) 88888-7777',
    'vendas@matcon.com.br',
    'Itaú',
    '341',
    '5678',
    '98765-4',
    '15 dias',
    'Fornecedor de materiais de construção'
),
(
    'SERVIÇOS ADMINISTRATIVOS LTDA',
    'ServAdm',
    'Serviços Administrativos',
    'PJ',
    '11.222.333/0001-44',
    '112223334',
    'MG',
    'Belo Horizonte',
    '30000-000',
    'Rua dos Serviços',
    '200',
    'Savassi',
    'Pedro Costa',
    '(31) 4444-5555',
    '(31) 77777-6666',
    'admin@servadm.com.br',
    'Bradesco',
    '237',
    '9999',
    '54321-0',
    '45 dias',
    'Fornecedor de serviços administrativos'
);
`;

async function setupFornecedoresTable() {
  console.log('🔧 Configurando tabela fornecedores...\n');

  try {
    // Executar o script SQL via API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({
        sql: sqlScript
      })
    });

    if (!response.ok) {
      console.error('❌ Erro ao executar SQL:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Detalhes:', errorText);
      
      // Se não conseguir executar via RPC, vamos tentar criar a tabela via REST
      console.log('\n🔄 Tentando criar tabela via REST API...');
      await createTableViaRest();
    } else {
      console.log('✅ Tabela fornecedores criada com sucesso!');
      console.log('✅ Índices criados!');
      console.log('✅ Triggers configurados!');
      console.log('✅ Dados de exemplo inseridos!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
    console.log('\n🔄 Tentando criar tabela via REST API...');
    await createTableViaRest();
  }
}

async function createTableViaRest() {
  try {
    // Criar tabela básica primeiro
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS fornecedores (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255) NOT NULL,
        nome_fantasia VARCHAR(255),
        ramo_atividade VARCHAR(150),
        tipo_contribuinte VARCHAR(20),
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
        status VARCHAR(10) DEFAULT 'ATIVO',
        data_cadastro DATE DEFAULT CURRENT_DATE,
        observacoes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
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

    if (response.ok) {
      console.log('✅ Tabela básica criada!');
      
      // Inserir dados de exemplo
      await insertSampleData();
    } else {
      console.log('⚠️ Não foi possível criar a tabela automaticamente.');
      console.log('📋 Execute manualmente o script SQL no Supabase SQL Editor:');
      console.log('Arquivo: create-fornecedores-complete.sql');
    }

  } catch (error) {
    console.error('❌ Erro ao criar tabela via REST:', error);
    console.log('📋 Execute manualmente o script SQL no Supabase SQL Editor:');
    console.log('Arquivo: create-fornecedores-complete.sql');
  }
}

async function insertSampleData() {
  try {
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
      }
    ];

    for (const fornecedor of sampleData) {
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
        console.log(`✅ Fornecedor inserido: ${result[0].razao_social}`);
      } else {
        console.log(`⚠️ Erro ao inserir fornecedor: ${fornecedor.razao_social}`);
      }
    }

    console.log('\n🎉 Setup concluído! Agora você pode testar as funções CRUD.');
    console.log('Execute: node test-fornecedores-crud.js');

  } catch (error) {
    console.error('❌ Erro ao inserir dados de exemplo:', error);
  }
}

// Executar o setup
setupFornecedoresTable();

