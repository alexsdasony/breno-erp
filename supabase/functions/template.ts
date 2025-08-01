import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Função para verificar autenticação
async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader) {
    return { error: 'Token de autorização não fornecido', status: 401 }
  }

  const token = authHeader.replace('Bearer ', '')
  
  try {
    // Decodificar token simples (base64)
    const decoded = JSON.parse(atob(token))
    return { user: decoded, error: null }
  } catch (error) {
    return { error: 'Token inválido', status: 401 }
  }
}

// Função para criar cliente Supabase
function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Função para construir query com filtros
function buildQuery(tableName: string, filters: any = {}) {
  let query = `SELECT * FROM ${tableName} WHERE 1=1`
  const params: any[] = []
  let paramIndex = 1

  if (filters.segment_id) {
    query += ` AND segment_id = $${paramIndex++}`
    params.push(filters.segment_id)
  }

  if (filters.limit) {
    query += ` LIMIT $${paramIndex++}`
    params.push(parseInt(filters.limit))
  }

  if (filters.offset) {
    query += ` OFFSET $${paramIndex++}`
    params.push(parseInt(filters.offset))
  }

  return { query, params }
}

// Template base para CRUD operations
export function createCRUDFunction(tableName: string, displayName: string) {
  return async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    try {
      const supabase = createSupabaseClient()
      const auth = await authenticateUser(req)
      
      if (auth.error) {
        return new Response(
          JSON.stringify({ error: auth.error }),
          { 
            status: auth.status || 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const user = auth.user
      const url = new URL(req.url)
      const path = url.pathname.split('/').pop()

      // GET - Listar todos
      if (req.method === 'GET' && !path) {
        const filters = Object.fromEntries(url.searchParams)
        const { query, params } = buildQuery(tableName, filters)
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          query, 
          params: JSON.stringify(params) 
        })

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Erro ao buscar dados' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            [tableName]: data || [],
            total: data?.length || 0
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // GET - Buscar por ID
      if (req.method === 'GET' && path) {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', path)
          .single()

        if (error || !data) {
          return new Response(
            JSON.stringify({ error: `${displayName} não encontrado` }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            [tableName.replace('s', '')]: data
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
        
        // Adicionar segment_id do usuário se não fornecido
        if (!body.segment_id) {
          body.segment_id = user.segment_id
        }

        const { data, error } = await supabase
          .from(tableName)
          .insert(body)
          .select()
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: 'Erro ao criar registro' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            [tableName.replace('s', '')]: data,
            message: `${displayName} criado com sucesso`
          }),
          { 
            status: 201, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // PUT - Atualizar
      if (req.method === 'PUT' && path) {
        const body = await req.json()
        
        const { data, error } = await supabase
          .from(tableName)
          .update(body)
          .eq('id', path)
          .select()
          .single()

        if (error || !data) {
          return new Response(
            JSON.stringify({ error: `${displayName} não encontrado` }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            [tableName.replace('s', '')]: data,
            message: `${displayName} atualizado com sucesso`
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // DELETE - Deletar
      if (req.method === 'DELETE' && path) {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq('id', path)

        if (error) {
          return new Response(
            JSON.stringify({ error: `${displayName} não encontrado` }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({
            success: true,
            message: `${displayName} deletado com sucesso`
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
      console.error(`Erro na ${tableName}:`, error)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
  }
} 