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

async function createTableDirect() {
  try {
    console.log('🚀 Criando tabela fornecedores diretamente...');

    // Vamos tentar criar a tabela usando a API de migração do Supabase
    const migrationData = {
      name: 'create_fornecedores_table',
      sql: `
        -- Habilitar extensão uuid-ossp
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- Criar tabela fornecedores
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

        -- Criar índices
        CREATE INDEX IF NOT EXISTS idx_fornecedores_razao_social ON fornecedores(razao_social);
        CREATE INDEX IF NOT EXISTS idx_fornecedores_cpf_cnpj ON fornecedores(cpf_cnpj);
        CREATE INDEX IF NOT EXISTS idx_fornecedores_email ON fornecedores(email);
        CREATE INDEX IF NOT EXISTS idx_fornecedores_status ON fornecedores(status);

        -- Habilitar RLS
        ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;

        -- Criar políticas RLS
        CREATE POLICY "Usuários autenticados podem ver fornecedores" ON fornecedores
          FOR SELECT USING (auth.role() = 'authenticated');

        CREATE POLICY "Usuários autenticados podem inserir fornecedores" ON fornecedores
          FOR INSERT WITH CHECK (auth.role() = 'authenticated');

        CREATE POLICY "Usuários autenticados podem atualizar fornecedores" ON fornecedores
          FOR UPDATE USING (auth.role() = 'authenticated');

        CREATE POLICY "Usuários autenticados podem deletar fornecedores" ON fornecedores
          FOR DELETE USING (auth.role() = 'authenticated');
      `
    };

    // Tentar usar a API de migração
    const migrationResponse = await fetch(`${supabaseUrl}/rest/v1/migrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify(migrationData)
    });

    if (migrationResponse.ok) {
      console.log('✅ Migração criada com sucesso!');
    } else {
      console.log('⚠️ API de migração não disponível. Tentando criar tabela via API REST...');
      
      // Vamos tentar uma abordagem diferente - criar a tabela via API REST
      // Primeiro, vamos verificar se conseguimos acessar a tabela
      const checkResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?select=id&limit=1`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      if (checkResponse.ok) {
        console.log('✅ Tabela fornecedores já existe!');
      } else {
        console.log('❌ Tabela fornecedores não existe.');
        console.log('💡 Vou tentar criar usando a API de schema...');
        
        // Tentar criar via API de schema
        const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/schema`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey
          },
          body: JSON.stringify({
            table: 'fornecedores',
            columns: [
              { name: 'id', type: 'uuid', primary_key: true, default: 'uuid_generate_v4()' },
              { name: 'razao_social', type: 'varchar(255)', not_null: true },
              { name: 'nome_fantasia', type: 'varchar(255)' },
              { name: 'ramo_atividade', type: 'varchar(150)' },
              { name: 'tipo_contribuinte', type: 'varchar(20)' },
              { name: 'cpf_cnpj', type: 'varchar(20)', unique: true, not_null: true },
              { name: 'inscricao_estadual', type: 'varchar(30)' },
              { name: 'inscricao_municipal', type: 'varchar(30)' },
              { name: 'uf', type: 'char(2)' },
              { name: 'cidade', type: 'varchar(100)' },
              { name: 'cep', type: 'char(8)' },
              { name: 'endereco', type: 'varchar(255)' },
              { name: 'numero', type: 'varchar(20)' },
              { name: 'complemento', type: 'varchar(100)' },
              { name: 'bairro', type: 'varchar(100)' },
              { name: 'pessoa_contato', type: 'varchar(100)' },
              { name: 'telefone_fixo', type: 'varchar(20)' },
              { name: 'telefone_celular', type: 'varchar(20)' },
              { name: 'email', type: 'varchar(150)' },
              { name: 'site', type: 'varchar(150)' },
              { name: 'banco_nome', type: 'varchar(100)' },
              { name: 'banco_codigo', type: 'char(3)' },
              { name: 'agencia_numero', type: 'varchar(10)' },
              { name: 'agencia_digito', type: 'char(1)' },
              { name: 'conta_numero', type: 'varchar(20)' },
              { name: 'conta_digito', type: 'char(1)' },
              { name: 'pix_chave', type: 'varchar(150)' },
              { name: 'condicao_pagamento', type: 'varchar(50)' },
              { name: 'status', type: 'varchar(10)', default: 'ATIVO' },
              { name: 'segment_id', type: 'uuid' },
              { name: 'data_cadastro', type: 'date', default: 'CURRENT_DATE' },
              { name: 'observacoes', type: 'text' },
              { name: 'created_at', type: 'timestamp', default: 'NOW()' },
              { name: 'updated_at', type: 'timestamp', default: 'NOW()' }
            ]
          })
        });

        if (schemaResponse.ok) {
          console.log('✅ Tabela criada via API de schema!');
        } else {
          const error = await schemaResponse.text();
          console.log('❌ Erro ao criar via API de schema:', error);
          console.log('💡 A tabela precisa ser criada manualmente no Supabase.');
        }
      }
    }

    // Agora vamos tentar inserir dados de exemplo
    console.log('📝 Tentando inserir dados de exemplo...');
    
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
      }
    ];

    for (const data of sampleData) {
      const insertResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(data)
      });

      if (insertResponse.ok) {
        const insertedData = await insertResponse.json();
        console.log(`✅ Inserido: ${insertedData.razao_social}`);
      } else {
        const error = await insertResponse.text();
        console.log(`⚠️ Erro ao inserir ${data.razao_social}:`, error);
      }
    }

    console.log('\n🎉 Processo concluído!');

  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
  }
}

// Executar criação
createTableDirect();
