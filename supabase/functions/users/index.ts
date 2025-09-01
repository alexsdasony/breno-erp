import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts"

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
    const isSpecificId = lastSegment && lastSegment !== 'users' && lastSegment.length > 10

    // GET - Listar todos
    if (req.method === 'GET' && !isSpecificId) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar usuários' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          users: data || [],
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
        .from('users')
        .select('*')
        .eq('id', lastSegment)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: data
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
      
      // Validação básica
      if (!body.name || !body.email || !body.password) {
        return new Response(
          JSON.stringify({ error: 'Nome, email e senha são obrigatórios' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // Verificar se email já existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', body.email)
        .single()
      
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 'Email já cadastrado' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      // Hash da senha
      const hashedPassword = await hash(body.password)
      
      const userData = {
        name: body.name,
        email: body.email,
        password: hashedPassword,
        role: body.role || 'user',
        segment_id: body.segment_id || null,
        status: body.status || 'ativo'
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar usuário:', error)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar usuário' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: data,
          message: 'Usuário criado com sucesso'
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // PUT - Atualizar
    if (req.method === 'PUT' && isSpecificId) {
      console.log('PUT - Atualizar usuário:', { lastSegment, isSpecificId, method: req.method });
      const body = await req.json()
      console.log('Body recebido:', body);
      
      // Verificar se o usuário existe antes de atualizar
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('id', lastSegment)
        .single()
      
      console.log('Verificação de existência:', { existingUser, checkError });
      
      if (checkError || !existingUser) {
        console.log('Usuário não encontrado para verificação:', checkError);
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      const { data, error } = await supabase
        .from('users')
        .update(body)
        .eq('id', lastSegment)
        .select()
        .single()

      console.log('Resultado da atualização:', { data, error });

      if (error || !data) {
        console.log('Erro na atualização:', error);
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar usuário' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          user: data,
          message: 'Usuário atualizado com sucesso'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // PATCH - Ativar/Desativar usuários em massa
    if (req.method === 'PATCH' && url.pathname.includes('/activate-all')) {
      const body = await req.json()
      const { status = 'ativo' } = body
      
      // Validar status
      if (!['ativo', 'inativo'].includes(status)) {
        return new Response(
          JSON.stringify({ error: 'Status deve ser "ativo" ou "inativo"' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      const { data, error } = await supabase
        .from('users')
        .update({ status })
        .neq('id', '00000000-0000-0000-0000-000000000000') // Atualizar todos exceto um ID fictício
        .select('id, name, email, status')
      
      if (error) {
        console.error('Erro ao atualizar status dos usuários:', error)
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar status dos usuários' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          message: `${data?.length || 0} usuários foram ${status === 'ativo' ? 'ativados' : 'desativados'}`,
          updated_users: data || [],
          total_updated: data?.length || 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // PATCH - Ativar/Desativar usuário específico
    if (req.method === 'PATCH' && isSpecificId) {
      const body = await req.json()
      const { status } = body
      
      // Validar status
      if (!status || !['ativo', 'inativo'].includes(status)) {
        return new Response(
          JSON.stringify({ error: 'Status deve ser "ativo" ou "inativo"' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      const { data, error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', lastSegment)
        .select()
        .single()
      
      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        JSON.stringify({
          success: true,
          user: data,
          message: `Usuário ${status === 'ativo' ? 'ativado' : 'desativado'} com sucesso`
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
        .from('users')
        .delete()
        .eq('id', lastSegment)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Usuário deletado com sucesso'
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
    console.error('Erro em users:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})