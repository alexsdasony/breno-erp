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
    min_stock: 'minimum_stock',
    cost_price: 'cost'
  },
  transactions: {
    cost_center: 'cost_center_id'
  },
  sales: {
    customer_name: 'customer_id',
    total_amount: 'total'
  },
  billings: {
    customer_name: 'customer_id'
  },
  integrations: {
    service_name: 'name'
  }
};

// Função para gerar UUID válido ou usar null
function generateValidUUID(value) {
  if (!value || value === 'null' || value === 'undefined') {
    return null;
  }
  
  // Se já é um UUID válido, retorna como está
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(value)) {
    return value;
  }
  
  // Se não é UUID válido, retorna null
  return null;
}

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
  
  // Tratar campos UUID específicos
  if (table === 'transactions' && mappedRecord.cost_center_id) {
    mappedRecord.cost_center_id = generateValidUUID(mappedRecord.cost_center_id);
  }
  
  if (table === 'billings' && mappedRecord.customer_id) {
    mappedRecord.customer_id = generateValidUUID(mappedRecord.customer_id);
  }
  
  if (table === 'sales' && mappedRecord.customer_id) {
    mappedRecord.customer_id = generateValidUUID(mappedRecord.customer_id);
  }
  
  // Tratar campos obrigatórios
  if (table === 'integrations' && !mappedRecord.type) {
    mappedRecord.type = 'api';
  }
  
  // Tratar billing_date
  if (table === 'billings' && !mappedRecord.billing_date) {
    mappedRecord.billing_date = new Date().toISOString().split('T')[0];
  }
  
  return mappedRecord;
}

async function insertIntoLocal(table, data) {
  if (data.length === 0) {
    console.log(`⏭️ Pulando ${table} - sem dados`);
    return;
  }

  const client = await localPool.connect();
  try {
    // Para integrations, não limpar (evitar constraint unique)
    if (table !== 'integrations') {
      await client.query(`DELETE FROM ${table}`);
      console.log(`🧹 Tabela ${table} limpa`);
    } else {
      console.log(`⚠️ Pulando limpeza de ${table} (constraint unique)`);
    }

    // Inserir dados com mapeamento
    let insertedCount = 0;
    for (const record of data) {
      try {
        const mappedRecord = mapRecord(table, record);
        const columns = Object.keys(mappedRecord).join(', ');
        const values = Object.values(mappedRecord);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        await client.query(query, values);
        insertedCount++;
      } catch (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          console.log(`⚠️ Registro duplicado em ${table}, pulando...`);
        } else {
          console.error(`❌ Erro ao inserir registro em ${table}:`, insertError.message);
        }
      }
    }

    console.log(`✅ ${table}: ${insertedCount} registros inseridos`);
  } catch (error) {
    console.error(`❌ Erro ao inserir em ${table}:`, error.message);
  } finally {
    client.release();
  }
}

async function migrateData() {
  console.log('🚀 Iniciando migração ULTIMATE de dados do Supabase para PostgreSQL local...\n');

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

  console.log('\n🎉 Migração ULTIMATE concluída!');
  await localPool.end();
}

migrateData().catch(console.error);
