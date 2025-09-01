import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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

    // GET - Listar todos (fonte única: partners com role 'customer')
    if (req.method === 'GET' && !isSpecificId) {
      // buscar ids com role 'customer'
      const { data: roleRows, error: roleErr } = await supabase
        .from('partner_roles')
        .select('partner_id')
        .eq('role', 'customer')

      if (roleErr) {
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar roles de clientes' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const ids = (roleRows || []).map((r: any) => r.partner_id)
      let query = supabase.from('partners').select('*')
      if (ids.length > 0) query = query.in('id', ids)
      query = query.order('created_at', { ascending: false })
      const { data, error } = await query

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar clientes' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, customers: data || [], total: data?.length || 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET - Buscar por ID (partner com role customer)
    if (req.method === 'GET' && isSpecificId) {
      // valida se existe partner
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', lastSegment)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Cliente não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, customer: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - Criar (insere em partners e vincula role 'customer')
    if (req.method === 'POST') {
      const body = await req.json()
      
      // Validações obrigatórias
      const validationErrors: string[] = []
      
      if (!body.name?.trim()) {
        validationErrors.push('Nome é obrigatório')
      }
      
      if (!body.tax_id?.trim()) {
        validationErrors.push(body.tipo_pessoa === 'pf' ? 'CPF é obrigatório' : 'CNPJ é obrigatório')
      } else {
        // Validação básica de formato CPF/CNPJ
        const cleanTaxId = body.tax_id.replace(/\D/g, '')
        if (body.tipo_pessoa === 'pf' && cleanTaxId.length !== 11) {
          validationErrors.push('CPF deve ter 11 dígitos')
        } else if (body.tipo_pessoa === 'pj' && cleanTaxId.length !== 14) {
          validationErrors.push('CNPJ deve ter 14 dígitos')
        }
      }
      
      // Validação de email se fornecido
      if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        validationErrors.push('Email inválido')
      }
      
      // Validação de CEP se fornecido
      if (body.zip_code && !/^\d{5}-?\d{3}$/.test(body.zip_code)) {
        validationErrors.push('CEP inválido')
      }
      
      if (validationErrors.length > 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Dados inválidos', 
            details: validationErrors,
            field_count: validationErrors.length
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Verificar se tax_id já existe
      const { data: existingPartner } = await supabase
        .from('partners')
        .select('id, name')
        .eq('tax_id', body.tax_id)
        .single()
        
      if (existingPartner) {
        return new Response(
          JSON.stringify({ 
            error: 'Documento já cadastrado', 
            details: [`${body.tipo_pessoa === 'pf' ? 'CPF' : 'CNPJ'} já está em uso por: ${existingPartner.name}`]
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // Tratar campos de data vazios e mapear status
      const sanitizedBody = {
        ...body,
        data_nascimento: body.data_nascimento?.trim() || null,
        data_admissao: body.data_admissao?.trim() || null,
        data_cadastro: body.data_cadastro?.trim() || null,
        status: body.status === 'ativo' ? 'active' : 
                body.status === 'inativo' ? 'inactive' : 
                body.status === 'suspenso' ? 'suspended' : 
                body.status || 'active'
      }
      
      const { data, error } = await supabase
        .from('partners')
        .insert(sanitizedBody)
        .select('*')
        .single()

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Erro interno do servidor', 
            details: ['Falha ao inserir dados no banco'],
            db_error: error.message
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // vincula role
      const { error: roleError } = await supabase
        .from('partner_roles')
        .insert({ partner_id: (data as any).id, role: 'customer' })
        
      if (roleError) {
        console.error('Role assignment error:', roleError)
        // Não falha a operação, apenas loga o erro
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          customer: data, 
          message: 'Cliente criado com sucesso',
          id: data.id
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT - Atualizar (atualiza partners)
    if (req.method === 'PUT' && isSpecificId) {
      const body = await req.json()
      const { data, error } = await supabase
        .from('partners')
        .update(body)
        .eq('id', lastSegment)
        .select('*')
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Cliente não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, customer: data, message: 'Cliente atualizado com sucesso' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE - Deletar (remove em partners e roles por FK cascade ou explicitamente)
    if (req.method === 'DELETE' && isSpecificId) {
      const { error } = await supabase
        .from('partners')
        .delete()
        .eq('id', lastSegment)

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Cliente não encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Cliente deletado com sucesso' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro em customers:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})