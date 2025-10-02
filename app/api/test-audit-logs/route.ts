import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando sistema de logs de auditoria...');

    // Verificar se a tabela existe - tentar buscar dados diretamente
    const { data: testData, error: tablesError } = await supabaseAdmin
      .from('audit_logs')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao verificar tabelas',
        details: tablesError
      }, { status: 500 });
    }

    if (tablesError) {
      console.error('❌ Tabela audit_logs não encontrada:', tablesError);
      return NextResponse.json({
        success: false,
        error: 'Tabela audit_logs não encontrada',
        details: tablesError
      }, { status: 404 });
    }

    console.log('✅ Tabela audit_logs encontrada');

    // Verificar logs existentes
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

    console.log(`📋 Logs encontrados: ${logs?.length || 0}`);

    // Testar inserção de log manual
    console.log('📝 Testando inserção de log manual...');
    const { data: newLog, error: insertError } = await supabaseAdmin
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
      return NextResponse.json({
        success: false,
        error: 'Erro ao inserir log manual',
        details: insertError
      }, { status: 500 });
    }

    console.log('✅ Log manual inserido com sucesso:', newLog.id);

    return NextResponse.json({
      success: true,
      message: 'Sistema de logs de auditoria funcionando!',
      tableExists: !tablesError,
      logsCount: logs?.length || 0,
      logs: logs || [],
      testLog: newLog
    });

  } catch (error) {
    console.error('❌ Erro ao testar logs de auditoria:', error);
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
