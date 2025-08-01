import pkg from 'pg';
const { Pool } = pkg;

const connectionString = process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function testDRELogic() {
  const client = await pool.connect();
  try {
    // Buscar transações
    const result = await client.query(`
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date,
        t.category,
        coa.account_name,
        coa.account_category
      FROM transactions t
      LEFT JOIN chart_of_accounts coa ON t.category = coa.account_category
      WHERE t.date >= '2025-01-01' AND t.date <= '2025-07-07'
      ORDER BY t.type, t.category
    `);
    
    const transactions = result.rows;
    console.log('📊 Total de transações:', transactions.length);
    
    // Agrupar por categoria
    const accountGroups = {};
    
    transactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      const category = transaction.category || 'Sem Categoria';
      
      if (!accountGroups[category]) {
        accountGroups[category] = {
          category: category,
          revenues: 0,
          expenses: 0,
          total: 0
        };
      }
      
      accountGroups[category].total += amount;
      
      if (transaction.type === 'receita') {
        accountGroups[category].revenues += amount;
      } else if (transaction.type === 'despesa') {
        accountGroups[category].expenses += amount;
      }
    });
    
    console.log('\n📋 Agrupamento por categoria:');
    Object.values(accountGroups).forEach(account => {
      console.log(`\n${account.category}:`);
      console.log(`  Receitas: R$ ${account.revenues.toFixed(2)}`);
      console.log(`  Despesas: R$ ${account.expenses.toFixed(2)}`);
      console.log(`  Total: R$ ${account.total.toFixed(2)}`);
    });
    
    // Separar receitas e despesas
    const revenues = [];
    const expenses = [];
    
    Object.values(accountGroups).forEach(account => {
      const accountTransactions = transactions.filter(t => t.category === account.category);
      const hasRevenues = accountTransactions.some(t => t.type === 'receita');
      const hasExpenses = accountTransactions.some(t => t.type === 'despesa');
      
      if (hasExpenses) {
        expenses.push(account);
      } else if (hasRevenues) {
        revenues.push(account);
      }
    });
    
    console.log('\n💰 RECEITAS:');
    revenues.forEach(r => console.log(`  ${r.category}: R$ ${r.total.toFixed(2)}`));
    
    console.log('\n💸 DESPESAS:');
    expenses.forEach(e => console.log(`  ${e.category}: R$ ${e.total.toFixed(2)}`));
    
    const totalRevenues = revenues.reduce((sum, r) => sum + r.total, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.total, 0);
    
    console.log('\n📈 RESUMO:');
    console.log(`  Receitas Totais: R$ ${totalRevenues.toFixed(2)}`);
    console.log(`  Despesas Totais: R$ ${totalExpenses.toFixed(2)}`);
    console.log(`  Resultado Líquido: R$ ${(totalRevenues - totalExpenses).toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testDRELogic(); 