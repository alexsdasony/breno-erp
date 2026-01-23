import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const filterby = searchParams.get('filterby') || 'day';
    const tag = searchParams.get('tag') || '7d';
    const segment_id = searchParams.get('segment_id');

    console.log('📊 Dashboard metrics request:', { filterby, tag, segment_id });

    // Calcular datas baseado no período
    const now = new Date();
    let startDate: Date;
    let endDate = new Date(now);

    switch (tag) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6mo':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case '1yr':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'last-year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    console.log('📅 Date range:', { startDate: startDate.toISOString(), endDate: endDate.toISOString() });

    // CORREÇÃO: Construir filtros baseados no segmento de forma mais consistente
    const hasSegmentFilter = segment_id && segment_id !== 'null' && segment_id !== '0';
    const segmentFilter = hasSegmentFilter ? { segment_id } : {};
    
    console.log('🔍 Filtro de segmento aplicado:', { segment_id, hasSegmentFilter, segmentFilter });

    // Buscar métricas básicas
    const [
      { data: customers, error: customersError },
      { data: suppliers, error: suppliersError },
      { data: products, error: productsError },
      { data: accountsPayable, error: payablesError },
      { data: billings, error: billingsError },
      { data: sales, error: salesError },
      { data: financialDocuments, error: financialError }
    ] = await Promise.all([
      // Total de clientes
      supabaseAdmin
        .from('partners')
        .select('id, status, partner_roles!inner(role)')
        .eq('partner_roles.role', 'customer')
        .match(segmentFilter),
      
      // Total de fornecedores
      supabaseAdmin
        .from('partners')
        .select('id, partner_roles!inner(role)')
        .eq('partner_roles.role', 'supplier')
        .match(segmentFilter),
      
      // Total de produtos
      supabaseAdmin
        .from('products')
        .select('id, stock_quantity')
        .match(segmentFilter),
      
      // Contas a pagar
      supabaseAdmin
        .from('accounts_payable')
        .select('valor, status, data_vencimento')
        .match(segmentFilter),
      
      // Cobranças (billings)
      supabaseAdmin
        .from('billings')
        .select('amount, status, due_date')
        .eq('is_deleted', false)
        .match(segmentFilter),
      
      // Vendas reais
      supabaseAdmin
        .from('sales')
        .select('id, total_amount, created_at, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .match(segmentFilter),
      
                   // CORREÇÃO: Documentos financeiros - aplicar filtro de segmento corretamente
       (() => {
         let query = supabaseAdmin
           .from('financial_documents')
           .select('amount, direction, status, issue_date, created_at, segment_id');
         
         // Aplicar filtro de segmento apenas se fornecido
         if (hasSegmentFilter) {
           // Quando há filtro de segmento: buscar apenas documentos daquele segmento
           query = query.eq('segment_id', segment_id);
         }
         // Se não há filtro (todos os segmentos): buscar TODOS (incluindo NULL)
         // Registros com segment_id = NULL são despesas/receitas gerais
         
         return query;
       })()
    ]);

    if (customersError) console.error('❌ Erro ao buscar clientes:', customersError);
    if (suppliersError) console.error('❌ Erro ao buscar fornecedores:', suppliersError);
    if (productsError) console.error('❌ Erro ao buscar produtos:', productsError);
    if (payablesError) console.error('❌ Erro ao buscar contas a pagar:', payablesError);
    if (billingsError) console.error('❌ Erro ao buscar cobranças:', billingsError);
    if (salesError) console.error('❌ Erro ao buscar vendas:', salesError);
    if (financialError) console.error('❌ Erro ao buscar documentos financeiros:', financialError);

    // Calcular métricas
    const totalCustomers = customers?.length || 0;
    const activeCustomers = customers?.filter(c => c.status === 'active').length || 0;
    const totalSuppliers = suppliers?.length || 0;
    const totalProducts = products?.length || 0;
    
    // Produtos com estoque baixo (menos de 10)
    const lowStockCount = products?.filter(p => (p.stock_quantity || 0) < 10).length || 0;
    
    // Contas a pagar pendentes
    const pendingPayables = accountsPayable?.filter(ap => 
      ap.status === 'pendente' || ap.status === 'pending'
    ).length || 0;
    
    // Cobranças pendentes (billings)
    const pendingBillings = billings?.filter(b => {
      const status = b.status?.toLowerCase() || '';
      return status === 'pendente' || status === 'pending';
    }).length || 0;

    // Calcular valores totais
    const accountsPayableValue = accountsPayable?.reduce((sum, ap) => 
      sum + (Number(ap.valor) || 0), 0) || 0;
    
    const totalBillingsValue = billings?.reduce((sum, b) => {
      const status = b.status?.toLowerCase() || '';
      if (status === 'pendente' || status === 'pending') {
        return sum + (Number(b.amount) || 0);
      }
      return sum;
    }, 0) || 0;

    // Calcular métricas reais de vendas
    const totalSales = sales?.length || 0;
    const salesRevenue = sales?.reduce((sum, sale) => 
      sum + (Number(sale.total_amount) || 0), 0) || 0;
    const avgTicket = totalSales > 0 ? salesRevenue / totalSales : 0;

    // Calcular receitas e despesas dos documentos financeiros
    console.log('📄 Documentos financeiros encontrados:', financialDocuments?.length || 0);
    
    // CORREÇÃO: Usar TODOS os documentos financeiros (removido filtro de data restritivo)
    // O filtro de data estava causando problemas quando não havia dados no período
    const filteredFinancialDocs = financialDocuments || [];
    
    const financialRevenue = filteredFinancialDocs?.filter(fd => fd.direction === 'receivable')
      .reduce((sum, fd) => sum + (Number(fd.amount) || 0), 0) || 0;
    
    const financialExpenses = filteredFinancialDocs?.filter(fd => fd.direction === 'payable')
      .reduce((sum, fd) => sum + (Number(fd.amount) || 0), 0) || 0;
    
    console.log('📊 Documentos por direção:', {
      total: financialDocuments?.length || 0,
      filtered: filteredFinancialDocs?.length || 0,
      receivables: filteredFinancialDocs?.filter(fd => fd.direction === 'receivable').length || 0,
      payables: filteredFinancialDocs?.filter(fd => fd.direction === 'payable').length || 0
    });

    // CORREÇÃO: Receita total = APENAS documentos financeiros receivables (evitar duplicação com sales)
    // Se não há documentos financeiros, usar vendas como fallback
    const totalRevenue = financialRevenue > 0 ? financialRevenue : salesRevenue;
    
    // CORREÇÃO: Despesas totais = documentos financeiros payable + contas a pagar
    const totalExpenses = financialExpenses + accountsPayableValue;
    
    console.log('💰 Cálculo de receitas e despesas:', {
      salesRevenue,
      financialRevenue,
      financialExpenses,
      accountsPayableValue,
      totalRevenue,
      totalExpenses
    });

    console.log('📊 Dados reais de vendas:', { 
      totalSales, 
      totalRevenue, 
      avgTicket,
      salesCount: sales?.length || 0 
    });

    // Gerar série de dados reais para gráficos (últimos 7 dias)
    const seriesDays = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Buscar vendas do dia específico
      const daySales = sales?.filter(sale => {
        const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
        return saleDate === dateStr;
      }) || [];
      
      const dayRevenue = daySales.reduce((sum, sale) => 
        sum + (Number(sale.total_amount) || 0), 0);
      
      // Buscar contas a pagar do dia
      const dayPayables = accountsPayable?.filter(ap => {
        const payableDate = new Date(ap.data_vencimento).toISOString().split('T')[0];
        return payableDate === dateStr;
      }) || [];
      
      const dayPayablesValue = dayPayables.reduce((sum, ap) => 
        sum + (Number(ap.valor) || 0), 0);
      
      // Buscar cobranças do dia (billings)
      const dayBillings = billings?.filter(b => {
        const billingDate = new Date(b.due_date).toISOString().split('T')[0];
        return billingDate === dateStr;
      }) || [];
      
      const dayBillingsValue = dayBillings.reduce((sum, b) => 
        sum + (Number(b.amount) || 0), 0);
      
      seriesDays.push({
        date: dateStr,
        sales: daySales.length,
        revenue: dayRevenue,
        payables: dayPayablesValue,
        receivables: dayBillingsValue, // Usar cobranças (billings)
        cash_in: dayRevenue + dayBillingsValue,
        cash_out: dayPayablesValue
      });
    }

    const metrics = {
      total_sales: totalSales,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses, // CORREÇÃO: Usar totalExpenses (financial + payables)
      net_profit: totalRevenue - totalExpenses, // CORREÇÃO: Usar totalExpenses
      avg_ticket: avgTicket,
      total_customers: totalCustomers,
      active_customers: activeCustomers,
      total_suppliers: totalSuppliers,
      total_products: totalProducts,
      low_stock_count: lowStockCount,
      pending_invoices: pendingBillings, // Usar cobranças (billings)
      pending_payables: pendingPayables,
      total_payables_value: accountsPayableValue,
      total_receivables_value: totalBillingsValue, // Valor total de cobranças pendentes
      series_days: seriesDays
    };

    console.log('📊 Métricas calculadas:', metrics);

    return NextResponse.json({
      success: true,
      metrics
    });

  } catch (error) {
    console.error('❌ Erro na API metrics:', error);
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
