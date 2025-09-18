import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPaymentMethods() {
  try {
    console.log('🔍 Verificando dados na tabela payment_methods...');
    
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar payment_methods:', error);
      return;
    }
    
    console.log('📊 Dados encontrados:', data?.length || 0);
    console.log('📋 Payment methods:', data);
    
    // Verificar se há dados na tabela financial_documents
    console.log('\n🔍 Verificando dados na tabela financial_documents...');
    
    const { data: financialData, error: financialError } = await supabase
      .from('financial_documents')
      .select('id, payment_method_id, payment_method_data:payment_methods(name, id)')
      .eq('direction', 'payable')
      .limit(5);
    
    if (financialError) {
      console.error('❌ Erro ao buscar financial_documents:', financialError);
      return;
    }
    
    console.log('📊 Financial documents encontrados:', financialData?.length || 0);
    console.log('📋 Financial documents:', financialData);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkPaymentMethods();
