import { getDatabase } from './database/prodConfig.js';

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testando conexão com o banco PostgreSQL remoto...');
    console.log('URL:', process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp');
    
    const db = await getDatabase();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar query simples
    const result = await db.get('SELECT 1 as test');
    console.log('✅ Query de teste executada:', result);
    
    // Verificar se a tabela users existe
    const usersTable = await db.get(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'users'
    `);
    
    if (usersTable) {
      console.log('✅ Tabela users existe');
      
      // Contar usuários
      const userCount = await db.get('SELECT COUNT(*) as count FROM users');
      console.log(`📊 Total de usuários: ${userCount.count}`);
      
      // Listar usuários
      const users = await db.all('SELECT id, name, email, role, status FROM users LIMIT 5');
      console.log('👥 Usuários encontrados:');
      users.forEach(user => {
        console.log(`   ID: ${user.id} | ${user.name} | ${user.email} | Role: ${user.role} | Status: ${user.status}`);
      });
      
    } else {
      console.log('❌ Tabela users não existe');
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDatabaseConnection(); 