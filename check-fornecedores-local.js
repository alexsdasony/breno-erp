// ============================================================================
// SCRIPT PARA VERIFICAR TABELA FORNECEDORES NO BANCO LOCAL
// ============================================================================

import pkg from 'pg';
const { Client } = pkg;

// Configuração do Banco Local
const localDbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'breno_erp',
  user: 'postgres',
  password: 'admin123'
};

async function checkFornecedoresLocal() {
  console.log('🔍 Verificando tabela fornecedores no banco local...\n');

  const client = new Client(localDbConfig);

  try {
    await client.connect();
    console.log('✅ Conectado ao banco local');

    // Verificar se a tabela existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'fornecedores'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ Tabela fornecedores existe no banco local!');
      
      // Contar registros
      const countResult = await client.query('SELECT COUNT(*) as total FROM fornecedores');
      const total = countResult.rows[0].total;
      console.log(`📊 Tabela tem ${total} fornecedores`);
      
      if (total > 0) {
        // Mostrar alguns registros
        const sampleResult = await client.query(`
          SELECT razao_social, nome_fantasia, cidade, email 
          FROM fornecedores 
          LIMIT 3
        `);
        
        console.log('\n📋 Amostra dos fornecedores:');
        sampleResult.rows.forEach((row, index) => {
          console.log(`${index + 1}. ${row.razao_social} (${row.nome_fantasia}) - ${row.cidade}`);
        });
        
        console.log('\n✅ Sistema de fornecedores está funcionando com banco local!');
        console.log('🌐 Acesse: http://localhost:3000/suppliers');
      } else {
        console.log('⚠️ Tabela existe mas não tem dados');
      }
      
    } else {
      console.log('❌ Tabela fornecedores não existe no banco local!');
      console.log('\n📋 Execute o script de migração:');
      console.log('node migrate-fornecedores-remoto-para-local.js');
    }

  } catch (error) {
    console.log('❌ Erro ao verificar tabela:', error.message);
  } finally {
    await client.end();
    console.log('✅ Conexão com banco local fechada');
  }
}

// Executar verificação
checkFornecedoresLocal();
