import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Configurando sistema de logs de auditoria...');

    // SQL para criar a tabela de auditoria
    const createTableSQL = `
      -- Criar tabela de logs de auditoria
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id),
        user_email TEXT,
        action TEXT NOT NULL,
        table_name TEXT NOT NULL,
        record_id UUID,
        old_values JSONB,
        new_values JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    // SQL para criar índices
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
    `;

    // SQL para criar função de trigger
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION audit_trigger_function()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO audit_logs (
          user_id,
          user_email,
          action,
          table_name,
          record_id,
          old_values,
          new_values,
          ip_address,
          user_agent
        ) VALUES (
          auth.uid(),
          auth.jwt() ->> 'email',
          TG_OP,
          TG_TABLE_NAME,
          COALESCE(NEW.id, OLD.id),
          CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
          CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
          inet_client_addr(),
          current_setting('request.headers', true)::json ->> 'user-agent'
        );
        
        RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    // SQL para criar triggers
    const createTriggersSQL = `
      DROP TRIGGER IF EXISTS audit_financial_documents ON financial_documents;
      CREATE TRIGGER audit_financial_documents
        AFTER INSERT OR UPDATE OR DELETE ON financial_documents
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

      DROP TRIGGER IF EXISTS audit_sales ON sales;
      CREATE TRIGGER audit_sales
        AFTER INSERT OR UPDATE OR DELETE ON sales
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

      DROP TRIGGER IF EXISTS audit_partners ON partners;
      CREATE TRIGGER audit_partners
        AFTER INSERT OR UPDATE OR DELETE ON partners
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

      DROP TRIGGER IF EXISTS audit_billings ON billings;
      CREATE TRIGGER audit_billings
        AFTER INSERT OR UPDATE OR DELETE ON billings
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

      DROP TRIGGER IF EXISTS audit_accounts_payable ON accounts_payable;
      CREATE TRIGGER audit_accounts_payable
        AFTER INSERT OR UPDATE OR DELETE ON accounts_payable
        FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    `;

    // SQL para RLS
    const createRLSSQL = `
      ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can view their own audit logs" ON audit_logs;
      CREATE POLICY "Users can view their own audit logs" ON audit_logs
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Admins can view all audit logs" ON audit_logs;
      CREATE POLICY "Admins can view all audit logs" ON audit_logs
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data ->> 'role' = 'admin'
          )
        );
    `;

    // Executar todas as queries
    console.log('📄 Criando tabela audit_logs...');
    await supabaseAdmin.rpc('exec_sql', { sql: createTableSQL });

    console.log('📄 Criando índices...');
    await supabaseAdmin.rpc('exec_sql', { sql: createIndexesSQL });

    console.log('📄 Criando função de trigger...');
    await supabaseAdmin.rpc('exec_sql', { sql: createFunctionSQL });

    console.log('📄 Criando triggers...');
    await supabaseAdmin.rpc('exec_sql', { sql: createTriggersSQL });

    console.log('📄 Configurando RLS...');
    await supabaseAdmin.rpc('exec_sql', { sql: createRLSSQL });

    console.log('✅ Sistema de logs de auditoria configurado com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Sistema de logs de auditoria configurado com sucesso!',
      features: [
        'Tabela audit_logs criada',
        'Triggers automáticos para capturar alterações',
        'API /api/audit-logs para visualização',
        'Interface /audit-logs para administradores',
        'Logs de CREATE, UPDATE, DELETE automáticos',
        'Logs manuais para LOGIN/LOGOUT'
      ]
    });

  } catch (error) {
    console.error('❌ Erro ao configurar logs de auditoria:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao configurar logs de auditoria',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
