import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const cleanedKey = rawKey?.replace(/\n/g, '').replace(/\r/g, '').trim();
    
    const debug = {
      rawKeyLength: rawKey?.length || 0,
      cleanedKeyLength: cleanedKey?.length || 0,
      rawKeyStart: rawKey?.substring(0, 20) || 'N/A',
      cleanedKeyStart: cleanedKey?.substring(0, 20) || 'N/A',
      hasNewlines: rawKey?.includes('\n') || false,
      hasCarriageReturns: rawKey?.includes('\r') || false,
      timestamp: new Date().toISOString()
    };

    console.log('🔍 Debug da chave Supabase:', debug);

    return NextResponse.json({
      success: true,
      debug: debug,
      message: 'Debug da chave Supabase'
    });
  } catch (error) {
    console.error('❌ Erro no debug da chave:', error);
    return NextResponse.json(
      { 
        error: 'Erro no debug da chave',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
