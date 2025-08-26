import { serve } from 'https://deno.land/std@0.192.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, ok, badRequest, notFound, serverError } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const id = pathParts.pop();
    const direction = url.searchParams.get('direction') || undefined;

    if (req.method === 'GET') {
      if (id && id !== 'financial-documents') {
        const { data, error } = await supabase
          .from('financial_documents')
          .select('*, partner:partners(name)')
          .eq('id', id)
          .single();
        if (error) return notFound('Document not found');
        return ok({ document: data });
      }
      let query = supabase.from('financial_documents').select('*, partner:partners(name)');
      if (direction) query = query.eq('direction', direction);
      query = query.order('created_at', { ascending: false });
      const { data, error } = await query;
      if (error) return serverError(error.message);
      return ok({ financialDocuments: data });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('financial_documents')
        .insert(body)
        .select('*, partner:partners(name)')
        .single();
      if (error) return badRequest(error.message);
      return ok({ document: data });
    }

    if (req.method === 'PUT' && id && id !== 'financial-documents') {
      const body = await req.json();
      const { data, error } = await supabase
        .from('financial_documents')
        .update(body)
        .eq('id', id)
        .select('*, partner:partners(name)')
        .single();
      if (error) return badRequest(error.message);
      return ok({ document: data });
    }

    if (req.method === 'DELETE' && id && id !== 'financial-documents') {
      const { error } = await supabase.from('financial_documents').delete().eq('id', id);
      if (error) return badRequest(error.message);
      return ok({ success: true });
    }

    return notFound();
  } catch (e) {
    console.error(e);
    return serverError(String(e));
  }
});


