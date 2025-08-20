import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  console.error('Certifique-se de que NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('🚀 Iniciando migração da tabela fornecedores...');

    // Ler o arquivo de migração
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250801002000_add_fornecedores_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executando migração...');
    
    // Executar a migração
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });

    if (error) {
      console.error('❌ Erro ao executar migração:', error);
      return;
    }

    console.log('✅ Migração aplicada com sucesso!');

    // Verificar se a tabela foi criada
    console.log('🔍 Verificando tabela fornecedores...');
    const { data: tableCheck, error: tableError } = await supabase
      .from('fornecedores')
      .select('count')
      .limit(1);

    if (tableError) {
      console.error('❌ Erro ao verificar tabela:', tableError);
      return;
    }

    console.log('✅ Tabela fornecedores criada com sucesso!');

    // Verificar dados de exemplo
    console.log('🔍 Verificando dados de exemplo...');
    const { data: fornecedores, error: dataError } = await supabase
      .from('fornecedores')
      .select('razao_social, cpf_cnpj, status')
      .limit(5);

    if (dataError) {
      console.error('❌ Erro ao verificar dados:', dataError);
      return;
    }

    console.log('✅ Dados de exemplo inseridos:');
    fornecedores.forEach((fornecedor, index) => {
      console.log(`   ${index + 1}. ${fornecedor.razao_social} (${fornecedor.cpf_cnpj}) - ${fornecedor.status}`);
    });

    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('📊 Tabela fornecedores está pronta para uso.');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
  }
}

// Executar migração
applyMigration();
