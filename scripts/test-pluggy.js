import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pluggyClientId = process.env.PLUGGY_CLIENT_ID;
const pluggyClientSecret = process.env.PLUGGY_CLIENT_SECRET;
const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/functions/v1', '') || 'https://www.rdsinvestimentos.com';

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

async function main() {
  console.log('🧪 TESTE DA INTEGRAÇÃO PLUGGY\n');
  console.log('='.repeat(70));

  // 1. Verificar autenticação
  console.log('\n1️⃣ Autenticação Pluggy...');
  let apiKey;
  try {
    apiKey = await getPluggyApiKey();
    console.log('✅ Autenticação OK\n');
  } catch (error) {
    console.log(`❌ Erro: ${error.message}\n`);
    return;
  }

  // 2. Verificar itens no banco
  console.log('2️⃣ Itens conectados no banco...');
  const { data: items } = await supabase
    .from('pluggy_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (!items || items.length === 0) {
    console.log('⚠️  Nenhum item encontrado no banco');
    console.log('   As contas estão na Pluggy mas não foram salvas aqui.\n');
    console.log('💡 SOLUÇÃO:');
    console.log('   Reconecte as contas pelo menu Financeiro → "Conectar Conta Bancária"\n');
    return;
  }

  console.log(`✅ ${items.length} item(s) encontrado(s):\n`);

  // 3. Verificar status de cada item na Pluggy
  console.log('3️⃣ Status dos itens na Pluggy...\n');
  const dateTo = new Date().toISOString().split('T')[0];
  // Buscar últimos 90 dias para garantir que pegue todas as transações
  const dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  let totalTransactionsAvailable = 0;
  let totalTransactionsInDb = 0;

  for (const item of items) {
    try {
      // Buscar item na Pluggy
      const itemRes = await fetch(`https://api.pluggy.ai/items/${item.item_id}`, {
        headers: { 'x-api-key': apiKey },
      });

      if (!itemRes.ok) {
        console.log(`   ⚠️  ${item.connector_name || item.item_id}: Erro ao buscar (${itemRes.status})`);
        continue;
      }

      const pluggyItem = await itemRes.json();
      
      console.log(`   📌 ${item.connector_name || 'N/A'}`);
      console.log(`      Status: ${pluggyItem.status}`);
      console.log(`      Execution: ${pluggyItem.executionStatus}`);

      // Verificar contas
      const accountsRes = await fetch(`https://api.pluggy.ai/accounts?itemId=${item.item_id}`, {
        headers: { 'x-api-key': apiKey },
      });

      if (accountsRes.ok) {
        const accounts = await accountsRes.json();
        const accountsList = accounts.results || [];
        console.log(`      Contas: ${accountsList.length}`);
        
        if (accountsList.length > 0) {
          accountsList.forEach(acc => {
            const balance = acc.balance ? `R$ ${acc.balance.toFixed(2)}` : 'N/A';
            console.log(`         - ${acc.name || acc.type || 'N/A'}: ${balance}`);
          });
        }
      }

      // Verificar transações disponíveis
      if (pluggyItem.status === 'UPDATED' && pluggyItem.executionStatus === 'SUCCESS') {
        const txRes = await fetch(
          `https://api.pluggy.ai/transactions?itemId=${item.item_id}&from=${dateFrom}&to=${dateTo}&pageSize=100`,
          { headers: { 'x-api-key': apiKey } }
        );

        if (txRes.ok) {
          const txData = await txRes.json();
          const txCount = txData.totalResults || txData.results?.length || 0;
          totalTransactionsAvailable += txCount;

          // Verificar no banco
          const { count: dbCount } = await supabase
            .from('financial_transactions')
            .select('*', { count: 'exact', head: true })
            .eq('item_id', item.item_id);

          totalTransactionsInDb += dbCount || 0;

          console.log(`      Transações disponíveis: ${txCount}`);
          console.log(`      Transações no banco: ${dbCount || 0}`);

          if (txCount > 0 && (dbCount || 0) < txCount) {
            console.log(`      🔄 Precisa sincronizar: ${txCount - (dbCount || 0)} transações`);
          }

          // Mostrar exemplos de transações
          if (txData.results && txData.results.length > 0) {
            console.log(`\n      📝 Exemplos de transações:`);
            txData.results.slice(0, 3).forEach((tx, idx) => {
              console.log(`         ${idx + 1}. ${tx.date} - ${tx.description?.substring(0, 40) || 'N/A'} - R$ ${tx.amount?.toFixed(2) || '0.00'}`);
            });
          }
        }
      } else {
        console.log(`      ⚠️  Item ainda processando ou com erro`);
        if (pluggyItem.error) {
          console.log(`      Erro: ${JSON.stringify(pluggyItem.error)}`);
        }
      }

      console.log('');
    } catch (error) {
      console.log(`   ❌ ${item.item_id}: ${error.message}\n`);
    }
  }

  // 4. Testar sincronização
  console.log('4️⃣ Testando sincronização...\n');
  
  if (totalTransactionsAvailable > totalTransactionsInDb) {
    const itemToSync = items.find(item => {
      // Encontrar item com transações disponíveis
      return true; // Vamos tentar sincronizar o primeiro
    });

    if (itemToSync) {
      try {
        console.log(`   Sincronizando ${itemToSync.connector_name || itemToSync.item_id}...`);
        
        const syncRes = await fetch(`${apiUrl}/api/pluggy/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PLUGGY_SYNC_SERVICE_TOKEN || ''}`,
          },
          body: JSON.stringify({
            itemId: itemToSync.item_id,
            dateFrom,
            dateTo,
          }),
        });

        if (syncRes.ok) {
          const result = await syncRes.json();
          console.log(`   ✅ Sincronização OK: ${result.imported || 0} transações importadas\n`);
        } else {
          const error = await syncRes.text();
          console.log(`   ⚠️  Erro ${syncRes.status}: ${error.substring(0, 100)}\n`);
        }
      } catch (error) {
        console.log(`   ⚠️  Erro: ${error.message}\n`);
      }
    }
  } else {
    console.log('   ✅ Todas as transações já estão sincronizadas\n');
  }

  // 5. Verificar webhook
  console.log('5️⃣ Webhook configurado...');
  try {
    const basicAuth = `Basic ${Buffer.from(`${pluggyClientId}:${pluggyClientSecret}`).toString('base64')}`;
    const webhookRes = await fetch('https://api.pluggy.ai/webhooks', {
      headers: {
        'Authorization': basicAuth,
        'Content-Type': 'application/json',
      },
    });

    if (webhookRes.ok) {
      const webhooks = await webhookRes.json();
      const webhookUrl = `${apiUrl}/api/pluggy/webhook`;
      const found = webhooks.results?.find(w => w.url === webhookUrl);
      
      if (found) {
        console.log(`   ✅ Webhook configurado: ${found.url}`);
        console.log(`      Evento: ${found.event || 'N/A'}\n`);
      } else {
        console.log(`   ❌ Webhook NÃO configurado`);
        console.log(`      Configure em: https://dashboard.pluggy.ai → Settings → Webhooks\n`);
      }
    } else {
      console.log(`   ⚠️  Não foi possível verificar (${webhookRes.status})\n`);
    }
  } catch (error) {
    console.log(`   ⚠️  Erro: ${error.message}\n`);
  }

  // Resumo final
  console.log('='.repeat(70));
  console.log('\n📊 RESUMO:\n');
  console.log(`✅ Itens conectados: ${items.length}`);
  console.log(`📊 Transações disponíveis na Pluggy: ${totalTransactionsAvailable}`);
  console.log(`💾 Transações no banco: ${totalTransactionsInDb}`);
  console.log(`🆕 Transações pendentes: ${totalTransactionsAvailable - totalTransactionsInDb}\n`);

  if (totalTransactionsAvailable > 0 && totalTransactionsInDb === 0) {
    console.log('💡 PRÓXIMOS PASSOS:');
    console.log('   1. Execute sincronização manual: npm run pluggy:cron');
    console.log('   2. Ou aguarde o cron job (se configurado)');
    console.log('   3. Ou configure webhook para sincronização automática\n');
  } else if (totalTransactionsAvailable === totalTransactionsInDb && totalTransactionsInDb > 0) {
    console.log('✅ Tudo sincronizado! As transações devem aparecer no menu Financeiro.\n');
  }

  console.log('='.repeat(70));
}

main().catch(console.error);

