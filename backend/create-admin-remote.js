import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// URL do banco remoto (do env.example)
const DATABASE_URL = 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';

console.log('🚀 Conectando ao banco remoto...');

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
});

async function createAdminUser() {
  try {
    console.log('📊 Testando conexão...');
    
    // Testar conexão
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexão OK:', testResult.rows[0]);
    
    // Verificar se usuário admin existe
    console.log('🔍 Verificando se usuário admin existe...');
    const userCheck = await pool.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['admin@erppro.com']
    );
    
    if (userCheck.rows && userCheck.rows.length > 0) {
      console.log('👤 Usuário admin já existe:', userCheck.rows[0]);
      return;
    }
    
    // Criar usuário admin
    console.log('🔧 Criando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await pool.query(`
      INSERT INTO users (name, email, password, role, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, email, role
    `, ['Admin', 'admin@erppro.com', hashedPassword, 'admin', 'active']);
    
    console.log('✅ Usuário admin criado com sucesso:', result.rows[0]);
    
    // Verificar se segmento padrão existe
    console.log('🔍 Verificando segmento padrão...');
    const segmentCheck = await pool.query(
      'SELECT id, name FROM segments WHERE name = $1',
      ['Segmento Padrão']
    );
    
    if (!segmentCheck.rows || segmentCheck.rows.length === 0) {
      console.log('🏢 Criando segmento padrão...');
      const segmentResult = await pool.query(`
        INSERT INTO segments (name, description, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
        RETURNING id, name
      `, ['Segmento Padrão', 'Segmento padrão do sistema']);
      
      console.log('✅ Segmento padrão criado:', segmentResult.rows[0]);
    } else {
      console.log('🏢 Segmento padrão já existe:', segmentCheck.rows[0]);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
    console.log('🔌 Conexão fechada');
  }
}

createAdminUser(); 