#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Configuração do Supabase - Hardcoded
const supabaseUrl = 'https://qerubjitetqwfqqydhzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

const supabase = createClient(supabaseUrl, supabaseKey);

// Ler o JSON original
const originalDataPath = path.join(process.cwd(), '..', '..', 'DEPRECATED-seed-data.json');
const originalData = JSON.parse(fs.readFileSync(originalDataPath, 'utf8'));

// Função para converter dados para formato Supabase
function convertToSupabaseFormat(data, tableName) {
  const converted = [];
  
  data.forEach((item, index) => {
    const newItem = { ...item };
    
    // Gerar UUID para ID
    newItem.id = uuidv4();
    
    // Remover campos que não existem no schema atual
    if (tableName === 'customers') {
      // Mapear campos para o schema atual
      newItem.last_purchase_date = newItem.lastPurchaseDate;
      delete newItem.lastPurchaseDate;
      delete newItem.totalPurchases; // Não existe no schema atual
    } else if (tableName === 'products') {
      // Mapear campos para o schema atual
      newItem.stock_quantity = newItem.stock;
      newItem.minimum_stock = newItem.minStock || newItem.min_stock;
      delete newItem.stock;
      delete newItem.min_stock;
      delete newItem.minStock;
      
      // Adicionar campos extras do schema atual
      newItem.code = `PROD${String(index + 1).padStart(3, '0')}`;
      newItem.description = `${newItem.name} - Produto de qualidade`;
      newItem.cost_price = Math.round(newItem.price * 0.7 * 100) / 100; // 70% do preço de venda
      newItem.supplier = `Fornecedor ${String.fromCharCode(65 + (index % 5))}`; // A, B, C, D, E
    } else if (tableName === 'sales') {
      // Mapear campos para o schema atual
      newItem.sale_date = newItem.date;
      newItem.total_amount = newItem.total;
      newItem.total = newItem.total_amount; // Campo obrigatório no schema
      newItem.date = newItem.sale_date; // Campo obrigatório no schema
      delete newItem.customerId; // Não existe no schema atual
      delete newItem.customerName; // Não existe no schema atual
      
      // Adicionar campos extras do schema atual
      newItem.payment_method = ['cash', 'credit_card', 'pix', 'bank_transfer'][index % 4];
      newItem.notes = `Venda ${newItem.status.toLowerCase()}`;
    } else if (tableName === 'transactions') {
      // Mapear campos para o schema atual
      newItem.cost_center = newItem.costCenter;
      delete newItem.costCenter;
    } else if (tableName === 'billings') {
      // Mapear campos para o schema atual
      newItem.due_date = newItem.dueDate || newItem.date;
      newItem.payment_date = newItem.paymentDate;
      delete newItem.dueDate;
      delete newItem.date;
      delete newItem.paymentDate;
      delete newItem.customerId; // Não existe no schema atual
      delete newItem.customerName; // Não existe no schema atual
    } else if (tableName === 'accounts_payable') {
      // Mapear campos para o schema atual
      newItem.due_date = newItem.dueDate || newItem.date;
      delete newItem.dueDate;
      delete newItem.date;
    } else if (tableName === 'nfe_list') {
      // Mapear campos para o schema atual
      newItem.number = newItem.number || `NFE${String(index + 1).padStart(6, '0')}`;
      delete newItem.customerName; // Não existe no schema atual
    }
    
    converted.push(newItem);
  });
  
  return converted;
}

// Função para inserir dados
async function insertData(tableName, data) {
  console.log(`📝 Inserindo dados na tabela: ${tableName} (${data.length} registros)`);
  
  try {
    // Inserir em lotes de 50 para evitar timeout
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      
      // Adicionar delay entre lotes para evitar rate limiting
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Erro ao inserir lote ${Math.floor(i/batchSize) + 1} em ${tableName}:`, error);
        return false;
      }

      inserted += result.length;
      console.log(`  ✅ Lote ${Math.floor(i/batchSize) + 1}: ${result.length} registros inseridos`);
    }

    console.log(`✅ Total: ${inserted} registros inseridos em ${tableName}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao inserir dados em ${tableName}:`, error);
    return false;
  }
}

// Dados básicos que precisam ser inseridos primeiro
const basicData = {
  segments: [
    { id: uuidv4(), name: 'Segmento Principal', description: 'Segmento padrão do sistema' },
    { id: uuidv4(), name: 'Segmento Secundário', description: 'Segmento adicional para testes' }
  ],
  cost_centers: [
    { id: uuidv4(), name: 'Administrativo' },
    { id: uuidv4(), name: 'Vendas' },
    { id: uuidv4(), name: 'Marketing' },
    { id: uuidv4(), name: 'Estoque' },
    { id: uuidv4(), name: 'Operacional' }
  ],
  integrations: [
    {
      id: uuidv4(),
      service_name: 'ChatPro',
      api_key: 'chatpro_api_key_123',
      enabled: true,
      config: { webhook_url: 'https://webhook.chatpro.com/erp', notifications_enabled: true }
    },
    {
      id: uuidv4(),
      service_name: 'WhatsApp Business',
      api_key: 'whatsapp_api_key_456',
      enabled: false,
      config: { phone_number: '+5511999999999', webhook_url: 'https://webhook.whatsapp.com/erp' }
    }
  ]
};

// Função principal
async function runFullSeed() {
  console.log('🚀 Iniciando seed completo do banco de dados...');
  console.log(`📊 Dados originais encontrados:`);
  console.log(`  - Customers: ${originalData.customers.length}`);
  console.log(`  - Products: ${originalData.products.length}`);
  console.log(`  - Sales: ${originalData.sales.length}`);
  console.log(`  - Transactions: ${originalData.transactions.length}`);
  console.log(`  - Billings: ${originalData.billings.length}`);
  console.log(`  - Accounts Payable: ${originalData.accountsPayable.length}`);
  console.log(`  - NFE List: ${originalData.nfeList.length}`);
  
  try {
    // 1. Inserir dados básicos primeiro
    console.log('\n📋 Inserindo dados básicos...');
    for (const [table, data] of Object.entries(basicData)) {
      const success = await insertData(table, data);
      if (!success) {
        console.error(`❌ Falha ao inserir dados básicos em ${table}`);
        return;
      }
    }
    
    // 2. Converter e inserir dados do JSON original
    console.log('\n🔄 Convertendo e inserindo dados originais...');
    
    const tables = [
      { name: 'customers', data: originalData.customers },
      { name: 'products', data: originalData.products },
      { name: 'sales', data: originalData.sales },
      { name: 'transactions', data: originalData.transactions },
      { name: 'billings', data: originalData.billings },
      { name: 'accounts_payable', data: originalData.accountsPayable },
      { name: 'nfe_list', data: originalData.nfeList }
    ];
    
    for (const table of tables) {
      console.log(`\n🔄 Processando ${table.name}...`);
      const convertedData = convertToSupabaseFormat(table.data, table.name);
      const success = await insertData(table.name, convertedData);
      
      if (!success) {
        console.error(`❌ Falha ao inserir dados em ${table.name}`);
        return;
      }
    }
    
    console.log('\n🎉 Seed completo concluído com sucesso!');
    console.log('📊 Resumo final:');
    console.log(`  - Segments: ${basicData.segments.length}`);
    console.log(`  - Cost Centers: ${basicData.cost_centers.length}`);
    console.log(`  - Customers: ${originalData.customers.length}`);
    console.log(`  - Products: ${originalData.products.length}`);
    console.log(`  - Sales: ${originalData.sales.length}`);
    console.log(`  - Transactions: ${originalData.transactions.length}`);
    console.log(`  - Billings: ${originalData.billings.length}`);
    console.log(`  - Accounts Payable: ${originalData.accountsPayable.length}`);
    console.log(`  - NFE List: ${originalData.nfeList.length}`);
    console.log(`  - Integrations: ${basicData.integrations.length}`);
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runFullSeed();
}

export { runFullSeed }; 