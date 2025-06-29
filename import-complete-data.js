import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do banco PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp',
  ssl: {
    rejectUnauthorized: false
  }
});

async function dropAndCreateTables() {
  console.log('🗑️ Removendo tabelas existentes...');
  
  const dropQueries = [
    'DROP TABLE IF EXISTS integrations CASCADE',
    'DROP TABLE IF EXISTS users CASCADE',
    'DROP TABLE IF EXISTS nfe CASCADE',
    'DROP TABLE IF EXISTS nfe_list CASCADE',
    'DROP TABLE IF EXISTS accounts_payable CASCADE',
    'DROP TABLE IF EXISTS billings CASCADE',
    'DROP TABLE IF EXISTS transactions CASCADE',
    'DROP TABLE IF EXISTS sales CASCADE',
    'DROP TABLE IF EXISTS products CASCADE',
    'DROP TABLE IF EXISTS customers CASCADE',
    'DROP TABLE IF EXISTS segments CASCADE',
    'DROP TABLE IF EXISTS cost_centers CASCADE'
  ];

  for (const query of dropQueries) {
    try {
      await pool.query(query);
    } catch (error) {
      // Ignorar erros de tabela não existente
    }
  }

  console.log('🏗️ Criando estrutura das tabelas...');
  
  // Criar tabelas na ordem correta (respeitando dependências)
  await pool.query(`
    CREATE TABLE segments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE cost_centers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE customers (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      cpf VARCHAR(20),
      email VARCHAR(255),
      phone VARCHAR(20),
      address TEXT,
      city VARCHAR(100),
      state VARCHAR(2),
      total_purchases DECIMAL(12,2) DEFAULT 0,
      last_purchase_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 0,
      price DECIMAL(12,2) NOT NULL,
      category VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE sales (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      customer_name VARCHAR(255),
      product VARCHAR(255),
      quantity INTEGER NOT NULL,
      total DECIMAL(12,2) NOT NULL,
      date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Pendente',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  await pool.query(`
    CREATE TABLE transactions (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL,
      description TEXT,
      amount DECIMAL(12,2) NOT NULL,
      date DATE NOT NULL,
      category VARCHAR(100),
      cost_center VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE billings (
      id SERIAL PRIMARY KEY,
      customer_id INTEGER,
      customer_name VARCHAR(255),
      amount DECIMAL(12,2) NOT NULL,
      due_date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'Pendente',
      payment_date DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  await pool.query(`
    CREATE TABLE accounts_payable (
      id SERIAL PRIMARY KEY,
      supplier VARCHAR(255) NOT NULL,
      description TEXT,
      amount DECIMAL(12,2) NOT NULL,
      due_date DATE NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE nfe_list (
      id SERIAL PRIMARY KEY,
      number VARCHAR(20) NOT NULL UNIQUE,
      customer_name VARCHAR(255),
      date DATE NOT NULL,
      total DECIMAL(12,2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Emitida',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE integrations (
      id SERIAL PRIMARY KEY,
      service_name VARCHAR(100) NOT NULL,
      api_key TEXT,
      enabled BOOLEAN DEFAULT FALSE,
      config JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tabelas criadas com sucesso!');
}

async function insertData(data) {
  console.log('🔄 Inserindo dados...');

  // Inserir Centros de Custo
  if (data.costCenters && data.costCenters.length > 0) {
    console.log(`📁 Inserindo ${data.costCenters.length} centros de custo...`);
    for (const center of data.costCenters) {
      await pool.query(
        'INSERT INTO cost_centers (id, name) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING',
        [center.id, center.name]
      );
    }
  }

  // Inserir Segmentos
  if (data.segments && data.segments.length > 0) {
    console.log(`🏢 Inserindo ${data.segments.length} segmentos...`);
    for (const segment of data.segments) {
      await pool.query(
        'INSERT INTO segments (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING',
        [segment.id, segment.name, segment.description]
      );
    }
  }

  // Inserir Usuários
  if (data.users && data.users.length > 0) {
    console.log(`👥 Inserindo ${data.users.length} usuários...`);
    for (const user of data.users) {
      await pool.query(
        'INSERT INTO users (id, name, email, password, role) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (email) DO NOTHING',
        [user.id, user.name, user.email, user.password, user.role]
      );
    }
  }

  // Inserir Clientes
  if (data.customers && data.customers.length > 0) {
    console.log(`👤 Inserindo ${data.customers.length} clientes...`);
    let count = 0;
    for (const customer of data.customers) {
      await pool.query(
        'INSERT INTO customers (id, name, cpf, email, phone, address, city, state, total_purchases, last_purchase_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO NOTHING',
        [
          customer.id, 
          customer.name, 
          customer.cpf, 
          customer.email, 
          customer.phone, 
          customer.address, 
          customer.city, 
          customer.state, 
          customer.totalPurchases, 
          customer.lastPurchaseDate
        ]
      );
      count++;
      if (count % 50 === 0) {
        console.log(`   Inseridos ${count}/${data.customers.length} clientes...`);
      }
    }
  }

  // Inserir Produtos
  if (data.products && data.products.length > 0) {
    console.log(`📦 Inserindo ${data.products.length} produtos...`);
    for (const product of data.products) {
      await pool.query(
        'INSERT INTO products (id, name, stock, min_stock, price, category) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [product.id, product.name, product.stock, product.minStock, product.price, product.category]
      );
    }
  }

  // Inserir Vendas
  if (data.sales && data.sales.length > 0) {
    console.log(`💰 Inserindo ${data.sales.length} vendas...`);
    let count = 0;
    for (const sale of data.sales) {
      await pool.query(
        'INSERT INTO sales (id, customer_id, customer_name, product, quantity, total, date, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING',
        [sale.id, sale.customerId, sale.customerName, sale.product, sale.quantity, sale.total, sale.date, sale.status]
      );
      count++;
      if (count % 100 === 0) {
        console.log(`   Inseridas ${count}/${data.sales.length} vendas...`);
      }
    }
  }

  // Inserir Transações
  if (data.transactions && data.transactions.length > 0) {
    console.log(`🏦 Inserindo ${data.transactions.length} transações...`);
    let count = 0;
    for (const transaction of data.transactions) {
      await pool.query(
        'INSERT INTO transactions (id, type, description, amount, date, category, cost_center) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [transaction.id, transaction.type, transaction.description, transaction.amount, transaction.date, transaction.category, transaction.costCenter]
      );
      count++;
      if (count % 100 === 0) {
        console.log(`   Inseridas ${count}/${data.transactions.length} transações...`);
      }
    }
  }

  // Inserir Cobranças
  if (data.billings && data.billings.length > 0) {
    console.log(`🧾 Inserindo ${data.billings.length} cobranças...`);
    let count = 0;
    for (const billing of data.billings) {
      await pool.query(
        'INSERT INTO billings (id, customer_id, customer_name, amount, due_date, status, payment_date) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING',
        [billing.id, billing.customerId, billing.customerName, billing.amount, billing.dueDate, billing.status, billing.paymentDate]
      );
      count++;
      if (count % 100 === 0) {
        console.log(`   Inseridas ${count}/${data.billings.length} cobranças...`);
      }
    }
  }

  // Inserir Contas a Pagar
  if (data.accountsPayable && data.accountsPayable.length > 0) {
    console.log(`💳 Inserindo ${data.accountsPayable.length} contas a pagar...`);
    let count = 0;
    for (const account of data.accountsPayable) {
      await pool.query(
        'INSERT INTO accounts_payable (id, supplier, description, amount, due_date, status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
        [account.id, account.supplier, account.description, account.amount, account.dueDate, account.status]
      );
      count++;
      if (count % 100 === 0) {
        console.log(`   Inseridas ${count}/${data.accountsPayable.length} contas a pagar...`);
      }
    }
  }

  // Inserir NFe
  if (data.nfeList && data.nfeList.length > 0) {
    console.log(`📄 Inserindo ${data.nfeList.length} notas fiscais...`);
    let count = 0;
    for (const nfe of data.nfeList) {
      await pool.query(
        'INSERT INTO nfe_list (id, number, customer_name, date, total, status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (number) DO NOTHING',
        [nfe.id, nfe.number, nfe.customerName, nfe.date, nfe.total, nfe.status]
      );
      count++;
      if (count % 100 === 0) {
        console.log(`   Inseridas ${count}/${data.nfeList.length} notas fiscais...`);
      }
    }
  }

  // Inserir Integrações
  if (data.integrations) {
    console.log(`🔗 Inserindo integrações...`);
    for (const [service, config] of Object.entries(data.integrations)) {
      await pool.query(
        'INSERT INTO integrations (service_name, api_key, enabled, config) VALUES ($1, $2, $3, $4) ON CONFLICT (service_name) DO NOTHING',
        [service, config.apiKey || '', config.enabled || false, JSON.stringify(config)]
      );
    }
  }

  console.log('✅ Todos os dados inseridos com sucesso!');
}

async function createIndexes() {
  console.log('🔍 Criando índices para performance...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)',
    'CREATE INDEX IF NOT EXISTS idx_customers_cpf ON customers(cpf)',
    'CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date)',
    'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
    'CREATE INDEX IF NOT EXISTS idx_billings_customer_id ON billings(customer_id)',
    'CREATE INDEX IF NOT EXISTS idx_billings_due_date ON billings(due_date)',
    'CREATE INDEX IF NOT EXISTS idx_billings_status ON billings(status)',
    'CREATE INDEX IF NOT EXISTS idx_accounts_payable_due_date ON accounts_payable(due_date)',
    'CREATE INDEX IF NOT EXISTS idx_accounts_payable_status ON accounts_payable(status)',
    'CREATE INDEX IF NOT EXISTS idx_nfe_list_date ON nfe_list(date)',
    'CREATE INDEX IF NOT EXISTS idx_nfe_list_status ON nfe_list(status)'
  ];

  for (const indexQuery of indexes) {
    await pool.query(indexQuery);
  }

  console.log('✅ Índices criados com sucesso!');
}

async function verifyData() {
  console.log('🔍 Verificando dados inseridos...');
  
  const tables = [
    'customers', 'products', 'sales', 'transactions', 
    'billings', 'accounts_payable', 'nfe_list', 
    'segments', 'cost_centers', 'users', 'integrations'
  ];

  for (const table of tables) {
    const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
    console.log(`📊 ${table}: ${result.rows[0].count} registros`);
  }
}

async function main() {
  try {
    console.log('🚀 Iniciando importação completa dos dados...');
    console.log('🔗 Conectando ao PostgreSQL...');
    
    // Testar conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida!');

    // Ler dados do seed-data.json
    const seedDataPath = path.join(__dirname, 'seed-data.json');
    const rawData = fs.readFileSync(seedDataPath, 'utf8');
    const data = JSON.parse(rawData);
    
    console.log('📋 Dados carregados do seed-data.json');

    // Executar importação
    await dropAndCreateTables();
    await insertData(data);
    await createIndexes();
    await verifyData();

    console.log('🎉 Importação concluída com sucesso!');
    console.log('🌐 Acesse: http://localhost:3002 para visualizar os dados');

  } catch (error) {
    console.error('❌ Erro durante a importação:', error);
    console.error(error.stack);
  } finally {
    await pool.end();
    console.log('🔚 Conexão fechada.');
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;