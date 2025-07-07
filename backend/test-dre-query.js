import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function testDREQuery() {
  const client = await pool.connect();
  try {
    // Testar a query do DRE com a correção
    const mainQuery = `
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
      LEFT JOIN chart_of_accounts coa ON t.category = coa.account_category
      WHERE t.date >= '2025-01-01' AND t.date <= '2025-07-07'
      ORDER BY t.date DESC, coa.account_code
      LIMIT 10
    `;
    
    const result = await client.query(mainQuery);
    console.log('✅ Query executada com sucesso!');
    console.log('📊 Transações encontradas:', result.rows.length);
    console.log('🔍 Primeiras 5 transações:');
    result.rows.slice(0, 5).forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, Tipo: ${row.type}, Valor: ${row.amount}, Categoria: ${row.category}, Account Type: ${row.account_type}, Account Category: ${row.account_category}`);
    });
    
    // Verificar quantas despesas têm account_type preenchido
    const despesasComAccountType = result.rows.filter(row => row.type === 'despesa' && row.account_type);
    console.log('📊 Despesas com account_type preenchido:', despesasComAccountType.length);
    
    // Verificar categorias únicas das despesas
    const categoriasDespesas = [...new Set(result.rows.filter(row => row.type === 'despesa').map(row => row.category))];
    console.log('📋 Categorias de despesas:', categoriasDespesas);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testDREQuery(); 