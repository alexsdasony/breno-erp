import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

type JsonBody = Record<string, any> | null;

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment);
    const isNumeric = /^\d+$/.test(lastSegment);
    const isSpecificId = isUUID || isNumeric;

    // Helpers
    const json = (body: JsonBody, status = 200) => new Response(
      JSON.stringify(body ?? {}),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

    // GET - list or by id (supports query ?page=&limit=&id=)
    if (req.method === 'GET') {
      const idParam = url.searchParams.get('id');

      if (isSpecificId || idParam) {
        const targetId = isSpecificId ? lastSegment : idParam!;
        const { data, error } = await supabase
          .from('chart_of_accounts')
          .select('*')
          .eq('id', targetId)
          .single();

        if (error || !data) {
          return json({ error: 'Conta não encontrada' }, 404);
        }

        return json({ success: true, chartOfAccount: data }, 200);
      }

      const page = Math.max(parseInt(url.searchParams.get('page') || '1', 10), 1);
      const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '20', 10), 1), 100);
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const query = supabase
        .from('chart_of_accounts')
        .select('*', { count: 'exact' })
        .order('code', { ascending: true })
        .range(from, to);

      const { data, error, count } = await query;

      if (error) {
        return json({ error: 'Erro ao buscar plano de contas' }, 500);
      }

      return json({ success: true, chartOfAccounts: data ?? [], total: count ?? 0 }, 200);
    }

    // POST - create
    if (req.method === 'POST') {
      const body = await req.json();

      if (!body?.code || !body?.name || !body?.type) {
        return json({ error: 'code, name e type são obrigatórios' }, 400);
      }

      const payload: Record<string, any> = {
        code: body.code,
        name: body.name,
        type: body.type, // 'asset', 'liability', 'equity', 'revenue', 'expense'
        parent_id: body.parent_id ?? null,
      };

      const { data, error } = await supabase
        .from('chart_of_accounts')
        .insert(payload)
        .select()
        .single();

      if (error) {
        return json({ error: 'Erro ao criar conta' }, 500);
      }

      return json({ success: true, chartOfAccount: data, message: 'Conta criada com sucesso' }, 201);
    }

    // PUT - update by id
    if (req.method === 'PUT' && isSpecificId) {
      const body = await req.json();

      const updates: Record<string, any> = {};
      ['code', 'name', 'type', 'parent_id'].forEach((k) => {
        if (k in body) updates[k] = body[k];
      });

      const { data, error } = await supabase
        .from('chart_of_accounts')
        .update(updates)
        .eq('id', lastSegment)
        .select()
        .single();

      if (error || !data) {
        return json({ error: 'Conta não encontrada' }, 404);
      }

      return json({ success: true, chartOfAccount: data, message: 'Conta atualizada com sucesso' }, 200);
    }

    // DELETE - delete by id
    if (req.method === 'DELETE' && isSpecificId) {
      const { error } = await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', lastSegment);

      if (error) {
        return json({ error: 'Conta não encontrada' }, 404);
      }

      return json({ success: true, message: 'Conta deletada com sucesso' }, 200);
    }

    return json({ error: 'Método não permitido' }, 405);
  } catch (err) {
    console.error('Erro em chart-of-accounts:', err);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
