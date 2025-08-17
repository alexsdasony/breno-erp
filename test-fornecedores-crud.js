// Script para testar as funções CRUD de fornecedores
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

async function testFornecedoresCRUD() {
  console.log('🧪 Iniciando testes CRUD de fornecedores...\n');

  try {
    // 1. Testar LISTAR fornecedores
    console.log('1️⃣ Testando LISTAR fornecedores...');
    const listResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (!listResponse.ok) {
      console.error('❌ Erro ao listar fornecedores:', listResponse.status, listResponse.statusText);
      const errorText = await listResponse.text();
      console.error('Detalhes:', errorText);
      
      // Se a tabela não existe, vamos criá-la
      if (listResponse.status === 404) {
        console.log('📋 Tabela não encontrada. Execute o script SQL primeiro!');
        console.log('Execute: create-fornecedores-complete.sql no Supabase SQL Editor');
        return;
      }
    } else {
      const fornecedores = await listResponse.json();
      console.log(`✅ Listagem OK - ${fornecedores.length} fornecedores encontrados`);
    }

    // 2. Testar CRIAR fornecedor
    console.log('\n2️⃣ Testando CRIAR fornecedor...');
    const novoFornecedor = {
      razao_social: 'TESTE CRUD LTDA',
      nome_fantasia: 'TesteCRUD',
      ramo_atividade: 'Testes e Validações',
      tipo_contribuinte: 'PJ',
      cpf_cnpj: '99.999.999/0001-99',
      inscricao_estadual: '999999999',
      uf: 'SP',
      cidade: 'São Paulo',
      cep: '01234-567',
      endereco: 'Rua dos Testes',
      numero: '123',
      bairro: 'Centro',
      pessoa_contato: 'João Teste',
      telefone_fixo: '(11) 3333-4444',
      telefone_celular: '(11) 99999-8888',
      email: 'teste@crud.com.br',
      banco_nome: 'Banco Teste',
      banco_codigo: '999',
      agencia_numero: '9999',
      conta_numero: '99999-9',
      condicao_pagamento: '30 dias',
      status: 'ATIVO',
      observacoes: 'Fornecedor de teste para validação CRUD'
    };

    const createResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(novoFornecedor)
    });

    if (!createResponse.ok) {
      console.error('❌ Erro ao criar fornecedor:', createResponse.status, createResponse.statusText);
      const errorText = await createResponse.text();
      console.error('Detalhes:', errorText);
    } else {
      const fornecedorCriado = await createResponse.json();
      console.log('✅ Criação OK - Fornecedor criado com ID:', fornecedorCriado[0].id);
      
      const fornecedorId = fornecedorCriado[0].id;

      // 3. Testar BUSCAR fornecedor específico
      console.log('\n3️⃣ Testando BUSCAR fornecedor específico...');
      const getResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?id=eq.${fornecedorId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      if (!getResponse.ok) {
        console.error('❌ Erro ao buscar fornecedor:', getResponse.status, getResponse.statusText);
      } else {
        const fornecedor = await getResponse.json();
        console.log('✅ Busca OK - Fornecedor encontrado:', fornecedor[0].razao_social);
      }

      // 4. Testar ATUALIZAR fornecedor
      console.log('\n4️⃣ Testando ATUALIZAR fornecedor...');
      const dadosAtualizados = {
        nome_fantasia: 'TesteCRUD Atualizado',
        observacoes: 'Fornecedor atualizado com sucesso!'
      };

      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?id=eq.${fornecedorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(dadosAtualizados)
      });

      if (!updateResponse.ok) {
        console.error('❌ Erro ao atualizar fornecedor:', updateResponse.status, updateResponse.statusText);
        const errorText = await updateResponse.text();
        console.error('Detalhes:', errorText);
      } else {
        const fornecedorAtualizado = await updateResponse.json();
        console.log('✅ Atualização OK - Nome fantasia atualizado para:', fornecedorAtualizado[0].nome_fantasia);
      }

      // 5. Testar EXCLUIR fornecedor
      console.log('\n5️⃣ Testando EXCLUIR fornecedor...');
      const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?id=eq.${fornecedorId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey
        }
      });

      if (!deleteResponse.ok) {
        console.error('❌ Erro ao excluir fornecedor:', deleteResponse.status, deleteResponse.statusText);
        const errorText = await deleteResponse.text();
        console.error('Detalhes:', errorText);
      } else {
        console.log('✅ Exclusão OK - Fornecedor removido com sucesso');
      }
    }

    // 6. Testar FILTROS
    console.log('\n6️⃣ Testando FILTROS...');
    const filterResponse = await fetch(`${supabaseUrl}/rest/v1/fornecedores?status=eq.ATIVO&select=id,razao_social,status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });

    if (!filterResponse.ok) {
      console.error('❌ Erro ao filtrar fornecedores:', filterResponse.status, filterResponse.statusText);
    } else {
      const fornecedoresFiltrados = await filterResponse.json();
      console.log(`✅ Filtros OK - ${fornecedoresFiltrados.length} fornecedores ativos encontrados`);
    }

    console.log('\n🎉 Todos os testes CRUD foram executados!');

  } catch (error) {
    console.error('❌ Erro geral nos testes:', error);
  }
}

// Executar os testes
testFornecedoresCRUD();

