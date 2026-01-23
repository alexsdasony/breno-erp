import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const envInfo = {
      hasNextPublicSupabaseUrl: !!url,
      hasSupabaseServiceRoleKey: !!key,
      hasNextPublicSupabaseAnonKey: !!anonKey,
      urlLength: url?.length || 0,
      keyLength: key?.length || 0,
      anonKeyLength: anonKey?.length || 0,
      urlPrefix: url ? url.substring(0, 30) + '...' : 'N/A',
      keyPrefix: key ? key.substring(0, 20) + '...' : 'N/A',
      nodeEnv: process.env.NODE_ENV,
      allSupabaseKeys: Object.keys(process.env)
        .filter(k => k.includes('SUPABASE'))
        .map(k => ({
          key: k,
          hasValue: !!process.env[k],
          length: process.env[k]?.length || 0
        })),
    };

    console.log('🔍 Debug Supabase Environment:', envInfo);

    return NextResponse.json({
      success: true,
      environment: envInfo,
      status: {
        canCreateClient: !!(url && key),
        missing: {
          url: !url,
          serviceRoleKey: !key
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro no debug:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
