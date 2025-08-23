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

async function insertSampleData() {
  try {
    console.log('📝 Inserindo dados de exemplo na tabela fornecedores...');

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
        cep: '01234567',
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
        cep: '20000000',
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
        cep: '30000000',
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

    let successCount = 0;
    let errorCount = 0;

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
        console.log(`✅ Inserido: ${insertedData.razao_social} (${insertedData.cpf_cnpj})`);
        successCount++;
      } else {
        const error = await insertResponse.text();
        console.log(`❌ Erro ao inserir ${data.razao_social}:`, error);
        errorCount++;
      }
    }

    console.log(`\n📊 Resumo:`);
    console.log(`✅ Inseridos com sucesso: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);

    if (successCount > 0) {
      console.log('\n🎉 Dados de exemplo inseridos com sucesso!');
      console.log('📋 A tabela fornecedores está pronta para uso.');
    }

  } catch (error) {
    console.error('❌ Erro durante a inserção:', error);
  }
}

// Executar inserção
insertSampleData();
