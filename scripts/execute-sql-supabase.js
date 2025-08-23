import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

async function executeSQL(sql) {
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
      const data = await response.json();
      return { success: true, data };
    } else {
      const error = await response.text();
      return { success: false, error };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createFornecedoresTable() {
  try {
    console.log('🚀 Criando tabela fornecedores via SQL...');

    // Primeiro, vamos tentar criar a função exec_sql se ela não existir
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION exec_sql(sql text)
      RETURNS json
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE sql;
        RETURN '{"success": true}'::json;
      EXCEPTION
        WHEN OTHERS THEN
          RETURN json_build_object('success', false, 'error', SQLERRM);
      END;
      $$;
    `;

    console.log('📝 Criando função exec_sql...');
    const functionResult = await executeSQL(createFunctionSQL);
    
    if (!functionResult.success) {
      console.log('⚠️ Não foi possível criar a função exec_sql. Tentando criar tabela diretamente...');
    }

    // Agora vamos criar a tabela
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS fornecedores (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
        segment_id UUID,
        data_cadastro DATE DEFAULT CURRENT_DATE,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('📝 Criando tabela fornecedores...');
    const tableResult = await executeSQL(createTableSQL);
    
    if (tableResult.success) {
      console.log('✅ Tabela fornecedores criada com sucesso!');
      
      // Agora vamos inserir dados de exemplo
      console.log('📝 Inserindo dados de exemplo...');
      
      const insertSQL = `
        INSERT INTO fornecedores (
          razao_social, nome_fantasia, ramo_atividade, tipo_contribuinte, cpf_cnpj,
          inscricao_estadual, inscricao_municipal, uf, cidade, cep, endereco, numero,
          complemento, bairro, pessoa_contato, telefone_fixo, telefone_celular, email,
          site, banco_nome, banco_codigo, agencia_numero, agencia_digito, conta_numero,
          conta_digito, pix_chave, condicao_pagamento, status, observacoes
        ) VALUES 
        (
          'Empresa ABC Ltda',
          'ABC Ltda',
          'Tecnologia',
          'PJ',
          '12.345.678/0001-90',
          '123456789',
          '987654321',
          'SP',
          'São Paulo',
          '01234-567',
          'Rua das Flores, 123',
          '123',
          'Sala 101',
          'Centro',
          'João Silva',
          '(11) 1234-5678',
          '(11) 98765-4321',
          'contato@abc.com.br',
          'www.abc.com.br',
          'Banco do Brasil',
          '001',
          '1234',
          '5',
          '12345-6',
          '7',
          'abc@abc.com.br',
          '30 dias',
          'ATIVO',
          'Fornecedor de tecnologia'
        ),
        (
          'Comércio XYZ S/A',
          'XYZ Comércio',
          'Comércio',
          'PJ',
          '98.765.432/0001-10',
          '987654321',
          '123456789',
          'RJ',
          'Rio de Janeiro',
          '20000-000',
          'Av. Brasil, 456',
          '456',
          'Andar 2',
          'Centro',
          'Maria Santos',
          '(21) 2345-6789',
          '(21) 87654-3210',
          'contato@xyz.com.br',
          'www.xyz.com.br',
          'Itaú',
          '341',
          '5678',
          '9',
          '98765-4',
          '3',
          'xyz@xyz.com.br',
          '15 dias',
          'ATIVO',
          'Fornecedor de produtos'
        ),
        (
          'João da Silva',
          'João Silva',
          'Consultoria',
          'PF',
          '123.456.789-00',
          NULL,
          NULL,
          'MG',
          'Belo Horizonte',
          '30000-000',
          'Rua das Palmeiras, 789',
          '789',
          'Apto 303',
          'Savassi',
          'João Silva',
          '(31) 3456-7890',
          '(31) 76543-2109',
          'joao.silva@email.com',
          NULL,
          'Bradesco',
          '237',
          '9012',
          '3',
          '54321-8',
          '9',
          'joao.silva@email.com',
          'À vista',
          'ATIVO',
          'Consultor independente'
        );
      `;

      const insertResult = await executeSQL(insertSQL);
      
      if (insertResult.success) {
        console.log('✅ Dados de exemplo inseridos com sucesso!');
        console.log('\n🎉 Tabela fornecedores está pronta para uso!');
      } else {
        console.log('⚠️ Erro ao inserir dados:', insertResult.error);
      }
      
    } else {
      console.log('❌ Erro ao criar tabela:', tableResult.error);
      console.log('💡 Você precisa criar a tabela manualmente no Supabase.');
    }

  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
  }
}

// Executar criação
createFornecedoresTable();
