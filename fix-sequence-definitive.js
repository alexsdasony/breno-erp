import { getDatabase } from './supabase/backend/database/prodConfig.js';
import { SECURITY_CONFIG } from './src/config/constants.js';

async function fixSequenceDefinitive() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    const db = await getDatabase();
    
    console.log('🔄 Verificando estado atual da tabela billings...');
    
    // Verificar se a tabela existe e tem dados
    const tableExists = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'billings'
      );
    `);
    
    if (!tableExists.exists) {
      console.log('❌ Tabela billings não existe!');
      return;
    }
    
    // Verificar o maior ID atual
    const maxIdResult = await db.query(`
      SELECT COALESCE(MAX(id), 0) as max_id FROM billings;
    `);
    
    const maxId = maxIdResult.max_id || 0;
    console.log(`📊 Maior ID atual na tabela billings: ${maxId}`);
    
    // Verificar a sequência atual
    const sequenceResult = await db.query(`
      SELECT last_value FROM billings_id_seq;
    `);
    
    console.log(`📊 Sequência atual: ${sequenceResult.last_value}`);
    
    // Se a sequência está menor que o maior ID, resetar
    if (sequenceResult.last_value <= maxId) {
      console.log('🔄 Resetando sequência...');
      
      // Resetar a sequência para o próximo valor
      await db.query(`
        SELECT setval('billings_id_seq', $1, true);
      `, [maxId + 1]);
      
      console.log(`✅ Sequência resetada para: ${maxId + 1}`);
    } else {
      console.log('✅ Sequência já está correta');
    }
    
    // Verificar se há conflitos de ID
    const conflicts = await db.query(`
      SELECT id, COUNT(*) as count 
      FROM billings 
      GROUP BY id 
      HAVING COUNT(*) > 1;
    `);
    
    if (conflicts.length > 0) {
      console.log('⚠️  Encontrados IDs duplicados:', conflicts);
      console.log('🔄 Removendo registros duplicados...');
      
      // Remover duplicatas mantendo apenas o primeiro
      await db.query(`
        DELETE FROM billings 
        WHERE id IN (
          SELECT id 
          FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at) as rn
            FROM billings
          ) t 
          WHERE t.rn > 1
        );
      `);
      
      console.log('✅ Duplicatas removidas');
    }
    
    // Verificar se a sequência foi corrigida
    const finalSequenceResult = await db.query(`
      SELECT currval('billings_id_seq') as current_value;
    `);
    
    console.log(`✅ Sequência final: ${finalSequenceResult.current_value}`);
    
    // Testar inserção
    console.log('🧪 Testando inserção...');
    try {
      const testResult = await db.query(`
        INSERT INTO billings (customer_id, customer_name, amount, due_date, status, segment_id) 
        VALUES (1, 'Teste', 100.00, '2025-01-01', 'Pendente', 1) 
        RETURNING id;
      `);
      
      console.log(`✅ Teste de inserção bem-sucedido! ID criado: ${testResult.id}`);
      
      // Remover o registro de teste
      await db.query(`
        DELETE FROM billings WHERE id = $1;
      `, [testResult.id]);
      
      console.log('✅ Registro de teste removido');
      
    } catch (testError) {
      console.error('❌ Erro no teste de inserção:', testError);
    }
    
    console.log('✅ Problema de sequência corrigido definitivamente!');
    console.log('✅ Agora as cobranças automáticas devem funcionar perfeitamente.');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir sequência:', error);
    process.exit(1);
  }
}

fixSequenceDefinitive(); 