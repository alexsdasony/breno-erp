import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;

// Configuração do banco remoto
const pool = new Pool({
  connectionString: 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp',
  ssl: {
    rejectUnauthorized: false
  }
});

async function fixRemoteDatabase() {
  let client;
  
  try {
    console.log('🚀 Inicializando banco de dados remoto...');
    
    client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // 1. Criar tabela segments
    console.log('🔧 Criando tabela segments...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS segments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela segments criada');
    
    // 2. Criar tabela users
    console.log('🔧 Criando tabela users...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        segment_id INTEGER REFERENCES segments(id),
        status VARCHAR(50) DEFAULT 'ativo' CHECK(status IN ('ativo', 'inativo', 'bloqueado')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela users criada');
    
    // 3. Criar tabela cost_centers
    console.log('🔧 Criando tabela cost_centers...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS cost_centers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        segment_id INTEGER REFERENCES segments(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela cost_centers criada');
    
    // 4. Criar tabela customers
    console.log('🔧 Criando tabela customers...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        cpf VARCHAR(20),
        email VARCHAR(255),
        phone VARCHAR(20),
        address TEXT,
        city VARCHAR(100),
        state VARCHAR(50),
        total_purchases DECIMAL(10,2) DEFAULT 0,
        last_purchase_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela customers criada');
    
    // 5. Criar tabela products
    console.log('🔧 Criando tabela products...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        stock INTEGER DEFAULT 0,
        min_stock INTEGER DEFAULT 0,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        segment_id INTEGER REFERENCES segments(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela products criada');
    
    // 6. Criar tabela transactions
    console.log('🔧 Criando tabela transactions...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50) NOT NULL CHECK(type IN ('receita', 'despesa')),
        amount DECIMAL(10,2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        segment_id INTEGER REFERENCES segments(id),
        cost_center_id INTEGER REFERENCES cost_centers(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela transactions criada');
    
    // 7. Criar segmento padrão
    console.log('🔧 Criando segmento padrão...');
    const segmentResult = await client.query(`
      INSERT INTO segments (name, description)
      VALUES ('Geral', 'Segmento geral do sistema')
      ON CONFLICT DO NOTHING
      RETURNING id, name
    `);
    console.log('✅ Segmento padrão criado:', segmentResult.rows[0]);
    
    // 8. Criar usuário admin
    console.log('🔧 Criando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminResult = await client.query(`
      INSERT INTO users (name, email, password, role, status)
      VALUES ('Admin ERP Pro', 'admin@erppro.com', $1, 'admin', 'ativo')
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, role, status
    `, [hashedPassword]);
    
    console.log('✅ Usuário admin criado/atualizado:', adminResult.rows[0]);
    
    // 9. Verificar se tudo foi criado
    console.log('🔍 Verificando tabelas criadas...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas criadas:');
    tablesResult.rows.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });
    
    // 10. Verificar usuário admin
    console.log('🔍 Verificando usuário admin...');
    const userCheck = await client.query(
      'SELECT id, email, role, status FROM users WHERE email = $1',
      ['admin@erppro.com']
    );
    
    if (userCheck.rows.length > 0) {
      console.log('✅ Usuário admin verificado:', userCheck.rows[0]);
      
      // Testar senha
      const passwordCheck = await client.query(
        'SELECT password FROM users WHERE email = $1',
        ['admin@erppro.com']
      );
      
      const isValidPassword = await bcrypt.compare('admin123', passwordCheck.rows[0].password);
      console.log('🔐 Senha válida:', isValidPassword);
    }
    
    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('📧 Email: admin@erppro.com');
    console.log('🔑 Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error.message);
    console.error('Detalhes:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

fixRemoteDatabase(); 