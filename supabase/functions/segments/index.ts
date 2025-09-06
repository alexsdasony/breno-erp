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
    const isSpecificId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment)

    // GET - list all segments
    if (req.method === 'GET' && !lastSegment.includes('name')) {
      const { data, error } = await supabase
        .from('segments')
        .select('*')
        .order('name', { ascending: true })

      if (error) {
        return new Response(JSON.stringify({ error: 'Erro ao buscar segmentos' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      return new Response(JSON.stringify({ success: true, segments: data || [] }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // GET - get segment by name
    if (req.method === 'GET' && lastSegment.includes('name')) {
      const segmentName = pathSegments[pathSegments.length - 1]
      const { data, error } = await supabase
        .from('segments')
        .select('*')
        .eq('name', segmentName)
        .single()

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Segmento não encontrado' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      return new Response(JSON.stringify({ success: true, segment: data }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // GET - get segment by id
    if (req.method === 'GET' && isSpecificId) {
      const { data, error } = await supabase
        .from('segments')
        .select('*')
        .eq('id', lastSegment)
        .single()

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Segmento não encontrado' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      return new Response(JSON.stringify({ success: true, segment: data }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // POST - create segment
    if (req.method === 'POST') {
      const body = await req.json()
      
      const { data, error } = await supabase
        .from('segments')
        .insert(body)
        .select('*')
        .single()

      if (error) {
        return new Response(JSON.stringify({ error: 'Erro ao criar segmento', details: error }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      return new Response(JSON.stringify({ success: true, segment: data }), { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // PUT - update segment
    if (req.method === 'PUT' && isSpecificId) {
      const body = await req.json()
      
      const { data, error } = await supabase
        .from('segments')
        .update(body)
        .eq('id', lastSegment)
        .select('*')
        .single()

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Segmento não encontrado' }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      return new Response(JSON.stringify({ success: true, segment: data }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // DELETE - delete segment
    if (req.method === 'DELETE' && isSpecificId) {
      const { error } = await supabase
        .from('segments')
        .delete()
        .eq('id', lastSegment)

      if (error) {
        return new Response(JSON.stringify({ error: 'Erro ao deletar segmento' }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      return new Response(JSON.stringify({ success: true, message: 'Segmento deletado com sucesso' }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    return new Response(JSON.stringify({ error: 'Método não permitido' }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    })
  }
})