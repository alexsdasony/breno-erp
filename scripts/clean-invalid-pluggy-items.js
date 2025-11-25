/**
 * Script para limpar itens inválidos conhecidos da tabela pluggy_items
 * 
 * IDs inválidos conhecidos:
 * - f892f7a3-1c7a-4875-b084-e8a376fa730f
 * - 67a1f002-5ca8-4f01-97d4-b04fe87aa26a
 * - 48c193bc-7276-4b53-9bf9-f91cd6a05fda
 * 
 * Execute: node scripts/clean-invalid-pluggy-items.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const invalidItemIds = [
  'f892f7a3-1c7a-4875-b084-e8a376fa730f',
  '67a1f002-5ca8-4f01-97d4-b04fe87aa26a',
  '48c193bc-7276-4b53-9bf9-f91cd6a05fda'
];

async function cleanInvalidItems() {
  console.log('🧹 Iniciando limpeza de itens inválidos da tabela pluggy_items...');
  console.log('📋 IDs inválidos conhecidos:', invalidItemIds);

  try {
    // Deletar itens inválidos conhecidos
    const { data, error } = await supabase
      .from('pluggy_items')
      .delete()
      .in('item_id', invalidItemIds);

    if (error) {
      console.error('❌ Erro ao deletar itens inválidos:', error);
      process.exit(1);
    }

    console.log('✅ Limpeza concluída!');
    console.log(`📊 Itens deletados: ${data?.length || 0}`);
    
    // Verificar se ainda existem itens inválidos
    const { data: remaining, error: checkError } = await supabase
      .from('pluggy_items')
      .select('item_id')
      .in('item_id', invalidItemIds);

    if (checkError) {
      console.error('⚠️ Erro ao verificar itens restantes:', checkError);
    } else {
      if (remaining && remaining.length > 0) {
        console.warn(`⚠️ Ainda existem ${remaining.length} itens inválidos na tabela:`, remaining.map(r => r.item_id));
      } else {
        console.log('✅ Todos os itens inválidos foram removidos com sucesso!');
      }
    }

  } catch (error) {
    console.error('❌ Erro ao executar limpeza:', error);
    process.exit(1);
  }
}

cleanInvalidItems();

