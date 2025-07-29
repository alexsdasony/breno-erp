import pkg from 'pg';
const { Pool } = pkg;

async function testPostgreSQLConnection() {
  try {
    console.log('🔍 Testando conexão PostgreSQL direta...');
    
    const connectionString = 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';
    
    console.log('URL:', connectionString);
    
    const pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });
    
    console.log('📡 Tentando conectar...');
    
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida!');
    
    // Testar query simples
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query de teste:', result.rows[0]);
    
    // Verificar tabelas
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas encontradas:');
    tables.rows.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });
    
    // Verificar usuários se a tabela existir
    if (tables.rows.some(t => t.table_name === 'users')) {
      const users = await client.query('SELECT id, name, email, role, status FROM users ORDER BY id LIMIT 5');
      console.log('\n👥 Usuários encontrados:');
      users.rows.forEach(user => {
        console.log(`   ID: ${user.id} | ${user.name} | ${user.email} | Role: ${user.role} | Status: ${user.status}`);
      });
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Teste de conexão concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Código:', error.code);
    console.error('Stack:', error.stack);
  }
}

testPostgreSQLConnection(); 