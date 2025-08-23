import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFornecedoresTable() {
  try {
    console.log('🧪 Testando tabela fornecedores...');

    // Tentar buscar dados da tabela
    const { data: fornecedores, error: selectError } = await supabase
      .from('fornecedores')
      .select('*')
      .limit(1);

    if (selectError) {
      console.error('❌ Erro ao acessar tabela fornecedores:', selectError);
      console.error('💡 A tabela fornecedores não existe ou não está acessível.');
      console.error('🔧 Você precisa criar a tabela manualmente no Supabase.');
      return;
    }

    console.log('✅ Tabela fornecedores existe e está acessível!');
    console.log(`📊 Total de registros: ${fornecedores.length}`);

    if (fornecedores.length > 0) {
      console.log('📋 Primeiro registro:');
      console.log(JSON.stringify(fornecedores[0], null, 2));
    } else {
      console.log('📝 Tabela está vazia. Vamos inserir dados de teste...');
      
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

      const { data: insertedData, error: insertError } = await supabase
        .from('fornecedores')
        .insert([testData])
        .select();

      if (insertError) {
        console.error('❌ Erro ao inserir dados de teste:', insertError);
        return;
      }

      console.log('✅ Dados de teste inseridos com sucesso!');
      console.log('📋 Registro inserido:');
      console.log(JSON.stringify(insertedData[0], null, 2));
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

// Executar teste
testFornecedoresTable();
