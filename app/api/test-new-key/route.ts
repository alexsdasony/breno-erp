import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Limpeza da chave para remover quebras de linha e espaços extras
    supabaseKey = supabaseKey.replace(/\n/g, '').replace(/\r/g, '').trim();

    // Teste da nova chave
    const testClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Tentar uma consulta simples
    const { data, error } = await testClient
      .from('accounts_payable')
      .select('id')
      .limit(1);
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        hint: error.hint,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Nova chave funcionando perfeitamente!',
      data: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
