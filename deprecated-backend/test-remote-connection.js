import { Pool } from 'pg';

// URL do banco remoto
const DATABASE_URL = 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';

console.log('🔍 Testando conectividade com banco remoto...');
console.log('📡 URL:', DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));

// Configuração do banco remoto
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 1
});

async function testConnection() {
  try {
    console.log('🔄 Tentando conectar...');
    
    const client = await pool.connect();
    console.log('✅ Conectado com sucesso!');
    
    // Testar query simples
    const result = await client.query('SELECT NOW() as current_time');
    console.log('⏰ Hora atual no banco:', result.rows[0].current_time);
    
    // Verificar tabelas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    client.release();
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro de conexão:', error.message);
    console.error('🔍 Detalhes:', error);
  } finally {
    await pool.end();
  }
}

testConnection(); 