import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDRE() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Testando query do DRE...');
    
    // Query simplificada para testar
    const query = `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.cost_center
      FROM transactions t
      WHERE t.date >= '2024-01-01' AND t.date <= '2024-12-31'
      LIMIT 5
    `;
    
    console.log('📝 Executando query:', query);
    const result = await client.query(query);
    console.log('✅ Query executada com sucesso!');
    console.log('📊 Resultados:', result.rows.length, 'registros');
    
  } catch (error) {
    console.error('❌ Erro na query:', error.message);
    console.error('🔍 Detalhes:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testDRE(); 