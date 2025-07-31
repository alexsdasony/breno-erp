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

async function updateAdminUser() {
  let client;
  
  try {
    console.log('🚀 Conectando ao banco do Render...');
    
    client = await pool.connect();
    console.log('✅ Conexão estabelecida!');
    
    // Verificar se usuário admin existe
    console.log('🔍 Verificando usuário admin...');
    const userResult = await client.query(
      'SELECT id, name, email, role, status FROM users WHERE email = $1',
      ['admin@erppro.com']
    );
    
    if (userResult.rows.length > 0) {
      console.log('✅ Usuário admin encontrado:', userResult.rows[0]);
      
      // Atualizar usuário admin
      console.log('🔧 Atualizando usuário admin...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await client.query(`
        UPDATE users 
        SET password = $1, role = 'admin', status = 'ativo', updated_at = CURRENT_TIMESTAMP
        WHERE email = 'admin@erppro.com'
      `, [hashedPassword]);
      
      console.log('✅ Usuário admin atualizado');
    } else {
      console.log('❌ Usuário admin não encontrado');
      
      // Criar usuário admin
      console.log('🔧 Criando usuário admin...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await client.query(`
        INSERT INTO users (name, email, password, role, status)
        VALUES ('Admin ERP Pro', 'admin@erppro.com', $1, 'admin', 'ativo')
      `, [hashedPassword]);
      
      console.log('✅ Usuário admin criado');
    }
    
    // Verificar usuário admin
    console.log('🔍 Verificando usuário admin...');
    const finalUserResult = await client.query(
      'SELECT id, name, email, role, status FROM users WHERE email = $1',
      ['admin@erppro.com']
    );
    
    if (finalUserResult.rows.length > 0) {
      console.log('✅ Usuário admin:', finalUserResult.rows[0]);
    }
    
    console.log('🎉 Usuário admin configurado com sucesso!');
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

updateAdminUser(); 