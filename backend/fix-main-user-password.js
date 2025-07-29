import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

async function fixMainUserPassword() {
  try {
    console.log('🔧 Corrigindo senha do usuário principal...');
    
    const db = new sqlite3.Database('./database.sqlite');
    
    // Buscar usuário principal
    const mainUser = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', ['admin@erppro.com'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (mainUser) {
      console.log('✅ Usuário principal encontrado:');
      console.log(`   ID: ${mainUser.id}`);
      console.log(`   Nome: ${mainUser.name}`);
      console.log(`   Email: ${mainUser.email}`);
      console.log(`   Senha atual: ${mainUser.password}`);
      
      // Criar hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      console.log('🔐 Criando hash da senha...');
      
      // Atualizar senha com hash
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE users 
          SET password = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [hashedPassword, mainUser.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log('✅ Senha atualizada com hash!');
      console.log('\n🎯 Credenciais do usuário principal:');
      console.log(`   Email: ${mainUser.email}`);
      console.log(`   Senha: admin123`);
      
    } else {
      console.log('❌ Usuário principal não encontrado');
    }
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

fixMainUserPassword(); 