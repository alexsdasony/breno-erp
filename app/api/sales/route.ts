import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';
import { createAuditLog } from '@/lib/createAuditLog';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const segmentId = searchParams.get('segment_id');
    const dateStart = searchParams.get('dateStart');
    const dateEnd = searchParams.get('dateEnd');

    console.log('🛒 Sales API request:', { page, pageSize, segmentId, dateStart, dateEnd });

    // Buscar vendas com dados do cliente usando uma abordagem mais robusta
    let query = supabaseAdmin
      .from('sales')
      .select('*')
      .eq('is_deleted', false)
      .order('sale_date', { ascending: false });

    // Filtrar por segmento se fornecido
    if (segmentId && segmentId !== 'null' && segmentId !== '0') {
      query = query.eq('segment_id', segmentId);
    }

    // Filtro por período (padrão: mês corrente se não informado)
    if (dateStart && /^\d{4}-\d{2}-\d{2}$/.test(dateStart)) {
      query = query.gte('sale_date', dateStart);
    }
    if (dateEnd && /^\d{4}-\d{2}-\d{2}$/.test(dateEnd)) {
      query = query.lte('sale_date', dateEnd);
    }

    const { data: sales, error } = await query;

    if (error) {
      console.error('❌ Erro ao buscar vendas:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar vendas',
          details: error.message
        },
        { status: 500 }
      );
    }

    // Buscar dados dos clientes e itens para vendas que têm customer_id
    const salesWithCustomerData = await Promise.all(
      (sales || []).map(async (sale) => {
        let customer: any = null;
        let items: any[] = [];

        // Buscar dados do cliente se existir
        if (sale.customer_id) {
          try {
            const { data: customerData } = await supabaseAdmin
              .from('partners')
              .select('id, name, email, phone')
              .eq('id', sale.customer_id)
              .single();
            customer = customerData;
          } catch (error) {
            console.warn(`⚠️ Cliente não encontrado para venda ${sale.id}:`, error);
          }
        }

        // Buscar itens da venda
        try {
          const { data: saleItems } = await supabaseAdmin
            .from('sale_items')
            .select(`
              id,
              product_id,
              quantity,
              unit_price,
              total_price,
              product:products(
                id,
                name,
                price
              )
            `)
            .eq('sale_id', sale.id);

          items = saleItems || [];
        } catch (error) {
          console.warn(`⚠️ Erro ao buscar itens da venda ${sale.id}:`, error);
        }
        
        return {
          ...sale,
          customer,
          items
        };
      })
    );

    // Aplicar paginação
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSales = salesWithCustomerData.slice(startIndex, endIndex);

    console.log('📊 Vendas encontradas:', salesWithCustomerData.length);

    return NextResponse.json({
      success: true,
      sales: paginatedSales,
      pagination: {
        page,
        pageSize,
        total: salesWithCustomerData.length,
        totalPages: Math.ceil(salesWithCustomerData.length / pageSize)
      }
    });

  } catch (error) {
    console.error('❌ Erro na API sales:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    const body = await request.json();
    console.log('🛒 Criando nova venda:', body);

    // Separar dados da venda dos itens
    const { items, ...saleData } = body;
    
    // Validar dados obrigatórios
    if (!saleData.customer_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID do cliente é obrigatório'
        },
        { status: 400 }
      );
    }

    // Verificar se o cliente existe
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('partners')
      .select('id, name')
      .eq('id', saleData.customer_id)
      .single();

    if (customerError || !customer) {
      console.error('❌ Cliente não encontrado:', customerError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Cliente não encontrado'
        },
        { status: 400 }
      );
    }
    
    // Buscar o nome do método de pagamento se for um ID
    let paymentMethodName = saleData.payment_method || 'dinheiro';
    if (saleData.payment_method && saleData.payment_method !== 'dinheiro') {
      try {
        const { data: paymentMethod } = await supabaseAdmin
          .from('payment_methods')
          .select('name')
          .eq('id', saleData.payment_method)
          .single();
        
        if (paymentMethod) {
          paymentMethodName = paymentMethod.name;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao buscar método de pagamento:', error);
        // Manter o valor original se não conseguir buscar
      }
    }

    // Preparar dados para inserção da venda com estrutura consistente
    const insertData = {
      customer_id: saleData.customer_id,
      customer_name: saleData.customer_name || customer.name, // Usar o nome enviado pelo frontend ou o do banco
      sale_date: saleData.sale_date || new Date().toISOString().split('T')[0],
      total_amount: saleData.total_amount || 0,
      payment_method: paymentMethodName, // Usar o nome do método de pagamento
      status: saleData.status || 'Pendente',
      notes: saleData.notes || null,
      segment_id: saleData.segment_id === '' ? null : saleData.segment_id,
      is_deleted: false,
      // Campos obrigatórios para compatibilidade com estrutura antiga
      quantity: 1, // Valor padrão
      total: saleData.total_amount || 0,
      date: saleData.sale_date || new Date().toISOString().split('T')[0],
      product: 'Produto da venda' // Valor padrão
    };
    
    console.log('🧹 Dados para inserção da venda:', insertData);

    // Inserir a venda primeiro
    const { data: sale, error: saleError } = await supabaseAdmin
      .from('sales')
      .insert([insertData])
      .select()
      .single();

    if (saleError) {
      console.error('❌ Erro ao criar venda:', saleError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Erro ao criar venda',
          details: saleError.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Venda criada:', sale);
    
    // Criar log de auditoria
    await createAuditLog(
      'CREATE',
      'sales',
      sale.id,
      null,
      { 
        customer_name: sale.customer_name, 
        total_amount: sale.total_amount, 
        payment_method: sale.payment_method,
        status: sale.status 
      },
      null,
      'admin@erppro.com'
    );

    // Inserir os itens da venda se existirem
    if (items && items.length > 0) {
      const saleItems = items.map((item: any) => ({
        sale_id: sale.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total || (item.quantity * item.unit_price)
      }));

      console.log('🧹 Dados para inserção dos itens:', saleItems);

      const { error: itemsError } = await supabaseAdmin
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        console.error('❌ Erro ao criar itens da venda:', itemsError);
        // Não falhar a operação, apenas logar o erro
      } else {
        console.log('✅ Itens da venda criados');
      }
    }

    // Retornar a venda com dados do cliente
    const responseData = {
      ...sale,
      customer: {
        id: customer.id,
        name: customer.name
      }
    };

    return NextResponse.json({
      success: true,
      sale: responseData
    });

  } catch (error) {
    console.error('❌ Erro ao criar venda:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
