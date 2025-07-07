import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function checkTransactions() {
  const client = await pool.connect();
  try {
    // Verificar estrutura da tabela transactions
    const result1 = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
      ORDER BY ordinal_position
    `);
    console.log('📋 Estrutura da tabela transactions:');
    result1.rows.forEach(row => {
      console.log(`- ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Verificar algumas transações de exemplo
    const result2 = await client.query(`
      SELECT id, type, description, amount, category, cost_center, date
      FROM transactions 
      WHERE type = 'despesa'
      LIMIT 5
    `);
    console.log('\n📊 Exemplos de despesas:');
    result2.rows.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, Tipo: ${row.type}, Descrição: ${row.description}, Valor: ${row.amount}, Categoria: ${row.category}, Centro de Custo: ${row.cost_center}`);
    });
    
    // Verificar contas no chart_of_accounts
    const result3 = await client.query(`
      SELECT account_code, account_name, account_type, account_category
      FROM chart_of_accounts 
      WHERE account_type = 'expense'
      LIMIT 5
    `);
    console.log('\n📊 Exemplos de contas de despesa:');
    result3.rows.forEach((row, index) => {
      console.log(`${index + 1}. Código: ${row.account_code}, Nome: ${row.account_name}, Tipo: ${row.account_type}, Categoria: ${row.account_category}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkTransactions(); 