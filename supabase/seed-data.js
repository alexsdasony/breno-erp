import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Configuração do Supabase - Hardcoded para evitar problemas
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
// Usando service role key para contornar RLS
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Dados de seed atualizados para o schema atual
const seedData = {
  segments: [
    {
      id: uuidv4(),
      name: 'Segmento Principal',
      description: 'Segmento padrão do sistema'
    },
    {
      id: uuidv4(),
      name: 'Segmento Secundário', 
      description: 'Segmento adicional para testes'
    }
  ],
  
  cost_centers: [
    { id: uuidv4(), name: 'Administrativo' },
    { id: uuidv4(), name: 'Vendas' },
    { id: uuidv4(), name: 'Marketing' },
    { id: uuidv4(), name: 'Estoque' },
    { id: uuidv4(), name: 'Operacional' }
  ],

  customers: [
    {
      id: uuidv4(),
      name: 'Carlos Rodrigues',
      cpf: '929.434.791-28',
      email: 'carlos.rodrigues@example.com',
      phone: '(11) 91752-6526',
      address: 'Rua Fictícia, 387',
      city: 'São Paulo',
      state: 'SP',
      total_purchases: 8763,
      last_purchase_date: '2024-12-06'
    },
    {
      id: uuidv4(),
      name: 'Eduardo Lima',
      cpf: '763.658.630-65',
      email: 'eduardo.lima@example.com',
      phone: '(11) 94353-8243',
      address: 'Rua Fictícia, 649',
      city: 'São Paulo',
      state: 'SP',
      total_purchases: 2612.27,
      last_purchase_date: '2025-01-26'
    },
    {
      id: uuidv4(),
      name: 'Yasmin Martins',
      cpf: '770.579.987-94',
      email: 'yasmin.martins@example.com',
      phone: '(11) 92946-3613',
      address: 'Rua Fictícia, 542',
      city: 'São Paulo',
      state: 'SP',
      total_purchases: 8763,
      last_purchase_date: '2024-10-14'
    },
    {
      id: uuidv4(),
      name: 'Bruno Oliveira',
      cpf: '997.109.580-22',
      email: 'bruno.oliveira@example.com',
      phone: '(11) 98547-5648',
      address: 'Rua Fictícia, 573',
      city: 'São Paulo',
      state: 'SP',
      total_purchases: 2609.34,
      last_purchase_date: '2025-05-24'
    },
    {
      id: uuidv4(),
      name: 'Helena Silva',
      cpf: '946.272.687-28',
      email: 'helena.silva@example.com',
      phone: '(11) 95552-1319',
      address: 'Rua Fictícia, 134',
      city: 'São Paulo',
      state: 'SP',
      total_purchases: 13128.03,
      last_purchase_date: '2024-12-03'
    }
  ],

  products: [
    {
      id: uuidv4(),
      name: 'HD Externo 2TB Mk5',
      stock: 75,
      min_stock: 20,
      price: 1286.05,
      category: 'Mobiliário',
      code: 'HD001',
      description: 'HD Externo de 2TB para backup',
      cost_price: 900.00,
      stock_quantity: 75,
      minimum_stock: 20,
      supplier: 'Fornecedor A'
    },
    {
      id: uuidv4(),
      name: 'Impressora Multifuncional Mk5',
      stock: 56,
      min_stock: 10,
      price: 1752.6,
      category: 'Eletrônicos',
      code: 'IMP001',
      description: 'Impressora multifuncional laser',
      cost_price: 1200.00,
      stock_quantity: 56,
      minimum_stock: 10,
      supplier: 'Fornecedor B'
    },
    {
      id: uuidv4(),
      name: 'Monitor 4K Mk1',
      stock: 107,
      min_stock: 6,
      price: 2609.34,
      category: 'Eletrônicos',
      code: 'MON001',
      description: 'Monitor 4K 27 polegadas',
      cost_price: 1800.00,
      stock_quantity: 107,
      minimum_stock: 6,
      supplier: 'Fornecedor C'
    },
    {
      id: uuidv4(),
      name: 'Projetor LED Mk5',
      stock: 97,
      min_stock: 10,
      price: 1644.42,
      category: 'Periféricos',
      code: 'PROJ001',
      description: 'Projetor LED portátil',
      cost_price: 1100.00,
      stock_quantity: 97,
      minimum_stock: 10,
      supplier: 'Fornecedor D'
    },
    {
      id: uuidv4(),
      name: 'Fone Bluetooth Mk3',
      stock: 124,
      min_stock: 13,
      price: 2612.27,
      category: 'Periféricos',
      code: 'FONE001',
      description: 'Fone Bluetooth com cancelamento de ruído',
      cost_price: 1800.00,
      stock_quantity: 124,
      minimum_stock: 13,
      supplier: 'Fornecedor E'
    }
  ],

  sales: [
    {
      id: uuidv4(),
      customer_name: 'Carlos Rodrigues',
      product: 'Fone Bluetooth Mk3',
      quantity: 2,
      total: 5224.54,
      date: '2024-12-17',
      status: 'Cancelada',
      sale_date: '2024-12-17',
      total_amount: 5224.54,
      payment_method: 'credit_card',
      notes: 'Venda cancelada por solicitação do cliente'
    },
    {
      id: uuidv4(),
      customer_name: 'Eduardo Lima',
      product: 'Impressora Multifuncional Mk5',
      quantity: 1,
      total: 1752.6,
      date: '2024-10-28',
      status: 'Concluída',
      sale_date: '2024-10-28',
      total_amount: 1752.6,
      payment_method: 'pix',
      notes: 'Venda realizada com sucesso'
    },
    {
      id: uuidv4(),
      customer_name: 'Yasmin Martins',
      product: 'Mouse Gamer Mk5',
      quantity: 3,
      total: 1491.57,
      date: '2024-08-15',
      status: 'Pendente',
      sale_date: '2024-08-15',
      total_amount: 1491.57,
      payment_method: 'cash',
      notes: 'Aguardando confirmação de pagamento'
    },
    {
      id: uuidv4(),
      customer_name: 'Bruno Oliveira',
      product: 'Projetor LED Mk1',
      quantity: 5,
      total: 11633.75,
      date: '2024-09-10',
      status: 'Concluída',
      sale_date: '2024-09-10',
      total_amount: 11633.75,
      payment_method: 'bank_transfer',
      notes: 'Venda para empresa'
    },
    {
      id: uuidv4(),
      customer_name: 'Helena Silva',
      product: 'Mesa Digitalizadora Mk5',
      quantity: 3,
      total: 166.65,
      date: '2024-08-03',
      status: 'Cancelada',
      sale_date: '2024-08-03',
      total_amount: 166.65,
      payment_method: 'credit_card',
      notes: 'Produto fora de estoque'
    }
  ],

  transactions: [
    {
      id: uuidv4(),
      type: 'despesa',
      description: 'Contas de Consumo',
      amount: 179.87,
      date: '2024-07-07',
      category: 'Administrativo',
      cost_center: 'Operacional'
    },
    {
      id: uuidv4(),
      type: 'receita',
      description: 'Suporte Técnico',
      amount: 2478.75,
      date: '2024-07-12',
      category: 'Serviços'
    },
    {
      id: uuidv4(),
      type: 'receita',
      description: 'Suporte Técnico',
      amount: 926.88,
      date: '2025-01-26',
      category: 'Marketing'
    },
    {
      id: uuidv4(),
      type: 'despesa',
      description: 'Compra de Estoque',
      amount: 3659.77,
      date: '2024-07-30',
      category: 'Marketing',
      cost_center: 'Operacional'
    },
    {
      id: uuidv4(),
      type: 'despesa',
      description: 'Aluguel do Escritório',
      amount: 3535.64,
      date: '2025-04-12',
      category: 'Vendas',
      cost_center: 'Marketing'
    }
  ],

  billings: [
    {
      id: uuidv4(),
      customer_name: 'Carlos Rodrigues',
      amount: 5224.54,
      due_date: '2024-12-17',
      status: 'Pendente'
    },
    {
      id: uuidv4(),
      customer_name: 'Eduardo Lima',
      amount: 1752.6,
      due_date: '2024-10-28',
      status: 'Paga',
      payment_date: '2024-10-28'
    },
    {
      id: uuidv4(),
      customer_name: 'Yasmin Martins',
      amount: 1491.57,
      due_date: '2024-08-15',
      status: 'Pendente'
    },
    {
      id: uuidv4(),
      customer_name: 'Bruno Oliveira',
      amount: 11633.75,
      due_date: '2024-09-10',
      status: 'Paga',
      payment_date: '2024-09-10'
    },
    {
      id: uuidv4(),
      customer_name: 'Helena Silva',
      amount: 166.65,
      due_date: '2024-08-03',
      status: 'Cancelada'
    }
  ],

  accounts_payable: [
    {
      id: uuidv4(),
      supplier: 'Fornecedor A',
      description: 'Compra de HDs Externos',
      amount: 4500.00,
      due_date: '2024-12-15',
      status: 'pending'
    },
    {
      id: uuidv4(),
      supplier: 'Fornecedor B',
      description: 'Compra de Impressoras',
      amount: 3500.00,
      due_date: '2024-12-20',
      status: 'pending'
    },
    {
      id: uuidv4(),
      supplier: 'Fornecedor C',
      description: 'Compra de Monitores',
      amount: 8000.00,
      due_date: '2024-12-10',
      status: 'paid'
    },
    {
      id: uuidv4(),
      supplier: 'Fornecedor D',
      description: 'Compra de Projetores',
      amount: 6000.00,
      due_date: '2024-12-25',
      status: 'pending'
    },
    {
      id: uuidv4(),
      supplier: 'Fornecedor E',
      description: 'Compra de Fones Bluetooth',
      amount: 12000.00,
      due_date: '2024-12-30',
      status: 'pending'
    }
  ],

  nfe_list: [
    {
      id: uuidv4(),
      number: '000001',
      customer_name: 'Eduardo Lima',
      date: '2024-10-28',
      total: 1752.6,
      status: 'Emitida'
    },
    {
      id: uuidv4(),
      number: '000002',
      customer_name: 'Bruno Oliveira',
      date: '2024-09-10',
      total: 11633.75,
      status: 'Emitida'
    },
    {
      id: uuidv4(),
      number: '000003',
      customer_name: 'Carlos Rodrigues',
      date: '2024-12-17',
      total: 5224.54,
      status: 'Cancelada'
    },
    {
      id: uuidv4(),
      number: '000004',
      customer_name: 'Yasmin Martins',
      date: '2024-08-15',
      total: 1491.57,
      status: 'Emitida'
    },
    {
      id: uuidv4(),
      number: '000005',
      customer_name: 'Helena Silva',
      date: '2024-08-03',
      total: 166.65,
      status: 'Cancelada'
    }
  ],

  integrations: [
    {
      id: uuidv4(),
      service_name: 'WhatsApp Business',
      api_key: 'whatsapp_api_key_456',
      enabled: false,
      config: {
        phone_number: '+5511999999999',
        webhook_url: 'https://webhook.whatsapp.com/erp'
      }
    }
  ]
};

// Função para inserir dados
async function insertData(tableName, data) {
  console.log(`📝 Inserindo dados na tabela: ${tableName}`);
  
  try {
    const { data: result, error } = await supabase
      .from(tableName)
      .insert(data)
      .select();

    if (error) {
      console.error(`❌ Erro ao inserir dados em ${tableName}:`, error);
      return false;
    }

    console.log(`✅ ${result.length} registros inseridos em ${tableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao inserir dados em ${tableName}:`, error);
    return false;
  }
}

// Função principal para executar o seed
async function runSeed() {
  console.log('🚀 Iniciando seed do banco de dados...');
  
  try {
    // Inserir dados em ordem de dependência
    const tables = [
      'segments',
      'cost_centers', 
      'customers',
      'products',
      'sales',
      'transactions',
      'billings',
      'accounts_payable',
      'nfe_list',
      'integrations'
    ];

    for (const table of tables) {
      const success = await insertData(table, seedData[table]);
      if (!success) {
        console.error(`❌ Falha ao inserir dados em ${table}`);
        return;
      }
    }

    console.log('🎉 Seed concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  }
}

// Executar o seed se o arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runSeed();
}

export { runSeed, seedData }; 