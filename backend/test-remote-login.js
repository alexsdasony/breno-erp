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

async function testRemoteLogin() {
  try {
    console.log('🔍 Testando conexão com banco remoto...');
    
    // Testar conexão
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se a tabela users existe
    const tableCheck = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    
    if (tableCheck.rows.length === 0) {
      console.log('❌ Tabela users não existe!');
      return;
    }
    
    console.log('✅ Tabela users existe');
    
    // Verificar estrutura da tabela
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estrutura da tabela users:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type}`);
    });
    
    // Verificar se o usuário admin existe
    const adminCheck = await client.query(`
      SELECT id, email, password, status, segment_id 
      FROM users 
      WHERE email = 'admin@erppro.com'
    `);
    
    if (adminCheck.rows.length === 0) {
      console.log('❌ Usuário admin@erppro.com não existe!');
      
      // Criar o usuário admin
      console.log('🔧 Criando usuário admin...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const createAdmin = await client.query(`
        INSERT INTO users (email, password, name, role, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        RETURNING id, email, name, role, status
      `, ['admin@erppro.com', hashedPassword, 'Admin ERP Pro', 'admin', 'active']);
      
      console.log('✅ Usuário admin criado:', createAdmin.rows[0]);
    } else {
      console.log('✅ Usuário admin existe:', adminCheck.rows[0]);
      
      // Testar se a senha está correta
      const admin = adminCheck.rows[0];
      const passwordMatch = await bcrypt.compare('admin123', admin.password);
      
      if (passwordMatch) {
        console.log('✅ Senha do admin está correta');
      } else {
        console.log('❌ Senha do admin está incorreta, atualizando...');
        
        const hashedPassword = await bcrypt.hash('admin123', 12);
        await client.query(`
          UPDATE users 
          SET password = $1, updated_at = NOW()
          WHERE email = 'admin@erppro.com'
        `, [hashedPassword]);
        
        console.log('✅ Senha do admin atualizada');
      }
    }
    
    // Verificar se existem segmentos
    const segments = await client.query('SELECT * FROM segments');
    console.log(`📊 Segmentos encontrados: ${segments.rows.length}`);
    
    if (segments.rows.length === 0) {
      console.log('🔧 Criando segmentos padrão...');
      await client.query(`
        INSERT INTO segments (name, description, created_at, updated_at)
        VALUES 
        ('Geral', 'Segmento geral do sistema', NOW(), NOW()),
        ('Vendas', 'Segmento de vendas', NOW(), NOW()),
        ('Despesas', 'Segmento de despesas', NOW(), NOW())
      `);
      console.log('✅ Segmentos padrão criados');
    }
    
    client.release();
    console.log('🎉 Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao testar banco remoto:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await pool.end();
  }
}

testRemoteLogin(); 