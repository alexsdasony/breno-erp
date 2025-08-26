import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/')
    const lastSegment = pathSegments[pathSegments.length - 1]

    const isSpecificId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment) || /^\d+$/.test(lastSegment)

    if (req.method === 'GET' && !isSpecificId) {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(JSON.stringify({ error: 'Erro ao buscar formas de pagamento' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      return new Response(JSON.stringify({ success: true, payment_methods: data || [], total: data?.length || 0 }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'GET' && isSpecificId) {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('id', lastSegment)
        .single()

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Forma de pagamento não encontrada' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      return new Response(JSON.stringify({ success: true, payment_method: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      if (!body.name) {
        return new Response(JSON.stringify({ error: 'Nome é obrigatório' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      const payload: any = { name: body.name, nfe_code: body.nfe_code ?? body.nfeCode ?? null }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert(payload)
        .select()
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: 'Erro ao criar forma de pagamento' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      return new Response(JSON.stringify({ success: true, payment_method: data, message: 'Forma de pagamento criada com sucesso' }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PUT' && isSpecificId) {
      const body = await req.json()
      const payload: any = { name: body.name ?? null, nfe_code: body.nfe_code ?? body.nfeCode ?? null }

      const { data, error } = await supabase
        .from('payment_methods')
        .update(payload)
        .eq('id', lastSegment)
        .select()
        .single()

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Forma de pagamento não encontrada' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      return new Response(JSON.stringify({ success: true, payment_method: data, message: 'Forma de pagamento atualizada com sucesso' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'DELETE' && isSpecificId) {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', lastSegment)

      if (error) {
        return new Response(JSON.stringify({ error: 'Forma de pagamento não encontrada' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      return new Response(JSON.stringify({ success: true, message: 'Forma de pagamento deletada com sucesso' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Método não permitido' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Erro em payment-methods:', error)
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
