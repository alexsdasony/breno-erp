import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '***' : 'não encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFornecedoresTable() {
  try {
    console.log('🚀 Criando tabela fornecedores...');

    // Primeiro, vamos verificar se a tabela já existe
    const { data: existingTable, error: checkError } = await supabase
      .from('fornecedores')
      .select('id')
      .limit(1);

    if (existingTable !== null) {
      console.log('✅ Tabela fornecedores já existe!');
      
      // Verificar dados
      const { data: fornecedores, error: dataError } = await supabase
        .from('fornecedores')
        .select('razao_social, cpf_cnpj, status')
        .limit(5);

      if (dataError) {
        console.error('❌ Erro ao verificar dados:', dataError);
        return;
      }

      console.log('📊 Dados encontrados:');
      fornecedores.forEach((fornecedor, index) => {
        console.log(`   ${index + 1}. ${fornecedor.razao_social} (${fornecedor.cpf_cnpj}) - ${fornecedor.status}`);
      });

      return;
    }

    // Se não existe, vamos tentar criar a tabela via SQL
    console.log('📝 Criando tabela fornecedores...');

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
        segment_id UUID REFERENCES segments(id),
        data_cadastro DATE DEFAULT CURRENT_DATE,
        observacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Tentar criar via RPC se disponível
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createTableSQL });
    
    if (createError) {
      console.log('⚠️ Não foi possível criar a tabela via RPC. Tentando inserir dados diretamente...');
    } else {
      console.log('✅ Tabela criada com sucesso!');
    }

    // Agora vamos tentar inserir dados de exemplo
    console.log('📝 Inserindo dados de exemplo...');

    const sampleData = [
      {
        razao_social: 'Empresa ABC Ltda',
        nome_fantasia: 'ABC Ltda',
        ramo_atividade: 'Tecnologia',
        tipo_contribuinte: 'PJ',
        cpf_cnpj: '12.345.678/0001-90',
        inscricao_estadual: '123456789',
        inscricao_municipal: '987654321',
        uf: 'SP',
        cidade: 'São Paulo',
        cep: '01234-567',
        endereco: 'Rua das Flores, 123',
        numero: '123',
        complemento: 'Sala 101',
        bairro: 'Centro',
        pessoa_contato: 'João Silva',
        telefone_fixo: '(11) 1234-5678',
        telefone_celular: '(11) 98765-4321',
        email: 'contato@abc.com.br',
        site: 'www.abc.com.br',
        banco_nome: 'Banco do Brasil',
        banco_codigo: '001',
        agencia_numero: '1234',
        agencia_digito: '5',
        conta_numero: '12345-6',
        conta_digito: '7',
        pix_chave: 'abc@abc.com.br',
        condicao_pagamento: '30 dias',
        status: 'ATIVO',
        observacoes: 'Fornecedor de tecnologia'
      },
      {
        razao_social: 'Comércio XYZ S/A',
        nome_fantasia: 'XYZ Comércio',
        ramo_atividade: 'Comércio',
        tipo_contribuinte: 'PJ',
        cpf_cnpj: '98.765.432/0001-10',
        inscricao_estadual: '987654321',
        inscricao_municipal: '123456789',
        uf: 'RJ',
        cidade: 'Rio de Janeiro',
        cep: '20000-000',
        endereco: 'Av. Brasil, 456',
        numero: '456',
        complemento: 'Andar 2',
        bairro: 'Centro',
        pessoa_contato: 'Maria Santos',
        telefone_fixo: '(21) 2345-6789',
        telefone_celular: '(21) 87654-3210',
        email: 'contato@xyz.com.br',
        site: 'www.xyz.com.br',
        banco_nome: 'Itaú',
        banco_codigo: '341',
        agencia_numero: '5678',
        agencia_digito: '9',
        conta_numero: '98765-4',
        conta_digito: '3',
        pix_chave: 'xyz@xyz.com.br',
        condicao_pagamento: '15 dias',
        status: 'ATIVO',
        observacoes: 'Fornecedor de produtos'
      },
      {
        razao_social: 'João da Silva',
        nome_fantasia: 'João Silva',
        ramo_atividade: 'Consultoria',
        tipo_contribuinte: 'PF',
        cpf_cnpj: '123.456.789-00',
        inscricao_estadual: null,
        inscricao_municipal: null,
        uf: 'MG',
        cidade: 'Belo Horizonte',
        cep: '30000-000',
        endereco: 'Rua das Palmeiras, 789',
        numero: '789',
        complemento: 'Apto 303',
        bairro: 'Savassi',
        pessoa_contato: 'João Silva',
        telefone_fixo: '(31) 3456-7890',
        telefone_celular: '(31) 76543-2109',
        email: 'joao.silva@email.com',
        site: null,
        banco_nome: 'Bradesco',
        banco_codigo: '237',
        agencia_numero: '9012',
        agencia_digito: '3',
        conta_numero: '54321-8',
        conta_digito: '9',
        pix_chave: 'joao.silva@email.com',
        condicao_pagamento: 'À vista',
        status: 'ATIVO',
        observacoes: 'Consultor independente'
      }
    ];

    const { data: insertedData, error: insertError } = await supabase
      .from('fornecedores')
      .insert(sampleData)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir dados:', insertError);
      console.error('Detalhes do erro:', JSON.stringify(insertError, null, 2));
      return;
    }

    console.log('✅ Dados de exemplo inseridos com sucesso!');
    console.log('📊 Fornecedores criados:');
    insertedData.forEach((fornecedor, index) => {
      console.log(`   ${index + 1}. ${fornecedor.razao_social} (${fornecedor.cpf_cnpj}) - ${fornecedor.status}`);
    });

    console.log('\n🎉 Tabela fornecedores está pronta para uso!');

  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
  }
}

// Executar criação
createFornecedoresTable();
