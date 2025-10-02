import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAuditLogs() {
  try {
    console.log('🔍 Testando sistema de logs de auditoria...');

    // Verificar se a tabela existe
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'audit_logs');

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError);
      return;
    }

    if (!tables || tables.length === 0) {
      console.error('❌ Tabela audit_logs não encontrada');
      return;
    }

    console.log('✅ Tabela audit_logs encontrada');

    // Verificar logs existentes
    const { data: logs, error: logsError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (logsError) {
      console.error('❌ Erro ao buscar logs:', logsError);
      return;
    }

    console.log(`📋 Logs encontrados: ${logs?.length || 0}`);
    
    if (logs && logs.length > 0) {
      console.log('📄 Últimos logs:');
      logs.forEach((log, index) => {
        console.log(`  ${index + 1}. ${log.action} em ${log.table_name} - ${log.user_email} - ${log.created_at}`);
      });
    } else {
      console.log('ℹ️ Nenhum log encontrado ainda');
    }

    // Testar inserção de log manual
    console.log('📝 Testando inserção de log manual...');
    const { data: newLog, error: insertError } = await supabase
      .from('audit_logs')
      .insert({
        action: 'LOGIN',
        table_name: 'auth.users',
        user_email: 'teste@exemplo.com',
        ip_address: '127.0.0.1',
        user_agent: 'Teste Manual'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir log manual:', insertError);
      return;
    }

    console.log('✅ Log manual inserido com sucesso:', newLog.id);

  } catch (error) {
    console.error('❌ Erro ao testar logs de auditoria:', error);
  }
}

testAuditLogs();
