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
    const path = url.pathname.split('/').pop()

    // Endpoint /profile - GET
    if (req.method === 'GET' && path === 'profile') {
      const authHeader = req.headers.get('authorization')
      const userToken = req.headers.get('x-user-token')

      if (!authHeader && !userToken) {
        return new Response(
          JSON.stringify({ error: 'Token de autenticação não fornecido' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      try {
        // Decodificar token simples (base64)
        const token = userToken || authHeader?.replace('Bearer ', '')
        if (!token) {
          throw new Error('Token inválido')
        }

        const decodedToken = JSON.parse(atob(token))
        
        // Buscar dados atualizados do usuário
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', decodedToken.id)
          .eq('status', 'ativo')
          .single()

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: 'Usuário não encontrado' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        // Retornar dados do usuário (sem senha)
        const { password: _, ...userWithoutPassword } = user

        return new Response(
          JSON.stringify({
            success: true,
            user: userWithoutPassword
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )

      } catch (tokenError) {
        return new Response(
          JSON.stringify({ error: 'Token inválido' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Endpoint de login - POST
    if (req.method === 'POST') {
      const { email, password } = await req.json()

      if (!email || !password) {
        return new Response(
          JSON.stringify({ error: 'Email e senha são obrigatórios' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Buscar usuário no Supabase
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('status', 'ativo')
        .limit(1)

      if (queryError) {
        console.error('Erro ao buscar usuário:', queryError)
        return new Response(
          JSON.stringify({ error: 'Erro interno do servidor' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (!users || users.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Usuário não encontrado' }),
          { 
            status: 401, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const user = users[0]

      // Por enquanto, aceitar qualquer senha para teste
      // TODO: Implementar verificação de senha com bcrypt

      // Gerar token simples
      const token = btoa(JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        segment_id: user.segment_id
      }))

      // Retornar dados do usuário (sem senha)
      const { password: _, ...userWithoutPassword } = user

      return new Response(
        JSON.stringify({
          success: true,
          token,
          user: userWithoutPassword,
          message: 'Login realizado com sucesso'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Método não suportado
    return new Response(
      JSON.stringify({ error: 'Método não suportado' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro no auth:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 