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
    console.log('🔍 Analisando usuários no banco...');
    
    // Verificar usuários
    const usersResult = await pool.query('SELECT * FROM users');
    console.log('\n👥 USUÁRIOS NO BANCO:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    usersResult.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`Nome: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password (primeiros 20 chars): ${user.password.substring(0, 20)}...`);
      console.log(`Comprimento total: ${user.password.length} caracteres`);
      console.log(`Role: ${user.role}`);
      console.log(`Parece hash bcrypt: ${user.password.startsWith('$2') ? 'SIM' : 'NÃO - PROBLEMA DETECTADO!'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

testDirect(); 