import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // Limpeza da chave
    const originalKey = supabaseKey;
    supabaseKey = supabaseKey.replace(/\n/g, '').replace(/\r/g, '').trim();

    // Teste 1: Verificar se a chave é um JWT válido
    const isJWT = supabaseKey.split('.').length === 3;
    
    // Teste 2: Verificar se começa com eyJ
    const startsWithEyJ = supabaseKey.startsWith('eyJ');
    
    // Teste 3: Tentar decodificar o header do JWT
    let jwtHeader = null;
    try {
      const headerPart = supabaseKey.split('.')[0];
      jwtHeader = JSON.parse(atob(headerPart));
    } catch (e) {
      jwtHeader = { error: 'Não foi possível decodificar o header' };
    }

    // Teste 4: Tentar criar cliente e fazer uma consulta simples
    let connectionTest = null;
    try {
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
        connectionTest = { success: false, error: error.message, code: error.code };
      } else {
        connectionTest = { success: true, data: data };
      }
    } catch (e) {
      connectionTest = { success: false, error: e instanceof Error ? e.message : 'Erro desconhecido' };
    }

    return NextResponse.json({
      success: true,
      debug: {
        url: supabaseUrl,
        keyLength: supabaseKey.length,
        originalKeyLength: originalKey.length,
        isJWT,
        startsWithEyJ,
        jwtHeader,
        connectionTest,
        timestamp: new Date().toISOString()
      },
      message: 'Validação detalhada da chave Supabase'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
