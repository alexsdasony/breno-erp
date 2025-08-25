// ============================================================================
// SCRIPT PARA MIGRAR DADOS DE FORNECEDORES DO REMOTO PARA O LOCAL
// ============================================================================

import { createClient } from '@supabase/supabase-js';
import pkg from 'pg';
const { Client } = pkg;

// Configuração do Supabase Remoto
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Banco Local
const localDbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'breno_erp',
  user: 'postgres',
  password: 'admin123'
};

async function migrateFornecedores() {
  console.log('🚀 Iniciando migração de fornecedores do remoto para o local...\n');

  const localClient = new Client(localDbConfig);

  try {
    // Conectar ao banco local
    await localClient.connect();
    console.log('✅ Conectado ao banco local');

    // Primeiro, criar a tabela no local se não existir
    console.log('📋 Criando tabela fornecedores no banco local...');
    
    const createTableSQL = `
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
          cep VARCHAR(10),
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
    `;

    await localClient.query(createTableSQL);
    console.log('✅ Tabela fornecedores criada no banco local');

    // Agora buscar dados do remoto
    console.log('📋 Buscando dados do Supabase remoto...');
    
    const { data: fornecedoresRemoto, error } = await supabase
      .from('fornecedores')
      .select('*');

    if (error) {
      console.log('❌ Erro ao buscar dados do remoto:', error.message);
      console.log('📋 Inserindo dados de exemplo no local...');
      
      // Inserir dados de exemplo se não conseguir buscar do remoto
      const dadosExemplo = [
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

      for (const fornecedor of dadosExemplo) {
        await localClient.query(
          `INSERT INTO fornecedores (
            razao_social, nome_fantasia, ramo_atividade, tipo_contribuinte, 
            cpf_cnpj, inscricao_estadual, uf, cidade, cep, endereco, numero, 
            bairro, pessoa_contato, telefone_fixo, telefone_celular, email,
            banco_nome, banco_codigo, agencia_numero, conta_numero, 
            condicao_pagamento, observacoes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
          [
            fornecedor.razao_social, fornecedor.nome_fantasia, fornecedor.ramo_atividade,
            fornecedor.tipo_contribuinte, fornecedor.cpf_cnpj, fornecedor.inscricao_estadual,
            fornecedor.uf, fornecedor.cidade, fornecedor.cep, fornecedor.endereco,
            fornecedor.numero, fornecedor.bairro, fornecedor.pessoa_contato,
            fornecedor.telefone_fixo, fornecedor.telefone_celular, fornecedor.email,
            fornecedor.banco_nome, fornecedor.banco_codigo, fornecedor.agencia_numero,
            fornecedor.conta_numero, fornecedor.condicao_pagamento, fornecedor.observacoes
          ]
        );
      }

      console.log('✅ Dados de exemplo inseridos no banco local');
    } else {
      console.log(`📋 Encontrados ${fornecedoresRemoto.length} fornecedores no remoto`);
      
      // Inserir dados do remoto no local
      for (const fornecedor of fornecedoresRemoto) {
        await localClient.query(
          `INSERT INTO fornecedores (
            razao_social, nome_fantasia, ramo_atividade, tipo_contribuinte, 
            cpf_cnpj, inscricao_estadual, inscricao_municipal, uf, cidade, cep, 
            endereco, numero, complemento, bairro, pessoa_contato, telefone_fixo, 
            telefone_celular, email, site, banco_nome, banco_codigo, agencia_numero,
            agencia_digito, conta_numero, conta_digito, pix_chave, condicao_pagamento,
            status, data_cadastro, observacoes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32)`,
          [
            fornecedor.razao_social, fornecedor.nome_fantasia, fornecedor.ramo_atividade,
            fornecedor.tipo_contribuinte, fornecedor.cpf_cnpj, fornecedor.inscricao_estadual,
            fornecedor.inscricao_municipal, fornecedor.uf, fornecedor.cidade, fornecedor.cep,
            fornecedor.endereco, fornecedor.numero, fornecedor.complemento, fornecedor.bairro,
            fornecedor.pessoa_contato, fornecedor.telefone_fixo, fornecedor.telefone_celular,
            fornecedor.email, fornecedor.site, fornecedor.banco_nome, fornecedor.banco_codigo,
            fornecedor.agencia_numero, fornecedor.agencia_digito, fornecedor.conta_numero,
            fornecedor.conta_digito, fornecedor.pix_chave, fornecedor.condicao_pagamento,
            fornecedor.status, fornecedor.data_cadastro, fornecedor.observacoes,
            fornecedor.created_at, fornecedor.updated_at
          ]
        );
      }

      console.log('✅ Dados migrados do remoto para o local com sucesso!');
    }

    // Verificar se os dados foram inseridos
    const result = await localClient.query('SELECT COUNT(*) as total FROM fornecedores');
    console.log(`📊 Total de fornecedores no banco local: ${result.rows[0].total}`);

  } catch (error) {
    console.log('❌ Erro durante a migração:', error.message);
  } finally {
    await localClient.end();
    console.log('✅ Conexão com banco local fechada');
  }
}

// Executar a migração
migrateFornecedores();
