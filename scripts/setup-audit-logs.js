import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAuditLogs() {
  try {
    console.log('🔧 Configurando sistema de logs de auditoria...');

    // Ler o arquivo de migração
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250125000001_create_audit_logs.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Executando migração...');
    
    // Executar a migração
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erro ao executar migração:', error);
      return;
    }

    console.log('✅ Sistema de logs de auditoria configurado com sucesso!');
    console.log('📋 Funcionalidades implementadas:');
    console.log('   - Tabela audit_logs criada');
    console.log('   - Triggers automáticos para capturar alterações');
    console.log('   - API /api/audit-logs para visualização');
    console.log('   - Interface /audit-logs para administradores');
    console.log('   - Logs de CREATE, UPDATE, DELETE automáticos');
    console.log('   - Logs manuais para LOGIN/LOGOUT');

  } catch (error) {
    console.error('❌ Erro ao configurar logs de auditoria:', error);
  }
}

setupAuditLogs();
