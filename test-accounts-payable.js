import fetch from 'node-fetch';

async function testAccountsPayable() {
  try {
    // Primeiro, vamos fazer login para obter um token
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@erp.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.error('Erro no login:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;

    console.log('Token obtido:', token.substring(0, 20) + '...');

    // Agora vamos buscar as contas a pagar
    const accountsResponse = await fetch('http://localhost:3001/api/accounts-payable', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!accountsResponse.ok) {
      console.error('Erro ao buscar contas a pagar:', await accountsResponse.text());
      return;
    }

    const accountsData = await accountsResponse.json();
    console.log('Contas a pagar encontradas:', accountsData.accountsPayable.length);
    
    if (accountsData.accountsPayable.length > 0) {
      console.log('Primeira conta:', accountsData.accountsPayable[0]);
    }

  } catch (error) {
    console.error('Erro:', error);
  }
}

testAccountsPayable(); 