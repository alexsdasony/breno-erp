import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pluggyClientId = process.env.PLUGGY_CLIENT_ID;
const pluggyClientSecret = process.env.PLUGGY_CLIENT_SECRET;
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/functions/v1', '') || 'http://localhost:3000';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getPluggyApiKey() {
  const res = await fetch('https://api.pluggy.ai/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ clientId: pluggyClientId, clientSecret: pluggyClientSecret }),
  });
  if (!res.ok) throw new Error(`Auth failed: ${res.status}`);
  const data = await res.json();
  return data.apiKey || data.api_key;
}

async function getItemDetails(apiKey, itemId) {
  const res = await fetch(`https://api.pluggy.ai/items/${itemId}`, {
    headers: { 'x-api-key': apiKey },
  });
  if (!res.ok) throw new Error(`Item fetch failed: ${res.status}`);
  return await res.json();
}

async function saveItemViaAPI(itemId, userId, segmentId) {
  const res = await fetch(`${apiUrl}/api/pluggy/items/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, userId, segmentId }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Save failed: ${res.status} - ${error}`);
  }
  
  return await res.json();
}

async function main() {
  console.log('🔄 Sincronizando itens Pluggy com o banco...\n');
  console.log('='.repeat(70));

  // Obter usuário padrão
  const { data: users } = await supabase
    .from('users')
    .select('id, segment_id, name')
    .limit(1);

  if (!users || users.length === 0) {
    console.error('❌ Nenhum usuário encontrado\n');
    return;
  }

  const user = users[0];
  console.log(`👤 Usuário: ${user.name || user.id}`);
  console.log(`   Segment: ${user.segment_id || 'N/A'}\n`);

  // Autenticar
  console.log('🔑 Autenticando na Pluggy...');
  let apiKey;
  try {
    apiKey = await getPluggyApiKey();
    console.log('✅ Autenticação OK\n');
  } catch (error) {
    console.error(`❌ Erro: ${error.message}\n`);
    return;
  }

  // A Pluggy não permite listar todos os itens via API
  // Então vamos tentar buscar itens que já estão no banco ou usar itemIds fornecidos
  console.log('📋 Buscando itens...\n');
  
  // Verificar se há itens no banco
  const { data: existingItems } = await supabase
    .from('pluggy_items')
    .select('item_id');

  if (existingItems && existingItems.length > 0) {
    console.log(`✅ ${existingItems.length} item(s) já estão no banco\n`);
    return;
  }

  // Se não há itens, precisamos dos itemIds
  console.log('⚠️  Nenhum item no banco.');
  console.log('   Para salvar itens existentes, você precisa dos Item IDs.\n');
  console.log('💡 OPÇÕES:\n');
  console.log('   1. Reconecte as contas pelo menu Financeiro');
  console.log('      → Isso salvará automaticamente\n');
  console.log('   2. Ou forneça os Item IDs manualmente:');
  console.log('      → Execute: node scripts/sync-pluggy-items.js ITEM_ID_1 ITEM_ID_2 ITEM_ID_3\n');

  // Se itemIds foram fornecidos via argumentos
  const itemIds = process.argv.slice(2);

  if (itemIds.length === 0) {
    console.log('📝 Para obter os Item IDs:');
    console.log('   1. Acesse: https://dashboard.pluggy.ai');
    console.log('   2. Vá em Items ou Connections');
    console.log('   3. Copie o Item ID de cada conta conectada\n');
    return;
  }

  console.log(`📋 Processando ${itemIds.length} itemId(s)...\n`);

  let saved = 0;
  let errors = 0;

  for (const itemId of itemIds) {
    try {
      console.log(`📌 Processando: ${itemId}`);

      // Buscar detalhes na Pluggy
      const pluggyItem = await getItemDetails(apiKey, itemId);
      console.log(`   Conector: ${pluggyItem.connector?.name || 'N/A'}`);
      console.log(`   Status: ${pluggyItem.status}`);

      // Salvar via API
      console.log(`   💾 Salvando...`);
      await saveItemViaAPI(itemId, user.id, user.segment_id);
      console.log(`   ✅ Salvo!\n`);
      saved++;

    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
      errors++;
    }
  }

  console.log('='.repeat(70));
  console.log(`\n📊 RESULTADO:`);
  console.log(`   ✅ Salvos: ${saved}/${itemIds.length}`);
  console.log(`   ❌ Erros: ${errors}\n`);

  if (saved > 0) {
    console.log('✅ Itens salvos! Execute o teste:');
    console.log('   node scripts/test-pluggy.js\n');
  }
}

main().catch(console.error);


