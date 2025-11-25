import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import {
  fetchPluggyTransactions,
  inferInstitution,
  mapPluggyTypeToErp,
  mapPluggyTypeToDirection,
  resolveAccountId,
  resolveTransactionBalance,
  sanitizeDescription,
  listPluggyItems,
  listPluggyAccounts,
  type PluggyTransaction
} from '@/lib/pluggyClient';

interface SyncRequestBody {
  itemId?: string; // item_id da Pluggy
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number; // Limite por request (máximo 500)
  segmentId?: string; // UUID do segmento para vincular transações
}

interface AuthContext {
  scope: 'service' | 'user';
  userId?: string;
  userEmail?: string;
}

function parseUserToken(token: string | null): { user_id: string; email?: string } | null {
  if (!token) return null;

  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const payload = JSON.parse(decoded);
    if (payload?.user_id) {
      return {
        user_id: payload.user_id,
        email: payload.email
      };
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Falha ao decodificar X-User-Token:', error);
    return null;
  }
}

async function ensureAuthorization(request: NextRequest): Promise<AuthContext> {
  const serviceToken = process.env.PLUGGY_SYNC_SERVICE_TOKEN;
  const authHeader = request.headers.get('authorization');

  if (serviceToken && authHeader?.startsWith('Bearer ')) {
    const provided = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (provided === serviceToken) {
      return { scope: 'service' };
    }
  }

  const userHeader = request.headers.get('X-User-Token');
  const userToken = parseUserToken(userHeader);

  if (!userToken) {
    throw new Error('Unauthorized');
  }

  return {
    scope: 'user',
    userId: userToken.user_id,
    userEmail: userToken.email
  };
}

async function resolveItemIds(
  requestBody: SyncRequestBody,
  authContext: AuthContext
): Promise<string[]> {
  // Se itemId específico foi fornecido, usar apenas ele
  if (requestBody.itemId) {
    return [requestBody.itemId];
  }

  // Buscar todos os itens conectados do usuário ou do sistema
  const items: string[] = [];

  // ESTRATÉGIA 1: Buscar itens diretamente da API Pluggy (se disponível)
  try {
    console.log('🔍 Tentando buscar itens diretamente da API Pluggy...');
    
    // Tentar buscar itens usando clientUserId se disponível
    if (authContext.userId) {
      const pluggyItemsResponse = await listPluggyItems({
        clientUserId: authContext.userId,
        pageSize: 100
      });
      
      if (pluggyItemsResponse.results && pluggyItemsResponse.results.length > 0) {
        const pluggyItemIds = pluggyItemsResponse.results
          .map(item => item.id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0);
        
        items.push(...pluggyItemIds);
        console.log(`✅ ${pluggyItemIds.length} itens encontrados diretamente na Pluggy (com clientUserId):`, pluggyItemIds);
      }
    }
    
    // Tentar buscar TODOS os itens sem filtro (pode não funcionar por segurança)
    try {
      const allPluggyItemsResponse = await listPluggyItems({
        pageSize: 100
      });
      
      if (allPluggyItemsResponse.results && allPluggyItemsResponse.results.length > 0) {
        const allItemIds = allPluggyItemsResponse.results
          .map(item => item.id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0);
        
        // Adicionar apenas itens que ainda não estão na lista
        for (const itemId of allItemIds) {
          if (!items.includes(itemId)) {
            items.push(itemId);
          }
        }
        console.log(`✅ ${allItemIds.length} itens adicionais encontrados na Pluggy (sem filtro):`, allItemIds);
      }
    } catch (allError) {
      console.log('ℹ️ Não foi possível buscar todos os itens (comportamento esperado - API pode não permitir)');
    }
    
    if (items.length === 0) {
      console.log('ℹ️ Nenhum item encontrado diretamente na API Pluggy (comportamento esperado se a API não permitir)');
    }
  } catch (error) {
    console.warn('⚠️ Erro ao buscar itens diretamente da Pluggy (pode ser comportamento esperado):', error instanceof Error ? error.message : error);
  }

  // ESTRATÉGIA 2: Buscar itens salvos no banco de dados
  if (authContext.userId) {
    console.log(`🔍 Buscando itens Pluggy no banco para usuário: ${authContext.userId}`);
    
    // Primeiro, buscar TODOS os itens (incluindo com erro) para debug
    const { data: allUserItems, error: allError } = await supabaseAdmin
      .from('pluggy_items')
      .select('item_id, status, execution_status, connector_name, user_id')
      .eq('user_id', authContext.userId);
    
    if (allError) {
      console.error('❌ Erro ao buscar todos os itens Pluggy:', allError);
    } else {
      console.log(`📋 Total de itens na tabela para este usuário: ${allUserItems?.length || 0}`);
      if (allUserItems && allUserItems.length > 0) {
        console.log('📋 Todos os itens encontrados no banco:', allUserItems.map(item => ({
          item_id: item.item_id,
          status: item.status,
          execution_status: item.execution_status,
          connector: item.connector_name
        })));
      }
    }
    
    // Agora buscar apenas itens válidos para sincronização
    const { data: userItems, error } = await supabaseAdmin
      .from('pluggy_items')
      .select('item_id, status, execution_status, connector_name')
      .eq('user_id', authContext.userId)
      .not('item_id', 'is', null)
      // Buscar itens que não estão em erro ou inválidos
      .not('status', 'eq', 'INVALID_CREDENTIALS')
      .not('status', 'eq', 'USER_INPUT_TIMEOUT');

    if (error) {
      console.error('❌ Erro ao buscar itens Pluggy válidos:', error);
    } else {
      console.log(`📋 Total de itens válidos encontrados no banco: ${userItems?.length || 0}`);
      
      if (userItems && userItems.length > 0) {
        console.log('📋 Itens válidos encontrados no banco:', userItems.map(item => ({
          item_id: item.item_id,
          status: item.status,
          connector: item.connector_name
        })));
        
        const validItemIds = userItems
          .map(item => item.item_id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0);
        
        // Adicionar apenas itens que ainda não estão na lista
        for (const itemId of validItemIds) {
          if (!items.includes(itemId)) {
            items.push(itemId);
          }
        }
        console.log(`✅ ${validItemIds.length} itens válidos adicionados do banco`);
      } else {
        console.warn('⚠️ Nenhum item Pluggy válido encontrado no banco para o usuário');
      }
    }
  }

  // ESTRATÉGIA 3: Se não encontrou itens, tentar item padrão do sistema
  if (items.length === 0) {
    const defaultConnection = process.env.PLUGGY_DEFAULT_CONNECTION_ID;
    if (defaultConnection) {
      items.push(defaultConnection);
      console.log('📋 Usando item padrão do sistema:', defaultConnection);
    }
  }

  // ESTRATÉGIA 4: SEMPRE tentar buscar itens conhecidos diretamente da Pluggy
  // Estes são IDs que sabemos que existem e devem ser sincronizados
  console.log('🔍 Tentando buscar IDs conhecidos diretamente da Pluggy...');
  
  // IDs conhecidos que devem existir
  const knownItemIds = [
    'f892f7a3-1c7a-4875-b084-e8a376fa730f',
    '67a1f002-5ca8-4f01-97d4-b04fe87aa26a',
    '48c193bc-7276-4b53-9bf9-f91cd6a05fda'
  ];
  
  const { getPluggyItem } = await import('@/lib/pluggyClient');
  
  for (const itemId of knownItemIds) {
    try {
      console.log(`🔍 Verificando item conhecido: ${itemId}`);
      const item = await getPluggyItem(itemId);
      if (item && item.id) {
        // Adicionar apenas se ainda não estiver na lista
        if (!items.includes(item.id)) {
          items.push(item.id);
          console.log(`✅ Item conhecido encontrado e adicionado: ${itemId}`, {
            status: item.status,
            executionStatus: item.executionStatus,
            connector: item.connector?.name
          });
        } else {
          console.log(`ℹ️ Item conhecido ${itemId} já estava na lista`);
        }
      } else {
        console.warn(`⚠️ Item conhecido ${itemId} retornou sem ID válido`);
      }
    } catch (error) {
      console.warn(`⚠️ Item conhecido ${itemId} não encontrado ou erro ao buscar:`, error instanceof Error ? error.message : error);
    }
  }

  // Remover duplicatas
  const uniqueItems = Array.from(new Set(items));
  console.log(`📊 Total de itens únicos encontrados para sincronização: ${uniqueItems.length}`, uniqueItems);

  return uniqueItems;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Iniciando sincronização Pluggy /api/pluggy/sync');

    const authContext = await ensureAuthorization(request);
    const body: SyncRequestBody = await request.json().catch(() => ({}));

    // Buscar todos os itemIds disponíveis
    const itemIds = await resolveItemIds(body, authContext);
    const accountId = body.accountId;

    console.log('📊 Resumo da busca de itens:', {
      totalEncontrados: itemIds.length,
      itemIds: itemIds,
      accountId: accountId || 'não fornecido',
      userId: authContext.userId
    });

    if (itemIds.length === 0 && !accountId) {
      console.warn('⚠️ Nenhum item Pluggy encontrado para sincronização após todas as tentativas');
      console.log('📋 Contexto:', {
        userId: authContext.userId,
        hasDefaultConnection: !!process.env.PLUGGY_DEFAULT_CONNECTION_ID,
        defaultConnection: process.env.PLUGGY_DEFAULT_CONNECTION_ID || 'não configurado'
      });
      
      // Retornar sucesso mas com zero importações (não é um erro crítico)
      return NextResponse.json(
        {
          success: true,
          error: null,
          message: 'Nenhum item Pluggy encontrado. Conecte uma conta bancária primeiro.',
          itemsSincronizados: 0,
          imported: 0,
          updated: 0,
          period: 'N/A',
          itemIdsTentados: itemIds
        },
        { status: 200 } // Mudar para 200 ao invés de 400
      );
    }

    // Sincronizar cada item encontrado
    const syncResults: Array<{
      itemId: string;
      imported: number;
      updated: number;
      total: number;
      period: string;
      error?: string;
    }> = [];

    // Mapear transações para seus respectivos itemIds
    interface TransactionWithItemId extends PluggyTransaction {
      _itemId?: string; // Item ID associado à transação
    }

    let allTransactions: TransactionWithItemId[] = [];
    let globalStartDate = '';
    let globalEndDate = '';

    // Se accountId foi fornecido, sincronizar apenas essa conta
    if (accountId) {
      const { transactions, startDate, endDate } = await fetchPluggyTransactions({
        dateFrom: body.dateFrom,
        dateTo: body.dateTo,
        accountId,
        limit: body.limit || 500
      });

      allTransactions = transactions.map(tx => ({ ...tx, _itemId: undefined }));
      globalStartDate = startDate;
      globalEndDate = endDate;
      syncResults.push({
        itemId: accountId,
        imported: 0, // Será calculado depois
        updated: 0, // Será calculado depois
        total: transactions.length,
        period: `${startDate} a ${endDate}`
      });
    } else {
      // Sincronizar cada item encontrado
      // IMPORTANTE: Para cada item, primeiro buscar as contas, depois buscar transações de cada conta
      for (const itemId of itemIds) {
        try {
          console.log(`🔄 Sincronizando item: ${itemId}`);
          
          // PASSO 1: Buscar todas as contas deste item
          let accounts: Array<{ id: string; name: string | null }> = [];
          try {
            console.log(`🔍 [${itemId}] Buscando contas do item...`);
            const accountsResponse = await listPluggyAccounts(itemId);
            console.log(`📋 [${itemId}] Resposta da API de contas:`, {
              total: accountsResponse.results?.length || 0,
              results: accountsResponse.results
            });
            
            accounts = (accountsResponse.results || []).map(acc => ({
              id: acc.id,
              name: acc.name || null
            }));
            
            console.log(`✅ [${itemId}] Encontradas ${accounts.length} contas:`, accounts.map(a => ({ id: a.id, name: a.name })));
            
            if (accounts.length === 0) {
              console.warn(`⚠️ [${itemId}] Nenhuma conta encontrada para este item`);
            }
          } catch (accountsError) {
            console.error(`❌ [${itemId}] Erro ao buscar contas:`, accountsError);
            console.error(`❌ [${itemId}] Detalhes do erro:`, {
              message: accountsError instanceof Error ? accountsError.message : 'Erro desconhecido',
              stack: accountsError instanceof Error ? accountsError.stack : undefined
            });
            syncResults.push({
              itemId,
              imported: 0,
              updated: 0,
              total: 0,
              period: '',
              error: `Erro ao buscar contas: ${accountsError instanceof Error ? accountsError.message : 'Erro desconhecido'}`
            });
            continue; // Pular para o próximo item
          }

          // Se não encontrou contas, tentar buscar transações sem accountId (pode não funcionar)
          if (accounts.length === 0) {
            console.warn(`⚠️ Nenhuma conta encontrada para o item ${itemId}, tentando buscar transações sem accountId...`);
            try {
              const { transactions, startDate, endDate } = await fetchPluggyTransactions({
                dateFrom: body.dateFrom,
                dateTo: body.dateTo,
                itemId,
                limit: body.limit || 500
              });

              const transactionsWithItemId = transactions.map(tx => ({ ...tx, _itemId: itemId }));
              allTransactions.push(...transactionsWithItemId);
              
              if (!globalStartDate) {
                globalStartDate = startDate;
                globalEndDate = endDate;
              }

              syncResults.push({
                itemId,
                imported: 0,
                updated: 0,
                total: transactions.length,
                period: `${startDate} a ${endDate}`
              });
            } catch (error) {
              console.error(`❌ Erro ao buscar transações do item ${itemId} sem accountId:`, error);
              syncResults.push({
                itemId,
                imported: 0,
                updated: 0,
                total: 0,
                period: '',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
              });
            }
            continue;
          }

          // PASSO 2: Para cada conta, buscar transações
          let itemTotalTransactions = 0;
          let itemStartDate = '';
          let itemEndDate = '';

          for (const account of accounts) {
            try {
              console.log(`  🔄 [${itemId}] Buscando transações da conta ${account.id} (${account.name || 'sem nome'})`);
              console.log(`  📅 [${itemId}] Período: ${body.dateFrom || 'últimos 30 dias'} até ${body.dateTo || 'hoje'}`);
              
              const { transactions, startDate, endDate } = await fetchPluggyTransactions({
                dateFrom: body.dateFrom,
                dateTo: body.dateTo,
                itemId,
                accountId: account.id,
                limit: body.limit || 500
              });

              console.log(`  ✅ [${itemId}] Transações obtidas da conta ${account.id}:`, {
                total: transactions.length,
                startDate,
                endDate,
                primeiraTransacao: transactions[0] || null
              });

              // Marcar cada transação com o itemId correspondente
              const transactionsWithItemId = transactions.map(tx => ({ ...tx, _itemId: itemId }));
              allTransactions.push(...transactionsWithItemId);
              itemTotalTransactions += transactions.length;
              
              if (!itemStartDate) {
                itemStartDate = startDate;
                itemEndDate = endDate;
              }
            } catch (accountError) {
              console.error(`  ❌ [${itemId}] Erro ao buscar transações da conta ${account.id}:`, accountError);
              console.error(`  ❌ [${itemId}] Detalhes do erro:`, {
                message: accountError instanceof Error ? accountError.message : 'Erro desconhecido',
                stack: accountError instanceof Error ? accountError.stack : undefined
              });
              // Continuar com as outras contas mesmo se uma falhar
            }
          }
          
          console.log(`📊 [${itemId}] Resumo: ${itemTotalTransactions} transações encontradas de ${accounts.length} contas`);

          if (!globalStartDate && itemStartDate) {
            globalStartDate = itemStartDate;
            globalEndDate = itemEndDate;
          }

          syncResults.push({
            itemId,
            imported: 0, // Será calculado depois
            updated: 0, // Será calculado depois
            total: itemTotalTransactions,
            period: itemStartDate ? `${itemStartDate} a ${itemEndDate}` : ''
          });
        } catch (error) {
          console.error(`❌ Erro ao sincronizar item ${itemId}:`, error);
          syncResults.push({
            itemId,
            imported: 0,
            updated: 0,
            total: 0,
            period: '',
            error: error instanceof Error ? error.message : 'Erro desconhecido'
          });
        }
      }
    }

    console.log('📦 Total de transações obtidas da Pluggy:', {
      total: allTransactions.length,
      itemsSincronizados: itemIds.length || (accountId ? 1 : 0)
    });

    if (!allTransactions.length) {
      return NextResponse.json({
        success: true,
        imported: 0,
        updated: 0,
        period: syncResults[0]?.period || 'N/A',
        message: 'Nenhuma transação encontrada nos itens conectados.',
        syncResults
      });
    }

    const transactions = allTransactions;
    const startDate = globalStartDate || syncResults[0]?.period.split(' a ')[0] || '';
    const endDate = globalEndDate || syncResults[0]?.period.split(' a ')[1] || '';

    // Verificar duplicatas usando pluggy_id (ou external_id como fallback)
    const pluggyIds = transactions.map((t) => t.id).filter(Boolean);

    const { data: existingRows, error: existingError } = await supabaseAdmin
      .from('financial_transactions')
      .select('pluggy_id, external_id')
      .in('pluggy_id', pluggyIds);

    // Se não encontrar por pluggy_id, tentar por external_id (compatibilidade)
    let existingSet: Set<string>;
    if (existingRows && existingRows.length > 0) {
      existingSet = new Set(
        existingRows
          .map((row) => row.pluggy_id || row.external_id)
          .filter(Boolean)
      );
    } else {
      // Fallback: verificar por external_id
      const { data: existingByExternalId } = await supabaseAdmin
        .from('financial_transactions')
        .select('external_id')
        .in('external_id', pluggyIds);
      existingSet = new Set((existingByExternalId || []).map((row) => row.external_id).filter(Boolean));
    }

    if (existingError && existingError.code !== 'PGRST116') {
      // PGRST116 = nenhum resultado encontrado (não é erro crítico)
      console.error('❌ Erro ao verificar transações existentes:', existingError);
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao verificar transações já importadas.',
          details: existingError.message
        },
        { status: 500 }
      );
    }

    // Resolver segment_id (do body ou do usuário)
    let segmentId: string | null = null;
    if (body.segmentId) {
      segmentId = body.segmentId;
    } else if (authContext.userId) {
      // Buscar segment_id do usuário
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('segment_id')
        .eq('id', authContext.userId)
        .single();
      segmentId = userData?.segment_id || null;
    }

    // Mapear transações para o formato do banco
    // IMPORTANTE: Filtrar transações sem ID válido (não podem ser sincronizadas)
    const validTransactions = transactions.filter(
      (t) => t.id && typeof t.id === 'string' && t.id.trim().length > 0
    );
    
    const records = validTransactions.map((transaction: TransactionWithItemId) => {
      const account = resolveAccountId(transaction);
      const type = mapPluggyTypeToErp(transaction.type, transaction.amount);
      const direction = mapPluggyTypeToDirection(transaction.type, transaction.amount);
      const balance = resolveTransactionBalance(transaction);
      
      // Determinar item_id: usar o _itemId marcado ou tentar encontrar pelo accountId
      let itemIdForRecord: string | null = null;
      if (transaction._itemId) {
        itemIdForRecord = transaction._itemId;
      } else if (itemIds.length === 1) {
        itemIdForRecord = itemIds[0];
      } else if (accountId) {
        // Se accountId foi fornecido, tentar encontrar o item correspondente
        itemIdForRecord = itemIds.find(id => id === accountId) || null;
      }

      return {
        // IDs e referências
        pluggy_id: transaction.id, // ID único da Pluggy (evita duplicatas)
        external_id: transaction.id, // Mantido para compatibilidade
        item_id: itemIdForRecord, // ID do item (conexão) da Pluggy
        account_id: account, // ID da conta na Pluggy
        
        // Dados da transação
        date: transaction.date,
        description: sanitizeDescription(transaction.description),
        amount: Number(transaction.amount.toFixed(2)),
        type, // 'receita' ou 'despesa' (compatibilidade)
        direction, // 'receivable' ou 'payable' (novo campo)
        category: transaction.category || transaction.subcategory || null,
        status: transaction.status || 'POSTED',
        institution: inferInstitution(transaction),
        balance: balance != null ? Number(balance.toFixed(2)) : null,
        
        // Vinculações
        segment_id: segmentId,
        
        // Dados brutos (JSONB)
        raw: transaction as unknown as Record<string, unknown>
      };
    });

    const newRecords = records.filter((record) => !existingSet.has(record.pluggy_id));
    const upsertPayload = records;

    // Upsert usando pluggy_id como chave única
    // O Supabase usa o índice único automaticamente
    const { error: upsertError } = await supabaseAdmin
      .from('financial_transactions')
      .upsert(upsertPayload, { 
        onConflict: 'pluggy_id' // Usa o índice único idx_financial_transactions_pluggy_id
      });

    if (upsertError) {
      console.error('❌ Erro ao inserir transações financeiras:', upsertError);
      return NextResponse.json(
        {
          success: false,
          error: 'Falha ao salvar transações no banco.',
          details: upsertError.message
        },
        { status: 500 }
      );
    }

    const importedCount = newRecords.length;
    const updatedCount = records.length - importedCount;

    // Atualizar last_sync_at de todos os itens sincronizados
    const updatePromises = itemIds.map(itemId =>
      supabaseAdmin
        .from('pluggy_items')
        .update({ 
          last_sync_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('item_id', itemId)
        .then(({ error }) => {
          if (error) {
            console.warn(`⚠️ Erro ao atualizar last_sync_at do item ${itemId}:`, error);
          }
        })
    );

    await Promise.all(updatePromises);

    // Atualizar resultados com contagens reais (distribuir proporcionalmente)
    // Como todas as transações foram processadas juntas, vamos distribuir igualmente
    const itemsCount = itemIds.length || (accountId ? 1 : 0);
    const importedPerItem = itemsCount > 0 ? Math.floor(importedCount / itemsCount) : 0;
    const updatedPerItem = itemsCount > 0 ? Math.floor(updatedCount / itemsCount) : 0;
    
    const finalSyncResults = syncResults.map((result, index) => ({
      ...result,
      imported: index === syncResults.length - 1 
        ? importedCount - (importedPerItem * (syncResults.length - 1)) // Último item recebe o resto
        : importedPerItem,
      updated: index === syncResults.length - 1
        ? updatedCount - (updatedPerItem * (syncResults.length - 1)) // Último item recebe o resto
        : updatedPerItem
    }));

    console.log('✅ Sincronização Pluggy concluída:', {
      total: records.length,
      imported: importedCount,
      updated: updatedCount,
      period: `${startDate} a ${endDate}`,
      scope: authContext.scope,
      userId: authContext.userId,
      itemsSincronizados: itemIds.length || (accountId ? 1 : 0),
      syncResults: finalSyncResults
    });

    return NextResponse.json({
      success: true,
      imported: importedCount,
      updated: updatedCount,
      period: `${startDate} a ${endDate}`,
      itemsSincronizados: itemIds.length || (accountId ? 1 : 0),
      syncResults: finalSyncResults
    });
  } catch (error) {
    console.error('❌ Erro na sincronização Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido durante sincronização'
      },
      { status: error instanceof Error && error.message === 'Unauthorized' ? 401 : 500 }
    );
  }
}

