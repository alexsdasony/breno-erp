import { getDatabase } from './supabase/backend/database/prodConfig.js';

async function createBillingsTable() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    const db = await getDatabase();
    
    console.log('🔄 Verificando tabelas existentes...');
    
    // Listar todas as tabelas
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tabelas existentes:');
    if (tablesResult && tablesResult.length > 0) {
      tablesResult.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    } else {
      console.log('  (Nenhuma tabela encontrada)');
    }
    
    // Verificar se a tabela billings existe
    const billingsExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'billings'
      );
    `);
    
    if (!billingsExists.exists) {
      console.log('🔄 Criando tabela billings...');
      
      await db.query(`
        CREATE TABLE billings (
          id SERIAL PRIMARY KEY,
          customer_id INTEGER NOT NULL,
          customer_name TEXT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          due_date DATE NOT NULL,
          status TEXT DEFAULT 'Pendente' CHECK(status IN ('Pendente', 'Paga', 'Vencida', 'Cancelada')),
          payment_date DATE,
          segment_id INTEGER,
          nfe_id INTEGER,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (customer_id) REFERENCES customers(id),
          FOREIGN KEY (segment_id) REFERENCES segments(id),
          FOREIGN KEY (nfe_id) REFERENCES nfe(id)
        );
      `);
      
      console.log('✅ Tabela billings criada com sucesso!');
      
      // Criar índices
      await db.query(`
        CREATE INDEX idx_billings_customer_id ON billings(customer_id);
        CREATE INDEX idx_billings_due_date ON billings(due_date);
        CREATE INDEX idx_billings_status ON billings(status);
        CREATE INDEX idx_billings_segment_id ON billings(segment_id);
        CREATE INDEX idx_billings_nfe_id ON billings(nfe_id);
      `);
      
      console.log('✅ Índices criados com sucesso!');
      
    } else {
      console.log('✅ Tabela billings já existe');
      
      // Verificar se os novos campos existem
      const columnsResult = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'billings' 
        AND table_schema = 'public'
        ORDER BY column_name;
      `);
      
      console.log('📋 Colunas da tabela billings:');
      if (columnsResult && columnsResult.length > 0) {
        columnsResult.forEach(col => {
          console.log(`  - ${col.column_name}`);
        });
      }
      
      // Verificar se nfe_id e description existem
      const hasNfeId = columnsResult && columnsResult.some(col => col.column_name === 'nfe_id');
      const hasDescription = columnsResult && columnsResult.some(col => col.column_name === 'description');
      
      if (!hasNfeId) {
        console.log('🔄 Adicionando coluna nfe_id...');
        await db.query(`
          ALTER TABLE billings ADD COLUMN nfe_id INTEGER;
          ALTER TABLE billings ADD CONSTRAINT fk_billings_nfe_id 
          FOREIGN KEY (nfe_id) REFERENCES nfe(id);
        `);
        console.log('✅ Coluna nfe_id adicionada');
      }
      
      if (!hasDescription) {
        console.log('🔄 Adicionando coluna description...');
        await db.query(`
          ALTER TABLE billings ADD COLUMN description TEXT;
        `);
        console.log('✅ Coluna description adicionada');
      }
    }
    
    console.log('✅ Tabela billings está pronta para uso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar/verificar tabela billings:', error);
    process.exit(1);
  }
}

createBillingsTable(); 