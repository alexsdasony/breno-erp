import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Definida' : '❌ Não definida',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Definida' : '❌ Não definida',
      NODE_ENV: process.env.NODE_ENV || 'Não definido',
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Teste de variáveis de ambiente:', envCheck);

    return NextResponse.json({
      success: true,
      environment: envCheck,
      message: 'Teste de variáveis de ambiente'
    });
  } catch (error) {
    console.error('❌ Erro no teste de ambiente:', error);
    return NextResponse.json(
      { 
        error: 'Erro no teste de ambiente',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
