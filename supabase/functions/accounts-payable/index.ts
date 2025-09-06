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
    
    console.log('🔍 Debug - URL:', req.url)
    console.log('🔍 Debug - Path segments:', pathSegments)
    console.log('🔍 Debug - Last segment:', lastSegment)
    console.log('🔍 Debug - Is specific ID:', isSpecificId)
    console.log('🔍 Debug - Method:', req.method)

    // GET - Listar todos
    if (req.method === 'GET' && !isSpecificId) {
      console.log('📋 Listando todas as contas a pagar...')
      
      const { data, error } = await supabase
        .from('accounts_payable')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📥 Resultado da listagem:', { data, error })

      if (error) {
        console.error('❌ Erro ao buscar contas a pagar:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao buscar contas a pagar',
            details: error.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          accounts_payable: data || [],
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
        .from('accounts_payable')
        .select('*')
        .eq('id', lastSegment)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Conta a Pagar não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          account_payable: data
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
      
      const { data, error } = await supabase
        .from('accounts_payable')
        .insert(body)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao criar conta a pagar' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          account_payable: data,
          message: 'Conta a Pagar criada com sucesso'
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // PUT - Atualizar
    if (req.method === 'PUT' && isSpecificId) {
      const body = await req.json()
      console.log('🔧 PUT /accounts-payable - ID:', lastSegment)
      console.log('📝 Body recebido:', body)
      
      // Primeiro, verificar se o registro existe
      const { data: existingRecord, error: checkError } = await supabase
        .from('accounts_payable')
        .select('id')
        .eq('id', lastSegment)
        .single()
      
      console.log('🔍 Verificação de existência:', { existingRecord, checkError })
      
      if (checkError || !existingRecord) {
        console.log('❌ Registro não encontrado para ID:', lastSegment)
        return new Response(
          JSON.stringify({ 
            error: 'Conta a Pagar não encontrado',
            id: lastSegment,
            details: checkError?.message 
          }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      console.log('✅ Registro encontrado, procedendo com update...')
      
      const { data, error } = await supabase
        .from('accounts_payable')
        .update(body)
        .eq('id', lastSegment)
        .select()
        .single()

      console.log('📥 Resultado do update:', { data, error })

      if (error || !data) {
        console.log('❌ Erro no update:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Erro ao atualizar conta a pagar',
            details: error?.message 
          }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('✅ Update realizado com sucesso')
      return new Response(
        JSON.stringify({
          success: true,
          account_payable: data,
          message: 'Conta a Pagar atualizado com sucesso'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // DELETE - Deletar
    if (req.method === 'DELETE' && isSpecificId) {
      const { error } = await supabase
        .from('accounts_payable')
        .delete()
        .eq('id', lastSegment)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Conta a Pagar não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Conta a Pagar deletado com sucesso'
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
    console.error('Erro em accounts-payable:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})