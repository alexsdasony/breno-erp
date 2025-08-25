import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/')
    const lastSegment = pathSegments[pathSegments.length - 1]
    const isSpecificId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment) || /^\d+$/.test(lastSegment)

    // GET - list suppliers from partners with role 'supplier'
    if (req.method === 'GET' && !isSpecificId) {
      const { data: roleRows, error: roleErr } = await supabase
        .from('partner_roles')
        .select('partner_id')
        .eq('role', 'supplier')

      if (roleErr) return new Response(JSON.stringify({ error: 'Erro ao buscar roles de fornecedores' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

      const ids = (roleRows || []).map((r: any) => r.partner_id)
      let query = supabase.from('partners').select('*')
      if (ids.length > 0) query = query.in('id', ids)
      query = query.order('created_at', { ascending: false })
      const { data, error } = await query
      if (error) return new Response(JSON.stringify({ error: 'Erro ao buscar fornecedores' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

      return new Response(JSON.stringify({ success: true, suppliers: data || [], total: data?.length || 0 }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET - by id
    if (req.method === 'GET' && isSpecificId) {
      const { data, error } = await supabase.from('partners').select('*').eq('id', lastSegment).single()
      if (error || !data) return new Response(JSON.stringify({ error: 'Fornecedor não encontrado' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      return new Response(JSON.stringify({ success: true, suppliers: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // POST - create partner and link role 'supplier'
    if (req.method === 'POST') {
      const body = await req.json()
      const { data, error } = await supabase.from('partners').insert(body).select('*').single()
      if (error) return new Response(JSON.stringify({ error: 'Erro ao criar fornecedor' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      await supabase.from('partner_roles').insert({ partner_id: (data as any).id, role: 'supplier' })
      return new Response(JSON.stringify({ success: true, supplier: data, message: 'Fornecedor criado com sucesso' }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // PUT - update partner
    if (req.method === 'PUT' && isSpecificId) {
      const body = await req.json()
      const { data, error } = await supabase.from('partners').update(body).eq('id', lastSegment).select('*').single()
      if (error || !data) return new Response(JSON.stringify({ error: 'Fornecedor não encontrado' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      return new Response(JSON.stringify({ success: true, suppliers: data, message: 'Fornecedor atualizado com sucesso' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // DELETE - delete partner (roles by FK cascade or explicit)
    if (req.method === 'DELETE' && isSpecificId) {
      const { error } = await supabase.from('partners').delete().eq('id', lastSegment)
      if (error) return new Response(JSON.stringify({ error: 'Fornecedor não encontrado' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      return new Response(JSON.stringify({ success: true, message: 'Fornecedor deletado com sucesso' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Erro em suppliers:', error)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
