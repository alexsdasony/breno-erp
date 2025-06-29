import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp',
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateSalesAndAccounts() {
  try {
    console.log('🔄 Iniciando migração das tabelas sales e accounts_payable...');
    
    // 1. Migração da tabela sales
    console.log('\n📊 Migrando tabela sales...');
    
    // Verificar se o campo segment_id já existe em sales
    const checkSalesColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'sales' AND column_name = 'segment_id'
    `);
    
    if (checkSalesColumn.rows.length === 0) {
      console.log('📝 Adicionando campo segment_id em sales...');
      await pool.query('ALTER TABLE sales ADD COLUMN segment_id INTEGER');
      console.log('✅ Campo segment_id adicionado em sales!');
    } else {
      console.log('ℹ️ Campo segment_id já existe em sales');
    }
    
    // Verificar se a foreign key já existe em sales
    const checkSalesFK = await pool.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'sales' 
      AND constraint_type = 'FOREIGN KEY' 
      AND constraint_name LIKE '%segment_id%'
    `);
    
    if (checkSalesFK.rows.length === 0) {
      console.log('🔗 Adicionando foreign key constraint em sales...');
      await pool.query(`
        ALTER TABLE sales 
        ADD CONSTRAINT fk_sales_segment_id 
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      `);
      console.log('✅ Foreign key constraint adicionada em sales!');
    } else {
      console.log('ℹ️ Foreign key constraint já existe em sales');
    }
    
    // 2. Migração da tabela accounts_payable
    console.log('\n💰 Migrando tabela accounts_payable...');
    
    // Verificar se o campo segment_id já existe em accounts_payable
    const checkAccountsColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'accounts_payable' AND column_name = 'segment_id'
    `);
    
    if (checkAccountsColumn.rows.length === 0) {
      console.log('📝 Adicionando campo segment_id em accounts_payable...');
      await pool.query('ALTER TABLE accounts_payable ADD COLUMN segment_id INTEGER');
      console.log('✅ Campo segment_id adicionado em accounts_payable!');
    } else {
      console.log('ℹ️ Campo segment_id já existe em accounts_payable');
    }
    
    // Verificar se a foreign key já existe em accounts_payable
    const checkAccountsFK = await pool.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'accounts_payable' 
      AND constraint_type = 'FOREIGN KEY' 
      AND constraint_name LIKE '%segment_id%'
    `);
    
    if (checkAccountsFK.rows.length === 0) {
      console.log('🔗 Adicionando foreign key constraint em accounts_payable...');
      await pool.query(`
        ALTER TABLE accounts_payable 
        ADD CONSTRAINT fk_accounts_payable_segment_id 
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      `);
      console.log('✅ Foreign key constraint adicionada em accounts_payable!');
    } else {
      console.log('ℹ️ Foreign key constraint já existe em accounts_payable');
    }
    
    // 3. Verificar estruturas finais
    console.log('\n📊 Estrutura atualizada das tabelas:');
    
    const salesStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'sales' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📈 Tabela sales:');
    salesStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });
    
    const accountsStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'accounts_payable' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n💰 Tabela accounts_payable:');
    accountsStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });
    
    // 4. Verificar dados existentes
    const salesCount = await pool.query('SELECT COUNT(*) as total FROM sales');
    const accountsCount = await pool.query('SELECT COUNT(*) as total FROM accounts_payable');
    
    console.log(`\n📈 Total de vendas: ${salesCount.rows[0].total}`);
    console.log(`💰 Total de contas a pagar: ${accountsCount.rows[0].total}`);
    
    console.log('\n✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await pool.end();
  }
}

migrateSalesAndAccounts(); 