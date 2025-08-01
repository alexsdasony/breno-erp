import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

// Configuração do banco remoto
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkAndFixAdminUser() {
  try {
    console.log('🔍 Verificando usuário admin no ambiente remoto...');
    
    // Verificar se o usuário existe
    const result = await pool.query(
      'SELECT id, email, password, role, status FROM users WHERE email = $1',
      ['admin@erppro.com']
    );
    
    if (result.rows.length === 0) {
      console.log('❌ Usuário admin não encontrado. Criando...');
      
      // Criar usuário admin
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(`
        INSERT INTO users (email, password, role, status, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, ['admin@erppro.com', hashedPassword, 'admin', 'active']);
      
      console.log('✅ Usuário admin criado com sucesso!');
    } else {
      const user = result.rows[0];
      console.log('👤 Usuário admin encontrado:', {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status
      });
      
      // Verificar se a senha está correta
      const isValidPassword = await bcrypt.compare('admin123', user.password);
      
      if (!isValidPassword) {
        console.log('🔧 Senha incorreta. Atualizando...');
        const newHashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
          'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2',
          [newHashedPassword, 'admin@erppro.com']
        );
        console.log('✅ Senha atualizada com sucesso!');
      } else {
        console.log('✅ Senha está correta!');
      }
    }
    
    // Verificar se o segmento padrão existe
    const segmentResult = await pool.query(
      'SELECT id, name FROM segments WHERE name = $1',
      ['Segmento Principal']
    );
    
    if (segmentResult.rows.length === 0) {
      console.log('🔧 Criando segmento padrão...');
      await pool.query(`
        INSERT INTO segments (name, description, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
      `, ['Segmento Principal', 'Segmento padrão do sistema']);
      console.log('✅ Segmento padrão criado!');
    } else {
      console.log('✅ Segmento padrão já existe');
    }
    
    console.log('🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await pool.end();
  }
}

checkAndFixAdminUser(); 