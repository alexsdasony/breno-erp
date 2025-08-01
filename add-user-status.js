import { getDatabase } from './supabase/backend/database/prodConfig.js';

async function addUserStatusField() {
  const db = await getDatabase();
  
  try {
    console.log('🔄 Adicionando campo status na tabela users...');
    
    // Adicionar campo status se não existir
    await db.run(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ativo'
    `);
    
    // Adicionar campo segment_id se não existir
    await db.run(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS segment_id INTEGER REFERENCES segments(id)
    `);
    
    // Atualizar usuários existentes para ter status 'ativo'
    await db.run(`
      UPDATE users 
      SET status = 'ativo' 
      WHERE status IS NULL OR status = ''
    `);
    
    // Atualizar admin para ter status 'ativo'
    await db.run(`
      UPDATE users 
      SET status = 'ativo', role = 'admin' 
      WHERE email = 'admin@erppro.com'
    `);
    
    console.log('✅ Campo status adicionado com sucesso!');
    console.log('📊 Status dos usuários:');
    
    // Verificar usuários
    const users = await db.all('SELECT id, name, email, role, status FROM users');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}): ${user.role} - ${user.status}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao adicionar campo status:', error);
  } finally {
    await db.close();
  }
}

addUserStatusField(); 