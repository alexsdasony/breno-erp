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

// Simular a lógica corrigida do filtro por segmento
function filterBySegment(transactions, segmentId) {
  return transactions.filter(item => {
    // Se não há segmento ativo ou é "Todos os Segmentos" (0), incluir todas
    if (!segmentId || segmentId === 0) {
      return true;
    }
    // Se há segmento ativo, incluir transações do segmento OU transações sem segmento (null)
    return item.segmentId === segmentId || item.segmentId === null;
  });
}

async function testFixedFilter() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 TESTANDO FILTRO CORRIGIDO');
    console.log('=' .repeat(50));
    
    // Parâmetros de teste
    const startDate = '2025-01-01';
    const endDate = '2025-07-07';
    
    // Buscar todas as transações
    const query = `
      SELECT 
        id,
        type,
        amount,
        segment_id as segmentId
      FROM transactions 
      WHERE date >= $1 AND date <= $2
      ORDER BY id
    `;
    
    const result = await client.query(query, [startDate, endDate]);
    const transactions = result.rows;
    
    console.log(`📊 Total de transações: ${transactions.length}`);
    
    // Testar diferentes segmentos
    const testSegments = [null, 0, 1, 2, 3];
    
    for (const segmentId of testSegments) {
      const filteredTransactions = filterBySegment(transactions, segmentId);
      
      const revenues = filteredTransactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const expenses = filteredTransactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const segmentName = segmentId === null ? 'null' : 
                         segmentId === 0 ? 'Todos os Segmentos' : 
                         `Segmento ${segmentId}`;
      
      console.log(`\n💰 ${segmentName}:`);
      console.log(`   Transações filtradas: ${filteredTransactions.length}`);
      console.log(`   Receitas: R$ ${revenues.toFixed(2)}`);
      console.log(`   Despesas: R$ ${expenses.toFixed(2)}`);
      console.log(`   Resultado: R$ ${(revenues - expenses).toFixed(2)}`);
    }
    
    // Verificar se todos os segmentos agora mostram os mesmos valores
    console.log('\n✅ VERIFICAÇÃO:');
    const allResults = testSegments.map(segmentId => {
      const filteredTransactions = filterBySegment(transactions, segmentId);
      const revenues = filteredTransactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      const expenses = filteredTransactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      return { segmentId, revenues, expenses, result: revenues - expenses };
    });
    
    const firstResult = allResults[0];
    const allSame = allResults.every(result => 
      result.revenues === firstResult.revenues && 
      result.expenses === firstResult.expenses
    );
    
    if (allSame) {
      console.log('   ✅ Todos os segmentos agora mostram os mesmos valores!');
      console.log(`   📊 Receitas: R$ ${firstResult.revenues.toFixed(2)}`);
      console.log(`   📊 Despesas: R$ ${firstResult.expenses.toFixed(2)}`);
      console.log(`   📊 Resultado: R$ ${firstResult.result.toFixed(2)}`);
    } else {
      console.log('   ❌ Ainda há diferenças entre os segmentos');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testFixedFilter(); 