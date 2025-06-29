import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDREJoins() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testando JOINs do DRE...');
    
    // Teste 1: Query básica com JOIN
    console.log('\n📝 Teste 1: Query com JOIN cost_centers');
    const query1 = `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.cost_center,
        cc.name as cost_center_name
      FROM transactions t
      LEFT JOIN cost_centers cc ON t.cost_center = cc.name
      WHERE t.date >= '2024-01-01' AND t.date <= '2024-12-31'
      LIMIT 3
    `;
    
    const result1 = await client.query(query1);
    console.log('✅ Teste 1 executado com sucesso!');
    console.log('📊 Resultados:', result1.rows.length, 'registros');
    
    // Teste 2: Query com JOIN chart_of_accounts
    console.log('\n📝 Teste 2: Query com JOIN chart_of_accounts');
    const query2 = `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.cost_center,
        coa.id as account_id,
        coa.account_code,
        coa.account_name,
        coa.account_type
      FROM transactions t
      LEFT JOIN chart_of_accounts coa ON t.category = coa.account_type
      WHERE t.date >= '2024-01-01' AND t.date <= '2024-12-31'
      LIMIT 3
    `;
    
    const result2 = await client.query(query2);
    console.log('✅ Teste 2 executado com sucesso!');
    console.log('📊 Resultados:', result2.rows.length, 'registros');
    
    // Teste 3: Query completa (como no DRE)
    console.log('\n📝 Teste 3: Query completa do DRE');
    const query3 = `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.cost_center,
        cc.name as cost_center_name,
        coa.id as account_id,
        coa.account_code,
        coa.account_name,
        coa.account_type,
        coa.account_category
      FROM transactions t
      LEFT JOIN cost_centers cc ON t.cost_center = cc.name
      LEFT JOIN chart_of_accounts coa ON t.category = coa.account_type
      WHERE t.date >= '2024-01-01' AND t.date <= '2024-12-31'
      ORDER BY t.date DESC, coa.account_code
      LIMIT 3
    `;
    
    const result3 = await client.query(query3);
    console.log('✅ Teste 3 executado com sucesso!');
    console.log('📊 Resultados:', result3.rows.length, 'registros');
    
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    console.error('🔍 Detalhes:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testDREJoins(); 