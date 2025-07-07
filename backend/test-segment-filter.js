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

async function testSegmentFilter() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 TESTANDO FILTRO POR SEGMENTO');
    console.log('=' .repeat(50));
    
    // Parâmetros de teste
    const startDate = '2025-01-01';
    const endDate = '2025-07-07';
    
    // 1. Verificar todos os segmentos disponíveis
    console.log('\n📊 SEGMENTOS DISPONÍVEIS:');
    const segmentsResult = await client.query('SELECT * FROM segments ORDER BY id');
    console.log('   Segmentos encontrados:', segmentsResult.rows.length);
    segmentsResult.rows.forEach(segment => {
      console.log(`     ID: ${segment.id}, Nome: ${segment.name}`);
    });
    
    // 2. Verificar transações por segmento
    console.log('\n💰 TRANSAÇÕES POR SEGMENTO:');
    for (const segment of segmentsResult.rows) {
      const query = `
        SELECT 
          type,
          COUNT(*) as count,
          SUM(amount) as total
        FROM transactions 
        WHERE date >= $1 AND date <= $2 AND segment_id = $3
        GROUP BY type
        ORDER BY type
      `;
      
      const result = await client.query(query, [startDate, endDate, segment.id]);
      
      let revenues = 0;
      let expenses = 0;
      
      result.rows.forEach(row => {
        if (row.type === 'receita') {
          revenues = parseFloat(row.total) || 0;
        } else if (row.type === 'despesa') {
          expenses = parseFloat(row.total) || 0;
        }
      });
      
      console.log(`   Segmento ${segment.id} (${segment.name}):`);
      console.log(`     Receitas: R$ ${revenues.toFixed(2)}`);
      console.log(`     Despesas: R$ ${expenses.toFixed(2)}`);
      console.log(`     Resultado: R$ ${(revenues - expenses).toFixed(2)}`);
    }
    
    // 3. Verificar transações sem segmento (segment_id = null)
    console.log('\n❓ TRANSAÇÕES SEM SEGMENTO (segment_id = null):');
    const nullSegmentQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM transactions 
      WHERE date >= $1 AND date <= $2 AND segment_id IS NULL
      GROUP BY type
      ORDER BY type
    `;
    
    const nullSegmentResult = await client.query(nullSegmentQuery, [startDate, endDate]);
    
    let nullRevenues = 0;
    let nullExpenses = 0;
    
    nullSegmentResult.rows.forEach(row => {
      if (row.type === 'receita') {
        nullRevenues = parseFloat(row.total) || 0;
      } else if (row.type === 'despesa') {
        nullExpenses = parseFloat(row.total) || 0;
      }
    });
    
    console.log(`   Transações sem segmento:`);
    console.log(`     Receitas: R$ ${nullRevenues.toFixed(2)}`);
    console.log(`     Despesas: R$ ${nullExpenses.toFixed(2)}`);
    console.log(`     Resultado: R$ ${(nullRevenues - nullExpenses).toFixed(2)}`);
    
    // 4. Verificar total geral (sem filtro de segmento)
    console.log('\n🌐 TOTAL GERAL (SEM FILTRO DE SEGMENTO):');
    const totalQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM transactions 
      WHERE date >= $1 AND date <= $2
      GROUP BY type
      ORDER BY type
    `;
    
    const totalResult = await client.query(totalQuery, [startDate, endDate]);
    
    let totalRevenues = 0;
    let totalExpenses = 0;
    
    totalResult.rows.forEach(row => {
      if (row.type === 'receita') {
        totalRevenues = parseFloat(row.total) || 0;
      } else if (row.type === 'despesa') {
        totalExpenses = parseFloat(row.total) || 0;
      }
    });
    
    console.log(`   Total geral:`);
    console.log(`     Receitas: R$ ${totalRevenues.toFixed(2)}`);
    console.log(`     Despesas: R$ ${totalExpenses.toFixed(2)}`);
    console.log(`     Resultado: R$ ${(totalRevenues - totalExpenses).toFixed(2)}`);
    
    // 5. Verificar se há transações com segment_id = 0
    console.log('\n🔢 TRANSAÇÕES COM segment_id = 0:');
    const zeroSegmentQuery = `
      SELECT 
        type,
        COUNT(*) as count,
        SUM(amount) as total
      FROM transactions 
      WHERE date >= $1 AND date <= $2 AND segment_id = 0
      GROUP BY type
      ORDER BY type
    `;
    
    const zeroSegmentResult = await client.query(zeroSegmentQuery, [startDate, endDate]);
    
    let zeroRevenues = 0;
    let zeroExpenses = 0;
    
    zeroSegmentResult.rows.forEach(row => {
      if (row.type === 'receita') {
        zeroRevenues = parseFloat(row.total) || 0;
      } else if (row.type === 'despesa') {
        zeroExpenses = parseFloat(row.total) || 0;
      }
    });
    
    console.log(`   Transações com segment_id = 0:`);
    console.log(`     Receitas: R$ ${zeroRevenues.toFixed(2)}`);
    console.log(`     Despesas: R$ ${zeroExpenses.toFixed(2)}`);
    console.log(`     Resultado: R$ ${(zeroRevenues - zeroExpenses).toFixed(2)}`);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

testSegmentFilter(); 