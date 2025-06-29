import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Configuração do banco de dados
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'breno_erp',
  user: 'postgres',
  password: 'postgres'
});

async function createChartOfAccounts() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando criação do Plano de Contas...');
    
    // Ler o arquivo SQL
    const sqlFile = fs.readFileSync('./create-chart-of-accounts.sql', 'utf8');
    
    // Executar as queries
    await client.query(sqlFile);
    
    console.log('✅ Plano de Contas criado com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('   - chart_of_accounts (Plano de Contas)');
    console.log('   - cost_center_accounts (Relacionamento Centro de Custo x Conta)');
    console.log('📋 Contas contábeis padrão inseridas');
    
    // Verificar se as tabelas foram criadas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('chart_of_accounts', 'cost_center_accounts')
      ORDER BY table_name
    `);
    
    console.log('🔍 Tabelas verificadas:', tablesResult.rows.map(row => row.table_name));
    
    // Contar contas criadas
    const accountsCount = await client.query('SELECT COUNT(*) as total FROM chart_of_accounts');
    console.log(`📈 Total de contas contábeis criadas: ${accountsCount.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Erro ao criar Plano de Contas:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createChartOfAccounts()
    .then(() => {
      console.log('🎉 Processo concluído com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro no processo:', error);
      process.exit(1);
    });
}

export { createChartOfAccounts }; 