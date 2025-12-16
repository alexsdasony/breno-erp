import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

// Limpar a chave (remover quebras de linha)
supabaseServiceKey = supabaseServiceKey.replace(/\n/g, '').replace(/\r/g, '').trim();

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNullIssueDates() {
  try {
    // Contar total de registros
    const { count: totalCount } = await supabase
      .from('financial_documents')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false);

    // Contar registros com issue_date NULL
    const { count: nullCount } = await supabase
      .from('financial_documents')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .is('issue_date', null);

    // Contar registros com issue_date preenchido
    const { count: filledCount } = await supabase
      .from('financial_documents')
      .select('*', { count: 'exact', head: true })
      .eq('is_deleted', false)
      .not('issue_date', 'is', null);

    console.log('📊 Estatísticas de issue_date:');
    console.log('   Total de registros (is_deleted = false):', totalCount);
    console.log('   Registros com issue_date NULL:', nullCount);
    console.log('   Registros com issue_date preenchido:', filledCount);
    console.log('   Percentual NULL:', totalCount > 0 ? ((nullCount / totalCount) * 100).toFixed(2) + '%' : '0%');

    // Buscar alguns exemplos de registros com issue_date NULL
    const { data: nullExamples } = await supabase
      .from('financial_documents')
      .select('id, direction, amount, issue_date, due_date, created_at')
      .eq('is_deleted', false)
      .is('issue_date', null)
      .limit(5);

    if (nullExamples && nullExamples.length > 0) {
      console.log('\n📋 Exemplos de registros com issue_date NULL:');
      nullExamples.forEach((doc, index) => {
        console.log(`   ${index + 1}. ID: ${doc.id}, Direction: ${doc.direction}, Amount: ${doc.amount}, Due Date: ${doc.due_date}, Created: ${doc.created_at}`);
      });
    }

  } catch (error) {
    console.error('❌ Erro ao consultar:', error);
  }
}

checkNullIssueDates();

