import { getDatabase } from './supabase/backend/database/prodConfig.js';

async function updateDatabase() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    const db = await getDatabase();
    
    console.log('🔄 Adicionando campos nfe_id e description na tabela billings...');
    
    // Adicionar campos
    await db.query(`
      ALTER TABLE billings ADD COLUMN IF NOT EXISTS nfe_id INTEGER;
    `);
    
    await db.query(`
      ALTER TABLE billings ADD COLUMN IF NOT EXISTS description TEXT;
    `);
    
    // Adicionar foreign key
    try {
      await db.query(`
        ALTER TABLE billings ADD CONSTRAINT fk_billings_nfe_id 
        FOREIGN KEY (nfe_id) REFERENCES nfe(id);
      `);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('ℹ️  Foreign key já existe');
    }
    
    // Criar índice
    try {
      await db.query(`
        CREATE INDEX idx_billings_nfe_id ON billings(nfe_id);
      `);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
      console.log('ℹ️  Índice já existe');
    }
    
    console.log('✅ Banco de dados atualizado com sucesso!');
    console.log('✅ Campos nfe_id e description adicionados à tabela billings');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar banco de dados:', error);
    process.exit(1);
  }
}

updateDatabase(); 