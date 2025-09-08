import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Teste simples de conexão
    const { data, error } = await supabaseAdmin
      .from('accounts_payable')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Erro na conexão com Supabase:', error);
      return NextResponse.json(
        { 
          error: 'Erro na conexão com Supabase',
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Conexão com Supabase funcionando!');
    
    return NextResponse.json({
      success: true,
      message: 'Conexão com Supabase funcionando',
      data: data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Erro no teste de Supabase:', error);
    return NextResponse.json(
      { 
        error: 'Erro no teste de Supabase',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
