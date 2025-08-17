// ============================================================================
// SCRIPT PARA CRIAR FORNECEDORES VIA API REST DO SUPABASE
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createFornecedoresTable() {
  console.log('🚀 Criando tabela fornecedores via API REST...\n');

  try {
    // Primeiro, vamos tentar inserir dados para ver se a tabela já existe
    const testData = {
      razao_social: 'TESTE TEMPORÁRIO',
      nome_fantasia: 'Teste',
      ramo_atividade: 'Teste',
      tipo_contribuinte: 'PJ',
      cpf_cnpj: '00.000.000/0001-00',
      inscricao_estadual: '000000000',
      uf: 'SP',
      cidade: 'São Paulo',
      cep: '00000-000',
      endereco: 'Rua Teste',
      numero: '1',
      bairro: 'Centro',
      pessoa_contato: 'Teste',
      telefone_fixo: '(11) 0000-0000',
      telefone_celular: '(11) 00000-0000',
      email: 'teste@teste.com',
      banco_nome: 'Banco Teste',
      banco_codigo: '000',
      agencia_numero: '0000',
      conta_numero: '00000-0',
      condicao_pagamento: '30 dias',
      observacoes: 'Dado de teste'
    };

    console.log('📋 Testando se a tabela existe...');
    const { data, error } = await supabase
      .from('fornecedores')
      .insert(testData)
      .select();

    if (error) {
      console.log('❌ Tabela não existe ou erro na inserção:', error.message);
      console.log('\n📋 A tabela precisa ser criada manualmente no SQL Editor do Supabase.');
      console.log('1. Acesse: https://supabase.com/dashboard/project/qerubjitetqwfqqydhzv/sql');
      console.log('2. Execute o arquivo: create-fornecedores-complete.sql');
      return;
    }

    console.log('✅ Tabela existe! Removendo dado de teste...');
    
    // Remover o dado de teste
    await supabase
      .from('fornecedores')
      .delete()
      .eq('cpf_cnpj', '00.000.000/0001-00');

    console.log('✅ Dado de teste removido com sucesso!');

  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

// Executar o script
createFornecedoresTable();
