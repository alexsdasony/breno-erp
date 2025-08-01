import { getDatabase } from './supabase/backend/database/prodConfig.js';

async function fixBillingsSequence() {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    const db = await getDatabase();
    
    console.log('🔄 Verificando sequência atual da tabela billings...');
    
    // Verificar o maior ID atual
    const maxIdResult = await db.query(`
      SELECT COALESCE(MAX(id), 0) as max_id FROM billings;
    `);
    
    const maxId = maxIdResult.max_id || 0;
    console.log(`📊 Maior ID atual na tabela billings: ${maxId}`);
    
    // Resetar a sequência para o próximo valor
    await db.query(`
      SELECT setval('billings_id_seq', $1, true);
    `, [maxId + 1]);
    
    console.log(`✅ Sequência resetada para: ${maxId + 1}`);
    
    // Verificar se a sequência foi corrigida
    const sequenceResult = await db.query(`
      SELECT currval('billings_id_seq') as current_value;
    `);
    
    console.log(`✅ Sequência atual: ${sequenceResult.current_value}`);
    
    console.log('✅ Problema de sequência corrigido com sucesso!');
    console.log('✅ Agora as cobranças automáticas devem funcionar corretamente.');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir sequência:', error);
    process.exit(1);
  }
}

fixBillingsSequence(); 