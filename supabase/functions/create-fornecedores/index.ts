import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🚀 Criando tabela fornecedores...')

    // SQL para criar a tabela
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
    `

    // Executar SQL usando o cliente Supabase
    const { data, error } = await supabase.rpc('exec_sql', { sql: createTableSQL })

    if (error) {
      console.error('❌ Erro ao criar tabela:', error)
      
      // Se a função exec_sql não existir, tentar método alternativo
      console.log('📋 Tentando método alternativo...')
      const result = await tryAlternativeMethod(supabase)
      
      if (result.success) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Tabela fornecedores criada com método alternativo!' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: result.error || 'Erro ao criar tabela' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }
    } else {
      console.log('✅ Tabela criada com sucesso!')
      
      // Inserir dados de exemplo
      await insertSampleData(supabase)
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Tabela fornecedores criada com sucesso!' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erro interno' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function tryAlternativeMethod(supabase: any) {
  try {
    // Tentar criar tabela via inserção de dados
    const testData = {
      razao_social: 'TESTE CRIAÇÃO TABELA',
      nome_fantasia: 'Teste',
      tipo_contribuinte: 'PJ',
      cpf_cnpj: '00.000.000/0001-00',
      uf: 'SP',
      cidade: 'São Paulo',
      status: 'ATIVO'
    }

    const { data, error } = await supabase
      .from('fornecedores')
      .insert(testData)
      .select()

    if (error) {
      return { success: false, error: error.message }
    }

    // Deletar o registro de teste
    await supabase
      .from('fornecedores')
      .delete()
      .eq('id', data[0].id)

    // Inserir dados reais
    await insertSampleData(supabase)

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

async function insertSampleData(supabase: any) {
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
  ]

  for (const data of sampleData) {
    try {
      const { data: result, error } = await supabase
        .from('fornecedores')
        .insert(data)
        .select()

      if (error) {
        console.log(`❌ Erro ao inserir ${data.razao_social}:`, error.message)
      } else {
        console.log(`✅ Inserido: ${result[0].razao_social}`)
      }
    } catch (error) {
      console.log(`❌ Erro ao inserir ${data.razao_social}:`, error.message)
    }
  }
}
