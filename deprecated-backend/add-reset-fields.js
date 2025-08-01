import { getDatabase } from './database/prodConfig.js';

async function addResetFields() {
  try {
    console.log('🔧 Adicionando campos para reset de senha...');
    
    const db = await getDatabase();
    
    // Adicionar campo phone
    await db.run(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `);
    console.log('✅ Campo "phone" adicionado');
    
    // Adicionar campo reset_code
    await db.run(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10)
    `);
    console.log('✅ Campo "reset_code" adicionado');
    
    // Adicionar campo reset_code_expiry
    await db.run(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code_expiry TIMESTAMP
    `);
    console.log('✅ Campo "reset_code_expiry" adicionado');
    
    // Verificar se os campos foram adicionados
    const result = await db.all(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('phone', 'reset_code', 'reset_code_expiry')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Campos na tabela users:');
    result.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    console.log('\n🎉 Campos adicionados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar campos:', error.message);
  }
}

addResetFields(); 