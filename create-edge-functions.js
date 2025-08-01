#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Lista de endpoints para criar
const endpoints = [
  { name: 'transactions', displayName: 'Transação' },
  { name: 'customers', displayName: 'Cliente' },
  { name: 'products', displayName: 'Produto' },
  { name: 'sales', displayName: 'Venda' },
  { name: 'billings', displayName: 'Cobrança' },
  { name: 'cost-centers', displayName: 'Centro de Custo' },
  { name: 'accounts-payable', displayName: 'Conta a Pagar' },
  { name: 'nfe', displayName: 'NFe' },
  { name: 'integrations', displayName: 'Integração' },
  { name: 'metrics', displayName: 'Métrica' },
  { name: 'users', displayName: 'Usuário' },
  { name: 'receita', displayName: 'Receita' }
];

// Template para Edge Function
const edgeFunctionTemplate = (name, displayName) => `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    // GET - Listar todos
    if (req.method === 'GET' && !path) {
      const { data, error } = await supabase
        .from('${name.replace('-', '_')}')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar ${displayName.toLowerCase()}s' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          ${name.replace('-', '_')}: data || [],
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
        .from('${name.replace('-', '_')}')
        .select('*')
        .eq('id', path)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: '${displayName} não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          ${name.replace('-', '_').replace('s', '')}: data
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
        .from('${name.replace('-', '_')}')
        .insert(body)
        .select()
        .single()

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Erro ao criar ${displayName.toLowerCase()}' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          ${name.replace('-', '_').replace('s', '')}: data,
          message: '${displayName} criado com sucesso'
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
        .from('${name.replace('-', '_')}')
        .update(body)
        .eq('id', path)
        .select()
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: '${displayName} não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          ${name.replace('-', '_').replace('s', '')}: data,
          message: '${displayName} atualizado com sucesso'
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
        .from('${name.replace('-', '_')}')
        .delete()
        .eq('id', path)

      if (error) {
        return new Response(
          JSON.stringify({ error: '${displayName} não encontrado' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: '${displayName} deletado com sucesso'
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
    console.error('Erro em ${name}:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})`;

// Criar as Edge Functions
endpoints.forEach(endpoint => {
  const functionPath = `supabase/functions/${endpoint.name}`;
  const indexPath = `${functionPath}/index.ts`;
  
  // Criar diretório se não existir
  if (!fs.existsSync(functionPath)) {
    fs.mkdirSync(functionPath, { recursive: true });
  }
  
  // Criar arquivo index.ts
  fs.writeFileSync(indexPath, edgeFunctionTemplate(endpoint.name, endpoint.displayName));
  
  console.log(`✅ Criada Edge Function: ${endpoint.name}`);
});

console.log('\n🎉 Todas as Edge Functions foram criadas!');
console.log('\n📋 Próximos passos:');
console.log('1. Fazer deploy das Edge Functions:');
console.log('   cd supabase && npx supabase functions deploy --all');
console.log('\n2. Atualizar VITE_API_URL na Vercel para:');
console.log('   https://qerubjitetqwfqqydhzv.supabase.co/functions/v1');
console.log('\n3. Testar os endpoints no frontend'); 