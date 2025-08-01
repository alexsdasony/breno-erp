import pkg from 'pg';
const { Pool } = pkg;

// Configuração do banco PostgreSQL
const connectionString = process.env.DATABASE_URL || 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp';
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function compareDREvsFinancial() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 COMPARANDO DRE vs MÓDULO FINANCEIRO');
    console.log('=' .repeat(50));
    
    // Parâmetros de teste
    const startDate = '2025-01-01';
    const endDate = '2025-07-07';
    
    // 1. Cálculo do DRE (como está no reports.js)
    console.log('\n📊 CÁLCULO DO DRE:');
    const dreQuery = `
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
      WHERE t.date >= $1 AND t.date <= $2
      ORDER BY t.date DESC, coa.account_code
    `;
    
    const dreResult = await client.query(dreQuery, [startDate, endDate]);
    const dreTransactions = dreResult.rows;
    
    // Calcular receitas e despesas do DRE
    let dreTotalRevenues = 0;
    let dreTotalExpenses = 0;
    
    dreTransactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      if (transaction.type === 'receita') {
        dreTotalRevenues += amount;
      } else if (transaction.type === 'despesa') {
        dreTotalExpenses += amount;
      }
    });
    
    console.log(`   Transações encontradas: ${dreTransactions.length}`);
    console.log(`   Receitas DRE: R$ ${dreTotalRevenues.toFixed(2)}`);
    console.log(`   Despesas DRE: R$ ${dreTotalExpenses.toFixed(2)}`);
    console.log(`   Resultado DRE: R$ ${(dreTotalRevenues - dreTotalExpenses).toFixed(2)}`);
    
    // 2. Cálculo do Módulo Financeiro (como está no metrics.js)
    console.log('\n💰 CÁLCULO DO MÓDULO FINANCEIRO:');
    const financialQuery = `
      SELECT 
        id,
        description,
        amount,
        type,
        date,
        category,
        cost_center,
        segment_id
      FROM transactions 
      WHERE date >= $1 AND date <= $2
      ORDER BY date DESC
    `;
    
    const financialResult = await client.query(financialQuery, [startDate, endDate]);
    const financialTransactions = financialResult.rows;
    
    // Calcular receitas e despesas do Financeiro
    let financialTotalRevenues = 0;
    let financialTotalExpenses = 0;
    
    financialTransactions.forEach(transaction => {
      const amount = parseFloat(transaction.amount) || 0;
      if (transaction.type === 'receita') {
        financialTotalRevenues += amount;
      } else if (transaction.type === 'despesa') {
        financialTotalExpenses += amount;
      }
    });
    
    console.log(`   Transações encontradas: ${financialTransactions.length}`);
    console.log(`   Receitas Financeiro: R$ ${financialTotalRevenues.toFixed(2)}`);
    console.log(`   Despesas Financeiro: R$ ${financialTotalExpenses.toFixed(2)}`);
    console.log(`   Resultado Financeiro: R$ ${(financialTotalRevenues - financialTotalExpenses).toFixed(2)}`);
    
    // 3. Comparação
    console.log('\n🔍 COMPARAÇÃO:');
    console.log(`   Diferença em Receitas: R$ ${(dreTotalRevenues - financialTotalRevenues).toFixed(2)}`);
    console.log(`   Diferença em Despesas: R$ ${(dreTotalExpenses - financialTotalExpenses).toFixed(2)}`);
    console.log(`   Diferença no Resultado: R$ ${((dreTotalRevenues - dreTotalExpenses) - (financialTotalRevenues - financialTotalExpenses)).toFixed(2)}`);
    
    // 4. Verificar se há transações diferentes
    const dreTransactionIds = new Set(dreTransactions.map(t => t.id));
    const financialTransactionIds = new Set(financialTransactions.map(t => t.id));
    
    const onlyInDRE = dreTransactions.filter(t => !financialTransactionIds.has(t.id));
    const onlyInFinancial = financialTransactions.filter(t => !dreTransactionIds.has(t.id));
    
    console.log('\n📋 ANÁLISE DETALHADA:');
    console.log(`   Transações apenas no DRE: ${onlyInDRE.length}`);
    console.log(`   Transações apenas no Financeiro: ${onlyInFinancial.length}`);
    
    if (onlyInDRE.length > 0) {
      console.log('\n   Transações apenas no DRE:');
      onlyInDRE.forEach(t => {
        console.log(`     ID: ${t.id}, Tipo: ${t.type}, Valor: R$ ${t.amount}, Data: ${t.date}`);
      });
    }
    
    if (onlyInFinancial.length > 0) {
      console.log('\n   Transações apenas no Financeiro:');
      onlyInFinancial.forEach(t => {
        console.log(`     ID: ${t.id}, Tipo: ${t.type}, Valor: R$ ${t.amount}, Data: ${t.date}`);
      });
    }
    
    // 5. Verificar JOIN do DRE
    console.log('\n🔗 ANÁLISE DO JOIN DO DRE:');
    const transactionsWithJoin = dreTransactions.filter(t => t.account_id !== null);
    const transactionsWithoutJoin = dreTransactions.filter(t => t.account_id === null);
    
    console.log(`   Transações com JOIN: ${transactionsWithJoin.length}`);
    console.log(`   Transações sem JOIN: ${transactionsWithoutJoin.length}`);
    
    if (transactionsWithoutJoin.length > 0) {
      console.log('\n   Transações sem JOIN (categoria não encontrada no plano de contas):');
      const categoriesWithoutJoin = [...new Set(transactionsWithoutJoin.map(t => t.category))];
      categoriesWithoutJoin.forEach(category => {
        const transactionsInCategory = transactionsWithoutJoin.filter(t => t.category === category);
        const totalAmount = transactionsInCategory.reduce((sum, t) => sum + parseFloat(t.amount), 0);
        console.log(`     Categoria: ${category}, Transações: ${transactionsInCategory.length}, Total: R$ ${totalAmount.toFixed(2)}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

compareDREvsFinancial(); 