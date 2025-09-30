import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migratePaymentMethods() {
  try {
    console.log('🔧 Executando migração para adicionar coluna active...');
    
    // Verificar se a coluna já existe
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'payment_methods')
      .eq('column_name', 'active');
    
    if (columnsError) {
      console.error('❌ Erro ao verificar colunas:', columnsError);
      return;
    }
    
    if (columns && columns.length > 0) {
      console.log('✅ Coluna active já existe na tabela payment_methods');
      return;
    }
    
    // Adicionar coluna active
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.payment_methods 
        ADD COLUMN active boolean DEFAULT true;
      `
    });
    
    if (alterError) {
      console.error('❌ Erro ao adicionar coluna active:', alterError);
      return;
    }
    
    console.log('✅ Coluna active adicionada com sucesso!');
    
    // Atualizar registros existentes
    const { error: updateError } = await supabase
      .from('payment_methods')
      .update({ active: true })
      .is('active', null);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar registros existentes:', updateError);
      return;
    }
    
    console.log('✅ Registros existentes atualizados com active = true');
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
  }
}

migratePaymentMethods();
