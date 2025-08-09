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
    const id = url.pathname.split('/').filter(Boolean).pop();
    const role = url.searchParams.get('role') || undefined;

    if (req.method === 'GET') {
      if (id && id !== 'partners') {
        const { data, error } = await supabase.from('partners').select('*').eq('id', id).single();
        if (error) return notFound('Partner not found');
        // roles
        const { data: roles } = await supabase.from('partner_roles').select('*').eq('partner_id', id);
        return ok({ partner: { ...data, partner_roles: roles || [] } });
      }
      let query = supabase.from('partners').select('*');
      if (role) {
        // join via RPC to filter by role
        const { data: partnersByRole, error } = await supabase
          .from('partner_roles')
          .select('partner_id')
          .eq('role', role);
        if (error) return serverError('Failed to fetch roles');
        const ids = (partnersByRole || []).map((r: any) => r.partner_id);
        query = query.in('id', ids);
      }
      const { data, error } = await query;
      if (error) return serverError(error.message);
      // attach roles per partner
      const ids = (data || []).map((p: any) => p.id);
      const { data: roles } = await supabase.from('partner_roles').select('*').in('partner_id', ids);
      const mapRoles = (pid: string) => (roles || []).filter((r: any) => r.partner_id === pid);
      const result = (data || []).map((p: any) => ({ ...p, partner_roles: mapRoles(p.id) }));
      return ok({ partners: result });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      const roles = body.roles || (body.role ? [body.role] : []);
      delete body.roles; delete body.role;
      const { data, error } = await supabase.from('partners').insert(body).select('*').single();
      if (error) return badRequest(error.message);
      if (roles.length > 0) {
        await supabase.from('partner_roles').insert(roles.map((r: string) => ({ partner_id: data.id, role: r })));
      }
      return ok({ partner: data });
    }

    if (req.method === 'PUT' && id && id !== 'partners') {
      const body = await req.json();
      const { data, error } = await supabase.from('partners').update(body).eq('id', id).select('*').single();
      if (error) return badRequest(error.message);
      return ok({ partner: data });
    }

    if (req.method === 'DELETE' && id && id !== 'partners') {
      const { error } = await supabase.from('partners').delete().eq('id', id);
      if (error) return badRequest(error.message);
      return ok({ success: true });
    }

    return notFound();
  } catch (e) {
    console.error(e);
    return serverError(String(e));
  }
});


