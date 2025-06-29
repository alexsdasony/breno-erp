import pkg from 'pg';
const { Pool } = pkg;

// Configuração do banco PostgreSQL
const pool = new Pool({
  connectionString: 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp',
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkData() {
  try {
    console.log('🔍 Verificando dados no PostgreSQL...');
    
    // Testar conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida!');

    // Verificar cada tabela
    const tables = [
      'customers', 'products', 'sales', 'transactions', 
      'billings', 'accounts_payable', 'nfe_list', 
      'segments', 'cost_centers', 'users', 'integrations'
    ];

    console.log('\n📊 Resumo dos dados:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = result.rows[0].count;
        console.log(`${table.padEnd(20)} │ ${count.toString().padStart(6)} registros`);
      } catch (error) {
        console.log(`${table.padEnd(20)} │ ❌ Erro: ${error.message}`);
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Verificar alguns dados específicos
    console.log('\n🔎 Verificações detalhadas:');
    
    // Verificar clientes
    const customersResult = await pool.query('SELECT name, email FROM customers LIMIT 3');
    console.log('👥 Primeiros clientes:');
    customersResult.rows.forEach(row => {
      console.log(`   • ${row.name} (${row.email})`);
    });

    // Verificar produtos
    const productsResult = await pool.query('SELECT name, price FROM products LIMIT 3');
    console.log('\n📦 Primeiros produtos:');
    productsResult.rows.forEach(row => {
      console.log(`   • ${row.name} - R$ ${row.price}`);
    });

    // Verificar vendas
    const salesResult = await pool.query('SELECT customer_name, product, total FROM sales LIMIT 3');
    console.log('\n💰 Primeiras vendas:');
    salesResult.rows.forEach(row => {
      console.log(`   • ${row.customer_name} comprou ${row.product} por R$ ${row.total}`);
    });

    console.log('\n🎉 Verificação concluída!');
    console.log('🌐 Acesse http://localhost:3002 para ver no DB Admin');

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await pool.end();
  }
}

checkData(); 