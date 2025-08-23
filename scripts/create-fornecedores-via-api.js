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

async function createFornecedoresTable() {
  try {
    console.log('🚀 Criando tabela fornecedores via API...');

    // Primeiro, vamos tentar inserir dados para ver se a tabela existe
    const testData = {
      razao_social: 'Empresa Teste Ltda',
      nome_fantasia: 'Teste Ltda',
      ramo_atividade: 'Teste',
      tipo_contribuinte: 'PJ',
      cpf_cnpj: '11.111.111/0001-11',
      inscricao_estadual: '111111111',
      inscricao_municipal: '111111111',
      uf: 'SP',
      cidade: 'São Paulo',
      cep: '00000-000',
      endereco: 'Rua Teste, 123',
      numero: '123',
      complemento: 'Sala 1',
      bairro: 'Centro',
      pessoa_contato: 'Teste',
      telefone_fixo: '(11) 1111-1111',
      telefone_celular: '(11) 11111-1111',
      email: 'teste@teste.com',
      site: 'www.teste.com',
      banco_nome: 'Banco Teste',
      banco_codigo: '000',
      agencia_numero: '0000',
      agencia_digito: '0',
      conta_numero: '00000-0',
      conta_digito: '0',
      pix_chave: 'teste@teste.com',
      condicao_pagamento: 'À vista',
      status: 'ATIVO',
      observacoes: 'Dados de teste'
    };

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
      const data = await response.json();
      console.log('✅ Tabela fornecedores existe e dados inseridos com sucesso!');
      console.log('📋 Registro inserido:', data);
      
      // Agora vamos inserir mais dados de exemplo
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

      console.log('\n🎉 Tabela fornecedores está pronta para uso!');

    } else {
      const error = await response.text();
      console.error('❌ Erro ao acessar tabela fornecedores:', error);
      console.error('💡 A tabela fornecedores não existe.');
      console.error('🔧 Você precisa criar a tabela manualmente no Supabase usando o SQL Editor.');
      console.error('📄 Use o arquivo: create-fornecedores-table.sql');
    }

  } catch (error) {
    console.error('❌ Erro durante a criação:', error);
  }
}

// Executar criação
createFornecedoresTable();
