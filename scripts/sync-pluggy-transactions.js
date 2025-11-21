import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const pluggyClientId = process.env.PLUGGY_CLIENT_ID;
const pluggyClientSecret = process.env.PLUGGY_CLIENT_SECRET;

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

async function fetchAccounts(apiKey, itemId) {
  const res = await fetch(`https://api.pluggy.ai/accounts?itemId=${itemId}`, {
    headers: { 'x-api-key': apiKey },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to fetch accounts: ${res.status} - ${error}`);
  }

  const data = await res.json();
  return data.results || [];
}

async function fetchAllTransactions(apiKey, itemId, accountId, dateFrom, dateTo) {
  const allTransactions = [];
  let nextPageUrl = null;

  do {
    const url = nextPageUrl 
      ? new URL(nextPageUrl)
      : new URL('https://api.pluggy.ai/transactions');
    
    if (!nextPageUrl) {
      url.searchParams.set('itemId', itemId);
      url.searchParams.set('accountId', accountId);
      url.searchParams.set('from', dateFrom);
      url.searchParams.set('to', dateTo);
      url.searchParams.set('pageSize', '500');
    }

    const res = await fetch(url.toString(), {
      headers: { 'x-api-key': apiKey },
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to fetch transactions: ${res.status} - ${error}`);
    }

    const data = await res.json();
    const transactions = data.results || [];
    allTransactions.push(...transactions);

    nextPageUrl = data.next;

    if (transactions.length === 0) break;
  } while (nextPageUrl);

  return allTransactions;
}

function mapPluggyTypeToDirection(type, amount) {
  if (type) {
    const normalized = type.toLowerCase();
    if (['credit', 'income', 'inflow', 'entrada', 'receita', 'deposit', 'receipt'].includes(normalized)) {
      return 'receivable';
    }
    if (['debit', 'expense', 'outflow', 'saida', 'despesa', 'withdrawal', 'payment'].includes(normalized)) {
      return 'payable';
    }
  }
  return amount >= 0 ? 'receivable' : 'payable';
}

function mapPluggyTypeToErp(type, amount) {
  if (type) {
    const normalized = type.toLowerCase();
    if (['credit', 'income', 'inflow', 'entrada', 'receita', 'deposit'].includes(normalized)) {
      return 'receita';
    }
    if (['debit', 'expense', 'outflow', 'saida', 'despesa', 'withdrawal', 'payment'].includes(normalized)) {
      return 'despesa';
    }
  }
  return amount >= 0 ? 'receita' : 'despesa';
}

async function main() {
  console.log('🔄 Sincronizando transações Pluggy...\n');
  console.log('='.repeat(70));

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

  // Buscar itens
  const { data: items } = await supabase
    .from('pluggy_items')
    .select('*')
    .order('created_at', { ascending: false });

  if (!items || items.length === 0) {
    console.error('❌ Nenhum item encontrado no banco\n');
    return;
  }

  console.log(`📋 Encontrados ${items.length} item(s)\n`);

  // Período: últimos 90 dias
  const dateTo = new Date().toISOString().split('T')[0];
  const dateFrom = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  console.log(`📅 Período: ${dateFrom} até ${dateTo}\n`);

  let totalImported = 0;
  let totalSkipped = 0;

  for (const item of items) {
    try {
      console.log(`📌 Processando: ${item.connector_name || item.item_id}`);

      // Buscar contas do item
      const accounts = await fetchAccounts(apiKey, item.item_id);
      console.log(`   Contas encontradas: ${accounts.length}`);

      if (accounts.length === 0) {
        console.log('   ⏭️  Nenhuma conta encontrada\n');
        continue;
      }

      // Buscar transações de cada conta
      const allTransactions = [];
      for (const account of accounts) {
        try {
          const accountTransactions = await fetchAllTransactions(
            apiKey, 
            item.item_id, 
            account.id, 
            dateFrom, 
            dateTo
          );
          console.log(`      Conta ${account.name || account.type}: ${accountTransactions.length} transações`);
          allTransactions.push(...accountTransactions);
        } catch (error) {
          console.log(`      ⚠️  Erro ao buscar transações da conta ${account.id}: ${error.message}`);
        }
      }

      const transactions = allTransactions;
      console.log(`   Total de transações: ${transactions.length}`);

      if (transactions.length === 0) {
        console.log('   ⏭️  Nenhuma transação para processar\n');
        continue;
      }

      // Verificar duplicatas
      const pluggyIds = transactions
        .map(t => t.id)
        .filter(id => id && typeof id === 'string' && id.trim().length > 0);

      if (pluggyIds.length === 0) {
        console.log('   ⚠️  Nenhuma transação com ID válido\n');
        continue;
      }

      // Buscar transações existentes em lotes (PostgreSQL tem limite de 1000 valores no IN)
      const existingSet = new Set();
      const batchSize = 1000;
      
      for (let i = 0; i < pluggyIds.length; i += batchSize) {
        const batch = pluggyIds.slice(i, i + batchSize);
        const { data: existing } = await supabase
          .from('financial_transactions')
          .select('pluggy_id')
          .in('pluggy_id', batch);
        
        (existing || []).forEach(row => {
          if (row.pluggy_id) existingSet.add(row.pluggy_id);
        });
      }

      // Preparar registros para inserção (apenas novas)
      const records = transactions
        .filter(t => t.id && typeof t.id === 'string' && t.id.trim().length > 0)
        .filter(t => !existingSet.has(t.id))
        .map(tx => {
          const type = mapPluggyTypeToErp(tx.type, tx.amount);
          const direction = mapPluggyTypeToDirection(tx.type, tx.amount);

          return {
            pluggy_id: tx.id,
            external_id: tx.id,
            item_id: item.item_id,
            account_id: tx.accountId || 'unknown',
            date: tx.date,
            description: tx.description?.trim().replace(/\s+/g, ' ') || null,
            amount: Number(tx.amount.toFixed(2)),
            type,
            direction,
            category: tx.category || tx.subcategory || null,
            status: tx.status || 'POSTED',
            institution: tx.metadata?.institution || null,
            balance: tx.balance != null ? Number(tx.balance.toFixed(2)) : null,
            segment_id: item.segment_id || null,
            raw: tx,
          };
        });

      const toSkip = transactions.length - records.length;
      totalSkipped += toSkip;

      if (records.length === 0) {
        console.log(`   ✅ Todas as ${transactions.length} transações já estão sincronizadas\n`);
        continue;
      }

      console.log(`   💾 Salvando ${records.length} transação(ões)...`);

      // Inserir em lotes de 100
      const batchSize = 100;
      let imported = 0;

      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        
        // Usar insert com verificação manual de duplicatas
        // porque o índice único pode ter WHERE pluggy_id IS NOT NULL
        const { error } = await supabase
          .from('financial_transactions')
          .insert(batch);

        if (error) {
          console.error(`   ❌ Erro ao salvar lote: ${error.message}`);
        } else {
          imported += batch.length;
        }
      }

      totalImported += imported;
      console.log(`   ✅ ${imported} transação(ões) importada(s)`);
      if (toSkip > 0) {
        console.log(`   ⏭️  ${toSkip} já existiam`);
      }
      console.log('');

      // Atualizar last_sync_at
      await supabase
        .from('pluggy_items')
        .update({ 
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('item_id', item.item_id);

    } catch (error) {
      console.error(`   ❌ Erro: ${error.message}\n`);
    }
  }

  console.log('='.repeat(70));
  console.log(`\n📊 RESULTADO:`);
  console.log(`   ✅ Importadas: ${totalImported}`);
  console.log(`   ⏭️  Já existiam: ${totalSkipped}`);
  console.log(`   📊 Total processado: ${totalImported + totalSkipped}\n`);

  if (totalImported > 0) {
    console.log('✅ Transações sincronizadas! Verifique no menu Financeiro.\n');
  }
}

main().catch(console.error);

