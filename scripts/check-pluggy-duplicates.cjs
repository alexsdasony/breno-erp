const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Erro: Variáveis de ambiente não definidas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkDuplicates() {
  console.log('🔍 Verificando transações duplicadas por pluggy_id...\n');

  // Query direta para buscar todas as transações com pluggy_id
  const { data: transactions, error: queryError } = await supabase
    .from('financial_transactions')
    .select('pluggy_id, id, created_at')
    .not('pluggy_id', 'is', null);

  if (queryError) {
    console.error('❌ Erro ao buscar transações:', queryError);
    process.exit(1);
  }

  // Agrupar por pluggy_id
  const grouped = {};
  transactions.forEach(tx => {
    if (!grouped[tx.pluggy_id]) {
      grouped[tx.pluggy_id] = [];
    }
    grouped[tx.pluggy_id].push(tx);
  });

  // Filtrar apenas duplicatas
  const duplicates = Object.entries(grouped)
    .filter(([_, txs]) => txs.length > 1)
    .map(([pluggyId, txs]) => ({
      pluggy_id: pluggyId,
      quantidade: txs.length,
      ids: txs.map(t => t.id),
      datas_criacao: txs.map(t => t.created_at)
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  const data = duplicates;
  const error = null;

  if (error) {
    console.error('❌ Erro ao verificar duplicatas:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('✅ Nenhuma transação duplicada encontrada!');
    return;
  }

  console.log(`⚠️  Encontradas ${data.length} transações duplicadas:\n`);
  
  data.forEach((dup, index) => {
    console.log(`${index + 1}. pluggy_id: ${dup.pluggy_id}`);
    console.log(`   Quantidade: ${dup.quantidade}`);
    console.log(`   IDs: ${dup.ids.join(', ')}`);
    console.log(`   Datas: ${dup.datas_criacao.join(', ')}\n`);
  });

  // Estatísticas
  const totalDuplicates = data.reduce((sum, dup) => sum + dup.quantidade, 0);
  const totalExtra = totalDuplicates - data.length; // Registros extras além do primeiro
  
  console.log(`📊 Estatísticas:`);
  console.log(`   Total de pluggy_ids duplicados: ${data.length}`);
  console.log(`   Total de registros duplicados: ${totalDuplicates}`);
  console.log(`   Registros extras a remover: ${totalExtra}`);
}

checkDuplicates().catch(console.error);

