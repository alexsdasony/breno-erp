import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Verificar se as variáveis estão definidas
    const hasUrl = !!supabaseUrl;
    const hasKey = !!supabaseKey;
    
    // Verificar se a chave começa corretamente
    const keyStartsWithEyJ = supabaseKey?.startsWith('eyJ') || false;
    
    // Verificar se a URL está correta
    const urlIsCorrect = supabaseUrl === 'https://qerubjitetqwfqqydhzv.supabase.co';
    
    return NextResponse.json({
      success: true,
      environment: {
        hasUrl,
        hasKey,
        keyStartsWithEyJ,
        urlIsCorrect,
        url: supabaseUrl,
        keyLength: supabaseKey?.length || 0,
        keyStart: supabaseKey?.substring(0, 20) + '...' || 'undefined'
      },
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
