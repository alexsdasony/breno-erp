import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
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
    const isSpecificId = lastSegment && lastSegment !== 'sales' && lastSegment.length > 10

    // GET - Listar todas as vendas com seus itens
    if (req.method === 'GET' && !isSpecificId) {
      const { data: sales, error: salesError } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })

      if (salesError) {
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar vendas' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Buscar itens para cada venda
      const salesWithItems = await Promise.all(
        sales.map(async (sale) => {
          const { data: items, error: itemsError } = await supabase
            .from('sale_items')
            .select('*, products(name, price)')
            .eq('sale_id', sale.id)

          if (itemsError) {
            console.error('Erro ao buscar itens da venda:', itemsError)
            return { ...sale, items: [] }
          }

          // Formatar itens para compatibilidade com o frontend
          const formattedItems = items.map(item => ({
            id: item.id,
            productId: item.product_id,
            productName: item.products?.name || 'Produto não encontrado',
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price
          }))

          return { ...sale, items: formattedItems }
        })
      )

      return new Response(
        JSON.stringify({
          success: true,
          sales: salesWithItems || [],
          total: salesWithItems?.length || 0
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // GET - Buscar venda específica com itens
    if (req.method === 'GET' && isSpecificId) {
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', lastSegment)
        .single()

      if (saleError || !sale) {
        return new Response(
          JSON.stringify({ error: 'Venda não encontrada' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Buscar itens da venda
      const { data: items, error: itemsError } = await supabase
        .from('sale_items')
        .select('*, products(name, price)')
        .eq('sale_id', sale.id)

      if (itemsError) {
        console.error('Erro ao buscar itens da venda:', itemsError)
      }

      // Formatar itens
      const formattedItems = items ? items.map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.products?.name || 'Produto não encontrado',
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price
      })) : []

      return new Response(
        JSON.stringify({
          success: true,
          sale: { ...sale, items: formattedItems }
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // POST - Criar venda com múltiplos produtos
    if (req.method === 'POST') {
      const body = await req.json()
      const { items, ...saleData } = body

      // Validar dados obrigatórios
      if (!saleData.customer_id || !items || items.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Cliente e pelo menos um produto são obrigatórios' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Preparar dados da venda
      const saleToInsert = {
        customer_id: saleData.customer_id,
        customer_name: saleData.customer_name,
        sale_date: saleData.sale_date || saleData.saleDate || new Date().toISOString().split('T')[0],
        total_amount: saleData.total_amount || saleData.totalAmount || 0,
        discount: saleData.discount || 0,
        final_amount: saleData.final_amount || saleData.finalAmount || 0,
        payment_method: saleData.payment_method || saleData.paymentMethod || 'dinheiro',
        status: saleData.status || 'Pendente',
        notes: saleData.notes || '',
        segment_id: saleData.segment_id || saleData.segmentId
      }

      // Inserir venda
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleToInsert)
        .select()
        .single()

      if (saleError) {
        return new Response(
          JSON.stringify({ error: 'Erro ao criar venda: ' + saleError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Inserir itens da venda
      const itemsToInsert = items.map(item => ({
        sale_id: sale.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(itemsToInsert)

      if (itemsError) {
        // Se falhar ao inserir itens, deletar a venda criada
        await supabase.from('sales').delete().eq('id', sale.id)
        return new Response(
          JSON.stringify({ error: 'Erro ao criar itens da venda: ' + itemsError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Buscar venda criada com itens
      const { data: createdSale, error: fetchError } = await supabase
        .from('sales')
        .select('*')
        .eq('id', sale.id)
        .single()

      if (fetchError) {
        return new Response(
          JSON.stringify({ error: 'Erro ao buscar venda criada' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          sale: { ...createdSale, items: itemsToInsert },
          message: 'Venda criada com sucesso'
        }),
        { 
          status: 201, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // PUT - Atualizar venda
    if (req.method === 'PUT' && isSpecificId) {
      const body = await req.json()
      const { items, ...saleData } = body

      // Validar dados obrigatórios
      if (!saleData.customer_id || !items || items.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Cliente e pelo menos um produto são obrigatórios' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Preparar dados da venda
      const saleToUpdate = {
        customer_id: saleData.customer_id,
        customer_name: saleData.customer_name,
        sale_date: saleData.sale_date || saleData.saleDate,
        total_amount: saleData.total_amount || saleData.totalAmount,
        discount: saleData.discount || 0,
        final_amount: saleData.final_amount || saleData.finalAmount,
        payment_method: saleData.payment_method || saleData.paymentMethod,
        status: saleData.status,
        notes: saleData.notes,
        segment_id: saleData.segment_id || saleData.segmentId
      }

      // Atualizar venda
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .update(saleToUpdate)
        .eq('id', lastSegment)
        .select()
        .single()

      if (saleError || !sale) {
        return new Response(
          JSON.stringify({ error: 'Venda não encontrada ou erro ao atualizar' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Deletar itens antigos
      await supabase.from('sale_items').delete().eq('sale_id', lastSegment)

      // Inserir novos itens
      const itemsToInsert = items.map(item => ({
        sale_id: lastSegment,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(itemsToInsert)

      if (itemsError) {
        return new Response(
          JSON.stringify({ error: 'Erro ao atualizar itens da venda: ' + itemsError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          sale: { ...sale, items: itemsToInsert },
          message: 'Venda atualizada com sucesso'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // DELETE - Deletar venda
    if (req.method === 'DELETE' && isSpecificId) {
      // Deletar itens primeiro (devido à foreign key)
      const { error: itemsError } = await supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', lastSegment)

      if (itemsError) {
        return new Response(
          JSON.stringify({ error: 'Erro ao deletar itens da venda' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Deletar venda
      const { error: saleError } = await supabase
        .from('sales')
        .delete()
        .eq('id', lastSegment)

      if (saleError) {
        return new Response(
          JSON.stringify({ error: 'Venda não encontrada' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Venda deletada com sucesso'
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
    console.error('Erro em sales:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})