import { initProductionDatabase } from './database/prodConfig.js';
import bcrypt from 'bcryptjs';

async function initializeProductionDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados de produção...');
    
    // Inicializar tabelas
    await initProductionDatabase();
    console.log('✅ Tabelas criadas com sucesso!');
    
    // Importar getDatabase após inicialização
    const { getDatabase } = await import('./database/prodConfig.js');
    const db = await getDatabase();
    
    // Verificar se já existe usuário admin
    const existingAdmin = await db.get('SELECT * FROM users WHERE email = ?', ['admin@erp.com']);
    
    if (existingAdmin) {
      console.log('✅ Usuário admin já existe');
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Nome: ${existingAdmin.name}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   Status: ${existingAdmin.status}`);
      
      // Atualizar para garantir que está correto
      await db.run(`
        UPDATE users 
        SET status = 'ativo', role = 'admin', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [existingAdmin.id]);
      
      console.log('✅ Usuário admin atualizado!');
      
    } else {
      console.log('📝 Criando usuário admin...');
      
      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash('admin123', saltRounds);
      
      // Criar usuário admin
      const result = await db.run(`
        INSERT INTO users (name, email, password, role, status, segment_id) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['Admin ERP Pro', 'admin@erp.com', hashedPassword, 'admin', 'ativo', null]);
      
      console.log('✅ Usuário admin criado com sucesso!');
      console.log(`   ID: ${result.lastID}`);
    }
    
    // Criar segmentos padrão se não existirem
    const segments = await db.all('SELECT * FROM segments');
    if (segments.length === 0) {
      console.log('📝 Criando segmentos padrão...');
      
      await db.run('INSERT INTO segments (name, description) VALUES (?, ?)', ['Segmento Principal', 'Segmento padrão do sistema']);
      await db.run('INSERT INTO segments (name, description) VALUES (?, ?)', ['Segmento Secundário', 'Segmento adicional']);
      
      console.log('✅ Segmentos criados!');
    }
    
    // Listar todos os usuários
    console.log('\n📋 Usuários no sistema:');
    const allUsers = await db.all('SELECT id, name, email, role, status FROM users ORDER BY id');
    allUsers.forEach(user => {
      console.log(`   ID: ${user.id} | ${user.name} | ${user.email} | Role: ${user.role} | Status: ${user.status}`);
    });
    
    console.log('\n🎯 Credenciais de acesso:');
    console.log('   Email: admin@erp.com');
    console.log('   Senha: admin123');
    console.log('\n✅ Banco de dados inicializado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na inicialização:', error);
    console.error('Stack:', error.stack);
  }
}

initializeProductionDatabase(); 