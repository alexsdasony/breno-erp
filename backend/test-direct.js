import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp',
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDirect() {
  try {
    console.log('🧪 Testando PostgreSQL direto...');
    
    // Teste básico
    const result = await pool.query('SELECT 1 as test');
    console.log('✅ Conexão OK:', result.rows[0]);
    
    // Teste INSERT direto
    const insertResult = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id',
      ['Teste Direto', 'teste@direto.com', 'senha123', 'user']
    );
    console.log('✅ Insert OK:', insertResult.rows[0]);
    
    // Teste SELECT direto
    const selectResult = await pool.query('SELECT * FROM users WHERE email = $1', ['teste@direto.com']);
    console.log('✅ Select OK:', selectResult.rows[0]);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testDirect(); 