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

async function fixRenderDatabase() {
  let client;
  
  try {
    console.log('🚀 Conectando ao banco do Render...');
    
    client = await pool.connect();
    console.log('✅ Conexão estabelecida!');
    
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
    
    // 3. Criar segmento padrão
    console.log('🔧 Criando segmento padrão...');
    await client.query(`
      INSERT INTO segments (name, description)
      VALUES ('Geral', 'Segmento geral do sistema')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Segmento padrão criado');
    
    // 4. Criar usuário admin
    console.log('🔧 Criando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await client.query(`
      INSERT INTO users (name, email, password, role, status)
      VALUES ('Admin ERP Pro', 'admin@erppro.com', $1, 'admin', 'ativo')
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    `, [hashedPassword]);
    
    console.log('✅ Usuário admin criado/atualizado');
    
    // 5. Verificar se tudo foi criado
    console.log('🔍 Verificando tabelas...');
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
    
    // 6. Verificar usuário admin
    console.log('🔍 Verificando usuário admin...');
    const userResult = await client.query(
      'SELECT id, name, email, role, status FROM users WHERE email = $1',
      ['admin@erppro.com']
    );
    
    if (userResult.rows.length > 0) {
      console.log('✅ Usuário admin:', userResult.rows[0]);
    }
    
    console.log('🎉 Banco inicializado com sucesso!');
    console.log('📧 Email: admin@erppro.com');
    console.log('🔑 Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

fixRenderDatabase(); 