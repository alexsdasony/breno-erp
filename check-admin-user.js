import { getDatabase } from './backend/database/prodConfig.js';
import bcrypt from 'bcryptjs';

async function checkAndFixAdminUser() {
  try {
    console.log('🔍 Verificando usuário admin no ambiente remoto...');
    
    const db = await getDatabase();
    
    // Verificar se existe usuário admin
    const adminUser = await db.get('SELECT * FROM users WHERE email = ?', ['admin@erp.com']);
    
    if (adminUser) {
      console.log('✅ Usuário admin encontrado:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Nome: ${adminUser.name}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Status: ${adminUser.status}`);
      console.log(`   Segment ID: ${adminUser.segment_id}`);
      
      // Verificar se precisa de correções
      let needsUpdate = false;
      let updateFields = [];
      
      if (adminUser.status !== 'ativo') {
        needsUpdate = true;
        updateFields.push('status = ativo');
      }
      
      if (adminUser.role !== 'admin') {
        needsUpdate = true;
        updateFields.push('role = admin');
      }
      
      if (needsUpdate) {
        console.log('⚠️  Usuário admin precisa de correções...');
        
        await db.run(`
          UPDATE users 
          SET status = 'ativo', role = 'admin', updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `, [adminUser.id]);
        
        console.log('✅ Usuário admin corrigido!');
      } else {
        console.log('✅ Usuário admin está correto!');
      }
      
    } else {
      console.log('❌ Usuário admin não encontrado. Criando...');
      
      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      // Criar usuário admin
      const result = await db.run(`
        INSERT INTO users (name, email, password, role, status, segment_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['Admin ERP Pro', 'admin@erp.com', hashedPassword, 'admin', 'ativo', null]);
      
      console.log('✅ Usuário admin criado com sucesso!');
      console.log('   Email: admin@erp.com');
      console.log('   Senha: admin123');
      console.log(`   ID: ${result.lastID}`);
    }
    
    // Listar todos os usuários
    console.log('\n📋 Todos os usuários no sistema:');
    const allUsers = await db.all('SELECT id, name, email, role, status, segment_id FROM users ORDER BY id');
    
    allUsers.forEach(user => {
      console.log(`   ID: ${user.id} | ${user.name} | ${user.email} | Role: ${user.role} | Status: ${user.status} | Segment: ${user.segment_id}`);
    });
    
    console.log('\n🎯 Teste de login:');
    console.log('   Email: admin@erp.com');
    console.log('   Senha: admin123');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

checkAndFixAdminUser(); 