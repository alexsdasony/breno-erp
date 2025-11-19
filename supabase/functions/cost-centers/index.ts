import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/')
    const lastSegment = pathSegments[pathSegments.length - 1]
    
    // Usar regex para detectar se é uma rota /:id (UUID ou número)
    const isSpecificId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lastSegment) || 
                        /^\d+$/.test(lastSegment)

    // GET - Listar todos
    if (req.method === 'GET' && !isSpecificId) {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar centro de custos' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          costCenters: data || [],
          total: data?.length || 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET - Buscar por ID
    if (req.method === 'GET' && isSpecificId) {
      const { data, error } = await supabase
        .from('cost_centers')
        .select('*')
        .eq('id', lastSegment)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Centro de Custo não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          costCenter: data
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // POST - Criar
    if (req.method === 'POST') {
      const body = await req.json()

      // Mapear e validar campos permitidos (schema extendido)
      const allowedStatus = ['active', 'inactive'] as const
      const allowedTypes = ['despesa', 'receita'] as const
      const isUuid = (v: any) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

      const payload: {
        name?: string
        segment_id?: string | null
        description?: string | null
        budget?: number
        status?: typeof allowedStatus[number]
        manager_id?: string | null
        type?: typeof allowedTypes[number] | null
      } = {
        name: body?.name,
        segment_id: body?.segment_id ?? null,
        description: body?.description ?? null,
        budget: typeof body?.budget === 'number' ? body.budget : (body?.budget ? Number(body.budget) : 0),
        status: allowedStatus.includes(body?.status) ? body.status : 'active',
        manager_id: body?.manager_id ?? null,
        type: allowedTypes.includes(body?.type) ? body.type : (body?.type === null || body?.type === '') ? null : null,
      }

      // Validação básica
      if (!payload.name || typeof payload.name !== 'string') {
        return new Response(
          JSON.stringify({ error: 'Campo obrigatório ausente: name' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      if (payload.segment_id && !isUuid(payload.segment_id)) {
        return new Response(
          JSON.stringify({ error: 'segment_id inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (payload.manager_id && !isUuid(payload.manager_id)) {
        return new Response(
          JSON.stringify({ error: 'manager_id inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (payload.budget !== undefined && (isNaN(payload.budget) || payload.budget < 0)) {
        return new Response(
          JSON.stringify({ error: 'budget inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (payload.type !== null && payload.type !== undefined && !allowedTypes.includes(payload.type)) {
        return new Response(
          JSON.stringify({ error: 'type inválido. Deve ser "despesa" ou "receita"' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data, error } = await supabase
        .from('cost_centers')
        .insert(payload)
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar cost_center:', error)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar centro de custo' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          costCenter: data,
          message: 'Centro de Custo criado com sucesso',
        }),
        {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // PUT - Atualizar
    if (req.method === 'PUT' && isSpecificId) {
      const body = await req.json()

      const allowedStatus = ['active', 'inactive'] as const
      const allowedTypes = ['despesa', 'receita'] as const
      const isUuid = (v: any) => typeof v === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v)

      // Apenas colunas válidas no schema atual
      const payload: {
        name?: string
        segment_id?: string | null
        description?: string | null
        budget?: number
        status?: typeof allowedStatus[number]
        manager_id?: string | null
        type?: typeof allowedTypes[number] | null
      } = {}
      if (typeof body?.name === 'string') payload.name = body.name
      if (body?.segment_id !== undefined) payload.segment_id = body.segment_id ?? null
      if (body?.description !== undefined) payload.description = body.description ?? null
      if (body?.budget !== undefined) {
        const b = typeof body.budget === 'number' ? body.budget : Number(body.budget)
        if (isNaN(b) || b < 0) {
          return new Response(
            JSON.stringify({ error: 'budget inválido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        payload.budget = b
      }
      if (body?.status !== undefined) {
        if (!allowedStatus.includes(body.status)) {
          return new Response(
            JSON.stringify({ error: 'status inválido. Use active|inactive' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        payload.status = body.status
      }
      if (body?.manager_id !== undefined) {
        if (body.manager_id !== null && !isUuid(body.manager_id)) {
          return new Response(
            JSON.stringify({ error: 'manager_id inválido' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        payload.manager_id = body.manager_id
      }
      if (body?.type !== undefined) {
        if (body.type !== null && body.type !== '' && !allowedTypes.includes(body.type)) {
          return new Response(
            JSON.stringify({ error: 'type inválido. Deve ser "despesa" ou "receita"' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        payload.type = body.type === null || body.type === '' ? null : body.type
      }

      if (Object.keys(payload).length === 0) {
        return new Response(
          JSON.stringify({ error: 'Nenhum campo válido para atualizar' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      const { data, error } = await supabase
        .from('cost_centers')
        .update(payload)
        .eq('id', lastSegment)
        .select()
        .single()

      if (error || !data) {
        console.error('Erro ao atualizar cost_center:', error)
        return new Response(
          JSON.stringify({ error: 'Centro de Custo não encontrado' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          costCenter: data,
          message: 'Centro de Custo atualizado com sucesso',
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // DELETE - Deletar
    if (req.method === 'DELETE' && isSpecificId) {
      const { error } = await supabase
        .from('cost_centers')
        .delete()
        .eq('id', lastSegment)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Centro de Custo não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Centro de Custo deletado com sucesso'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro em cost-centers:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})