import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Configurando sistema de logs de auditoria (versão simples)...');

    // Primeiro, vamos tentar inserir um log de teste para ver se a tabela existe
    const { data: testData, error: testError } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'SYSTEM_INIT',
        table_name: 'audit_logs',
        user_email: 'system@breno-erp.com',
        ip_address: '127.0.0.1',
        user_agent: 'Sistema de Auditoria'
      })
      .select()
      .single();

    if (testError && testError.code === '42P01') {
      console.log('❌ Tabela audit_logs não existe. Você precisa criá-la manualmente no Supabase Dashboard.');
      console.log('📄 Execute o SQL em scripts/create-audit-table.sql no Supabase SQL Editor');
      
      return NextResponse.json({
        success: false,
        error: 'Tabela audit_logs não existe',
        message: 'Execute o SQL em scripts/create-audit-table.sql no Supabase SQL Editor',
        sqlFile: 'scripts/create-audit-table.sql'
      }, { status: 404 });
    }

    if (testError) {
      console.error('❌ Erro ao testar tabela:', testError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao testar tabela',
        details: testError
      }, { status: 500 });
    }

    console.log('✅ Tabela audit_logs existe e está funcionando!');
    console.log('📋 Log de teste criado:', testData.id);

    // Buscar logs existentes
    const { data: logs, error: logsError } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logsError) {
      console.error('❌ Erro ao buscar logs:', logsError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar logs',
        details: logsError
      }, { status: 500 });
    }

    console.log(`📋 Total de logs: ${logs?.length || 0}`);

    return NextResponse.json({
      success: true,
      message: 'Sistema de logs de auditoria funcionando!',
      tableExists: true,
      logsCount: logs?.length || 0,
      logs: logs || [],
      testLog: testData
    });

  } catch (error) {
    console.error('❌ Erro ao configurar logs de auditoria:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
