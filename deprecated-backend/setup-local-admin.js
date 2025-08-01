import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

async function setupLocalAdmin() {
  try {
    console.log('🔧 Configurando usuário admin no banco local...');
    
    // Conectar ao banco SQLite local
    const db = new sqlite3.Database('./database.sqlite');
    
    // Criar tabela users se não existir
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
          segment_id INTEGER,
          status TEXT DEFAULT 'ativo' CHECK(status IN ('ativo', 'inativo', 'bloqueado')),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    // Criar tabela segments se não existir
    await new Promise((resolve, reject) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS segments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    
    console.log('✅ Tabelas criadas/verificadas');
    
    // Verificar se usuário admin já existe
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', ['admin@erp.com'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (existingAdmin) {
      console.log('✅ Usuário admin já existe:');
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Nome: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.status}`);
      
      // Atualizar para garantir que está correto
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE users 
          SET status = 'ativo', role = 'admin', updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [existingAdmin.id], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log('✅ Usuário admin atualizado!');
      
    } else {
      console.log('📝 Criando usuário admin...');
      
      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      // Criar usuário admin
      await new Promise((resolve, reject) => {
        db.run(`
          INSERT INTO users (name, email, password, role, status, segment_id) 
          VALUES (?, ?, ?, ?, ?, ?)
        `, ['Admin ERP Pro', 'admin@erp.com', hashedPassword, 'admin', 'ativo', null], function(err) {
          if (err) reject(err);
          else {
            console.log('✅ Usuário admin criado com sucesso!');
            console.log(`   ID: ${this.lastID}`);
            resolve();
          }
        });
      });
    }
    
    // Criar segmentos padrão se não existirem
    const segments = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM segments', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    if (segments.length === 0) {
      console.log('📝 Criando segmentos padrão...');
      
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO segments (name, description) VALUES (?, ?)', ['Segmento Principal', 'Segmento padrão do sistema'], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      await new Promise((resolve, reject) => {
        db.run('INSERT INTO segments (name, description) VALUES (?, ?)', ['Segmento Secundário', 'Segmento adicional'], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      console.log('✅ Segmentos criados!');
    }
    
    // Listar todos os usuários
    console.log('\n📋 Usuários no sistema:');
    const allUsers = await new Promise((resolve, reject) => {
      db.all('SELECT id, name, email, role, status FROM users ORDER BY id', (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    allUsers.forEach(user => {
      console.log(`   ID: ${user.id} | ${user.name} | ${user.email} | Role: ${user.role} | Status: ${user.status}`);
    });
    
    console.log('\n🎯 Credenciais de acesso:');
    console.log('   Email: admin@erp.com');
    console.log('   Senha: admin123');
    console.log('\n✅ Banco local configurado com sucesso!');
    
    db.close();
    
  } catch (error) {
    console.error('❌ Erro na configuração:', error);
  }
}

setupLocalAdmin(); 