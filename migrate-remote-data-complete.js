import fetch from 'node-fetch';
import { Pool } from 'pg';

// Configuração do Supabase remoto
const SUPABASE_URL = 'https://qerubjitetqwfqqydhzv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc';

// Configuração do PostgreSQL local
const localPool = new Pool({
  connectionString: 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

async function fetchFromSupabase(table) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
      headers: {
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'apikey': SUPABASE_KEY
      }
    });

    if (!response.ok) {
      console.log(`⚠️ Tabela ${table} não encontrada ou vazia`);
      return [];
    }

    const data = await response.json();
    console.log(`📊 ${table}: ${data.length} registros encontrados`);
    return data;
  } catch (error) {
    console.error(`❌ Erro ao buscar ${table}:`, error.message);
    return [];
  }
}

// Mapeamento de colunas para compatibilidade
const columnMappings = {
  products: {
    stock: 'stock_quantity',
    min_stock: 'min_stock',
    cost_price: 'cost'
  },
  transactions: {
    cost_center: 'cost_center_id'
  },
  sales: {
    customer_name: 'customer_id'
  },
  billings: {
    customer_name: 'customer_id'
  },
  integrations: {
    service_name: 'name'
  }
};

function mapRecord(table, record) {
  const mapping = columnMappings[table] || {};
  const mappedRecord = { ...record };
  
  // Aplicar mapeamentos
  Object.entries(mapping).forEach(([oldKey, newKey]) => {
    if (mappedRecord[oldKey] !== undefined) {
      mappedRecord[newKey] = mappedRecord[oldKey];
      delete mappedRecord[oldKey];
    }
  });
  
  return mappedRecord;
}

async function insertIntoLocal(table, data) {
  if (data.length === 0) {
    console.log(`⏭️ Pulando ${table} - sem dados`);
    return;
  }

  const client = await localPool.connect();
  try {
    // Limpar tabela local primeiro
    await client.query(`DELETE FROM ${table}`);
    console.log(`🧹 Tabela ${table} limpa`);

    // Inserir dados com mapeamento
    for (const record of data) {
      const mappedRecord = mapRecord(table, record);
      const columns = Object.keys(mappedRecord).join(', ');
      const values = Object.values(mappedRecord);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
      await client.query(query, values);
    }

    console.log(`✅ ${table}: ${data.length} registros inseridos`);
  } catch (error) {
    console.error(`❌ Erro ao inserir em ${table}:`, error.message);
  } finally {
    client.release();
  }
}

async function migrateData() {
  console.log('🚀 Iniciando migração completa de dados do Supabase para PostgreSQL local...\n');

  const tables = [
    'products', 
    'transactions',
    'sales',
    'billings',
    'cost_centers',
    'integrations'
  ];

  for (const table of tables) {
    console.log(`\n📋 Migrando ${table}...`);
    const data = await fetchFromSupabase(table);
    await insertIntoLocal(table, data);
  }

  console.log('\n🎉 Migração completa concluída!');
  await localPool.end();
}

migrateData().catch(console.error);
