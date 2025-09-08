// Teste de conexão com Supabase
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando variáveis de ambiente:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Definida' : '❌ Não definida');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Definida' : '❌ Não definida');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Teste simples de conexão
    const { data, error } = await supabaseAdmin
      .from('accounts_payable')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão:', error);
      return;
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    console.log('📊 Dados de teste:', data);
    
    // Teste de update
    console.log('🔧 Testando update...');
    const testId = '81729d65-d1a5-433a-b38d-d5ca8fe74165';
    
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('accounts_payable')
      .update({ 
        segment_id: 'f5c2e105-4c05-4bbd-947a-575cf8877936',
        updated_at: new Date().toISOString()
      })
      .eq('id', testId)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Erro no update:', updateError);
      return;
    }
    
    console.log('✅ Update funcionando!');
    console.log('📊 Dados atualizados:', updateData);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection();
