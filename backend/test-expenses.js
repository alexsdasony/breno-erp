import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkExpenses() {
  const client = await pool.connect();
  try {
    // Verificar transações de despesa
    const result1 = await client.query('SELECT COUNT(*) as count FROM transactions WHERE type = \'despesa\'');
    console.log('📊 Total de despesas:', result1.rows[0].count);
    
    // Verificar categorias de despesas
    const result2 = await client.query('SELECT DISTINCT category FROM transactions WHERE type = \'despesa\' LIMIT 10');
    console.log('📋 Categorias de despesas:', result2.rows.map(r => r.category));
    
    // Verificar JOIN com chart_of_accounts
    const result3 = await client.query(`
      SELECT 
        t.category,
        t.type,
        t.amount,
        coa.account_name,
        coa.account_type
      FROM transactions t
      LEFT JOIN chart_of_accounts coa ON t.category = coa.account_name
      WHERE t.type = 'despesa'
      LIMIT 5
    `);
    console.log('🔗 JOIN com chart_of_accounts:', result3.rows);
    
    // Verificar se há contas de despesa no chart_of_accounts
    const result4 = await client.query('SELECT COUNT(*) as count FROM chart_of_accounts WHERE account_type = \'expense\'');
    console.log('📊 Contas de despesa no chart_of_accounts:', result4.rows[0].count);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkExpenses(); 