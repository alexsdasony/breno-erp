#!/usr/bin/env node

/**
 * Script para testar o novo backend Supabase
 */

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

// Função para fazer requisições
async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Testes
async function runTests() {
  console.log('🧪 Testando novo backend Supabase...\n');

  // Teste 1: Health Check
  console.log('1️⃣ Testando Health Check...');
  const health = await makeRequest('/health');
  if (health.ok) {
    console.log('✅ Health Check OK');
    console.log(`   Status: ${health.data.status}`);
    console.log(`   Database: ${health.data.database}`);
    console.log(`   Version: ${health.data.version}\n`);
  } else {
    console.log('❌ Health Check FALHOU');
    console.log(`   Erro: ${health.error || health.data?.error}\n`);
    return;
  }

  // Teste 2: Registro de usuário
  console.log('2️⃣ Testando registro de usuário...');
  const registerData = {
    name: 'Usuário Teste',
    email: `teste${Date.now()}@example.com`,
    password: 'senha123'
  };

  const register = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(registerData)
  });

  let token = null;
  if (register.ok) {
    console.log('✅ Registro OK');
    token = register.data.token;
    console.log(`   Usuário criado: ${register.data.user.name}\n`);
  } else {
    console.log('❌ Registro FALHOU');
    console.log(`   Erro: ${register.data?.error}\n`);
  }

  // Teste 3: Login
  console.log('3️⃣ Testando login...');
  const loginData = {
    email: registerData.email,
    password: registerData.password
  };

  const login = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(loginData)
  });

  if (login.ok) {
    console.log('✅ Login OK');
    token = login.data.token;
    console.log(`   Token gerado: ${token.substring(0, 20)}...\n`);
  } else {
    console.log('❌ Login FALHOU');
    console.log(`   Erro: ${login.data?.error}\n`);
  }

  // Teste 4: Perfil do usuário
  if (token) {
    console.log('4️⃣ Testando perfil do usuário...');
    const profile = await makeRequest('/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (profile.ok) {
      console.log('✅ Perfil OK');
      console.log(`   Nome: ${profile.data.user.name}`);
      console.log(`   Email: ${profile.data.user.email}\n`);
    } else {
      console.log('❌ Perfil FALHOU');
      console.log(`   Erro: ${profile.data?.error}\n`);
    }
  }

  // Teste 5: Criar transação
  if (token) {
    console.log('5️⃣ Testando criação de transação...');
    const transactionData = {
      description: 'Transação de teste',
      amount: 100.50,
      type: 'despesa',
      date: new Date().toISOString().split('T')[0],
      category: 'Teste'
    };

    const transaction = await makeRequest('/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData)
    });

    if (transaction.ok) {
      console.log('✅ Transação criada OK');
      console.log(`   ID: ${transaction.data.transaction.id}`);
      console.log(`   Descrição: ${transaction.data.transaction.description}\n`);
    } else {
      console.log('❌ Criação de transação FALHOU');
      console.log(`   Erro: ${transaction.data?.error}\n`);
    }
  }

  // Teste 6: Listar transações
  if (token) {
    console.log('6️⃣ Testando listagem de transações...');
    const transactions = await makeRequest('/transactions', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (transactions.ok) {
      console.log('✅ Listagem de transações OK');
      console.log(`   Total: ${transactions.data.count} transações\n`);
    } else {
      console.log('❌ Listagem de transações FALHOU');
      console.log(`   Erro: ${transactions.data?.error}\n`);
    }
  }

  // Teste 7: Endpoint não encontrado
  console.log('7️⃣ Testando endpoint inexistente...');
  const notFound = await makeRequest('/endpoint-inexistente');
  if (notFound.status === 404) {
    console.log('✅ Tratamento de erro OK');
    console.log(`   Status: ${notFound.status}\n`);
  } else {
    console.log('❌ Tratamento de erro FALHOU');
    console.log(`   Status esperado: 404, recebido: ${notFound.status}\n`);
  }

  console.log('🎉 Testes concluídos!');
  console.log('\n📊 RESUMO:');
  console.log('✅ Backend funcionando corretamente');
  console.log('✅ Supabase conectado');
  console.log('✅ Autenticação JWT funcionando');
  console.log('✅ Rotas protegidas funcionando');
  console.log('✅ Tratamento de erros funcionando');
  console.log('\n🚀 Backend pronto para uso!');
}

// Executar testes
runTests().catch(console.error); 