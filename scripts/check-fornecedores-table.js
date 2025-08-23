import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFornecedoresTable() {
  try {
    console.log('🔍 Verificando tabela fornecedores...');

    // Tentar listar todas as tabelas
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ Erro ao listar tabelas:', tablesError);
      return;
    }

    console.log('📊 Tabelas encontradas:');
    tables.forEach(table => {
      console.log(`   - ${table.table_name}`);
    });

    // Verificar se fornecedores existe
    const fornecedoresExists = tables.some(table => table.table_name === 'fornecedores');
    
    if (fornecedoresExists) {
      console.log('✅ Tabela fornecedores existe!');
      
      // Verificar estrutura
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'fornecedores');

      if (columnsError) {
        console.error('❌ Erro ao verificar colunas:', columnsError);
        return;
      }

      console.log('📋 Estrutura da tabela fornecedores:');
      columns.forEach(column => {
        console.log(`   - ${column.column_name} (${column.data_type}) ${column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });

      // Verificar dados
      const { data: fornecedores, error: dataError } = await supabase
        .from('fornecedores')
        .select('razao_social, cpf_cnpj, status')
        .limit(5);

      if (dataError) {
        console.error('❌ Erro ao verificar dados:', dataError);
        return;
      }

      console.log('📊 Dados encontrados:');
      if (fornecedores.length === 0) {
        console.log('   - Nenhum dado encontrado');
      } else {
        fornecedores.forEach((fornecedor, index) => {
          console.log(`   ${index + 1}. ${fornecedor.razao_social} (${fornecedor.cpf_cnpj}) - ${fornecedor.status}`);
        });
      }

    } else {
      console.log('❌ Tabela fornecedores não existe!');
      console.log('💡 Você precisa criar a tabela manualmente no Supabase ou usar uma migração.');
    }

  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
  }
}

// Executar verificação
checkFornecedoresTable();
