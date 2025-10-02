import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Criando tabela audit_logs...');

    // Criar tabela usando query direta
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      // Tabela não existe, vamos criá-la
      console.log('📄 Tabela não existe, criando...');
      
      // Usar rpc para executar SQL
      const createTableResult = await supabaseAdmin.rpc('exec_sql', {
        sql: `
          CREATE TABLE audit_logs (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users(id),
            user_email TEXT,
            action TEXT NOT NULL,
            table_name TEXT NOT NULL,
            record_id UUID,
            old_values JSONB,
            new_values JSONB,
            ip_address TEXT,
            user_agent TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });

      if (createTableResult.error) {
        console.error('❌ Erro ao criar tabela:', createTableResult.error);
        return NextResponse.json({
          success: false,
          error: 'Erro ao criar tabela',
          details: createTableResult.error
        }, { status: 500 });
      }

      console.log('✅ Tabela audit_logs criada com sucesso!');
    } else if (error) {
      console.error('❌ Erro ao verificar tabela:', error);
      return NextResponse.json({
        success: false,
        error: 'Erro ao verificar tabela',
        details: error
      }, { status: 500 });
    } else {
      console.log('✅ Tabela audit_logs já existe');
    }

    // Testar inserção
    const { data: testLog, error: insertError } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        action: 'TEST',
        table_name: 'test',
        user_email: 'teste@exemplo.com',
        ip_address: '127.0.0.1',
        user_agent: 'Teste Manual'
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao inserir log de teste:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Erro ao inserir log de teste',
        details: insertError
      }, { status: 500 });
    }

    console.log('✅ Log de teste inserido com sucesso:', testLog.id);

    return NextResponse.json({
      success: true,
      message: 'Tabela audit_logs criada e testada com sucesso!',
      testLog
    });

  } catch (error) {
    console.error('❌ Erro ao criar tabela audit_logs:', error);
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
