import { Pool } from 'pg';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'breno_erp',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function addResetFields() {
  try {
    console.log('🔧 Adicionando campos para reset de senha...');
    
    // Adicionar campo phone
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)
    `);
    console.log('✅ Campo "phone" adicionado');
    
    // Adicionar campo reset_code
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code VARCHAR(10)
    `);
    console.log('✅ Campo "reset_code" adicionado');
    
    // Adicionar campo reset_code_expiry
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_code_expiry TIMESTAMP
    `);
    console.log('✅ Campo "reset_code_expiry" adicionado');
    
    // Verificar se os campos foram adicionados
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('phone', 'reset_code', 'reset_code_expiry')
      ORDER BY column_name
    `);
    
    console.log('\n📋 Campos na tabela users:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    console.log('\n🎉 Campos adicionados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar campos:', error.message);
  } finally {
    await pool.end();
  }
}

addResetFields(); 