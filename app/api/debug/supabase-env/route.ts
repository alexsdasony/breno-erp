import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/debug/supabase-env
 * Rota de debug para verificar variáveis Supabase e conectividade (Render/produção).
 *
 * ⚠️ ATENÇÃO: Não expõe chaves completas. Remover em produção ou proteger com autenticação.
 */
export async function GET(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const env = {
      hasUrl: !!url,
      hasKey: !!key,
      urlLength: url?.length ?? 0,
      urlPrefix: url ? `${url.substring(0, 30)}...` : 'N/A',
      keyLength: key?.length ?? 0,
      keyPrefix: key ? `${key.substring(0, 20)}...` : 'N/A',
      nodeEnv: process.env.NODE_ENV,
      renderServiceId: process.env.RENDER_SERVICE_ID ?? 'not set',
      renderInstanceId: process.env.RENDER_INSTANCE_ID ?? 'not set',
    };

    let connectivity: {
      ok: boolean;
      status?: number;
      statusText?: string;
      errorMessage?: string;
      errorCause?: string;
      errorCode?: string;
    } = { ok: false };

    if (url && key) {
      const apiUrl = `${url.replace(/\/$/, '')}/rest/v1/partners?select=id&limit=1`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15_000);
      try {
        const res = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        connectivity = {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
        };
      } catch (e) {
        clearTimeout(timeoutId);
        const err = e instanceof Error ? e : new Error(String(e));
        const cause = err.cause as { code?: string; message?: string } | undefined;
        connectivity = {
          ok: false,
          errorMessage: err.message,
          errorCause: cause ? String(cause) : undefined,
          errorCode: cause?.code,
        };
      }
    }

    return NextResponse.json({
      success: true,
      environment: env,
      connectivity,
      message:
        env.hasUrl && env.hasKey
          ? connectivity.ok
            ? '✅ Supabase configurado e acessível'
            : `❌ Supabase configurado mas fetch falhou: ${connectivity.errorMessage ?? connectivity.statusText ?? 'erro desconhecido'}`
          : '❌ Variáveis Supabase ausentes',
      troubleshooting:
        !env.hasUrl || !env.hasKey || !connectivity.ok
          ? {
              step1: 'Verifique NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Render (Environment)',
              step2: 'Supabase Dashboard → Settings → API: use a URL e a service_role key',
              step3: 'Supabase → Database → Network: "Allow all" ou adicione IPs do Render',
              step4: 'Após alterar variáveis: Manual Deploy no Render e aguarde 2–5 min',
              step5: 'Se errorCause = ECONNRESET/ECONNREFUSED: problema de rede Render ↔ Supabase',
            }
          : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
