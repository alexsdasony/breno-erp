import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp',
  ssl: {
    rejectUnauthorized: false
  }
});

async function migrateCostCenters() {
  try {
    console.log('🔄 Iniciando migração da tabela cost_centers...');
    
    // 1. Verificar se o campo segment_id já existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'cost_centers' AND column_name = 'segment_id'
    `);
    
    if (checkColumn.rows.length === 0) {
      console.log('📝 Adicionando campo segment_id...');
      
      // 2. Adicionar o campo segment_id
      await pool.query(`
        ALTER TABLE cost_centers 
        ADD COLUMN segment_id INTEGER
      `);
      
      console.log('✅ Campo segment_id adicionado com sucesso!');
    } else {
      console.log('ℹ️ Campo segment_id já existe');
    }
    
    // 3. Verificar se a foreign key já existe
    const checkFK = await pool.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'cost_centers' 
      AND constraint_type = 'FOREIGN KEY' 
      AND constraint_name LIKE '%segment_id%'
    `);
    
    if (checkFK.rows.length === 0) {
      console.log('🔗 Adicionando foreign key constraint...');
      
      // 4. Adicionar a foreign key constraint
      await pool.query(`
        ALTER TABLE cost_centers 
        ADD CONSTRAINT fk_cost_centers_segment_id 
        FOREIGN KEY (segment_id) REFERENCES segments(id)
      `);
      
      console.log('✅ Foreign key constraint adicionada com sucesso!');
    } else {
      console.log('ℹ️ Foreign key constraint já existe');
    }
    
    // 5. Verificar a estrutura final
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'cost_centers' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estrutura atualizada da tabela cost_centers:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });
    
    // 6. Verificar dados existentes
    const count = await pool.query('SELECT COUNT(*) as total FROM cost_centers');
    console.log(`\n📈 Total de centros de custo: ${count.rows[0].total}`);
    
    console.log('\n✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  } finally {
    await pool.end();
  }
}

migrateCostCenters(); 