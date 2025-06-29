import React from 'react';
import CustomersModule from './src/modules/CustomersModule';

// Componente de teste simples
const TestCustomers = () => {
  const mockData = {
    customers: [
      {
        id: 1,
        name: 'Cliente Teste',
        cpf: '123.456.789-00',
        email: 'teste@exemplo.com',
        phone: '(11) 99999-9999',
        address: 'Rua Teste, 123',
        city: 'São Paulo',
        state: 'SP',
        totalPurchases: 1000
      }
    ],
    segments: []
  };

  const mockMetrics = {
    totalCustomers: 1
  };

  const mockFunctions = {
    addCustomer: (customer) => console.log('Adicionar cliente:', customer),
    toast: (message) => console.log('Toast:', message),
    importData: (data) => console.log('Importar dados:', data)
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#1a1a1a', color: 'white', minHeight: '100vh' }}>
      <h1>Teste do Módulo de Clientes</h1>
      <CustomersModule 
        data={mockData}
        metrics={mockMetrics}
        {...mockFunctions}
      />
    </div>
  );
};

export default TestCustomers; 