import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

async function checkMainUser() {
  try {
    console.log('🔍 Verificando usuário principal...');
    
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
      console.log(`   Role: ${mainUser.role}`);
      console.log(`   Status: ${mainUser.status}`);
      console.log(`   Senha (hash): ${mainUser.password.substring(0, 20)}...`);
      
      // Testar senhas comuns
      const testPasswords = ['admin123', 'admin', '123456', 'password', 'admin@erppro.com'];
      
      console.log('\n🔑 Testando senhas...');
      for (const password of testPasswords) {
        const isValid = await bcrypt.compare(password, mainUser.password);
        if (isValid) {
          console.log(`✅ Senha encontrada: "${password}"`);
          console.log('\n🎯 Credenciais do usuário principal:');
          console.log(`   Email: ${mainUser.email}`);
          console.log(`   Senha: ${password}`);
          break;
        }
      }
      
    } else {
      console.log('❌ Usuário principal não encontrado');
    }
    
    // Listar todos os usuários
    console.log('\n📋 Todos os usuários no sistema:');
    const allUsers = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, email, role, status FROM users ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    allUsers.forEach(user => {
      console.log(`   ID: ${user.id} | ${user.name} | ${user.email} | Role: ${user.role} | Status: ${user.status}`);
    });
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkMainUser(); 