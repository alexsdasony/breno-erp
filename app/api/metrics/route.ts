import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

/**
 * Dashboard: padrão = mês corrente (timezone do servidor).
 * Histórico: use tag (7d, 30d, 90d, 6mo, 1yr, last-year) ou filterby=custom com from/to.
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const segment_id = searchParams.get('segment_id');
    const filterby = searchParams.get('filterby') || 'day';
    const tag = searchParams.get('tag');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let firstDayStr: string;
    let lastDayStr: string;
    let useCurrentMonth = !tag || tag === 'current_month';

    if (useCurrentMonth) {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      startDate = firstDayOfMonth;
      endDate = new Date(lastDayOfMonth.getFullYear(), lastDayOfMonth.getMonth(), lastDayOfMonth.getDate(), 23, 59, 59, 999);
      firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
      lastDayStr = lastDayOfMonth.toISOString().split('T')[0];
    } else if (filterby === 'custom' && from && to) {
      startDate = new Date(from + 'T00:00:00');
      endDate = new Date(to + 'T23:59:59.999');
      firstDayStr = from;
      lastDayStr = to;
    } else {
      switch (tag) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = new Date(now);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = new Date(now);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          endDate = new Date(now);
          break;
        case '6mo':
          startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
          endDate = new Date(now);
          break;
        case '1yr':
          startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          endDate = new Date(now);
          break;
        case 'last-year':
          startDate = new Date(now.getFullYear() - 1, 0, 1);
          endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
          break;
        default:
          if (tag && /^20\d{2}$/.test(tag)) {
            startDate = new Date(parseInt(tag, 10), 0, 1);
            endDate = new Date(parseInt(tag, 10), 11, 31, 23, 59, 59, 999);
          } else {
            useCurrentMonth = true;
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            startDate = firstDayOfMonth;
            endDate = new Date(lastDayOfMonth.getFullYear(), lastDayOfMonth.getMonth(), lastDayOfMonth.getDate(), 23, 59, 59, 999);
          }
          break;
      }
      firstDayStr = startDate.toISOString().split('T')[0];
      lastDayStr = endDate.toISOString().split('T')[0];
    }

    console.log('📊 Dashboard metrics:', { firstDayStr, lastDayStr, tag, segment_id });

    const hasSegmentFilter = segment_id && segment_id !== 'null' && segment_id !== '0';
    const segmentFilter = hasSegmentFilter ? { segment_id } : {};

    // Queries com filtro de data do mês corrente
    const [
      { data: customers, error: customersError },
      { data: suppliers, error: suppliersError },
      { data: products, error: productsError },
      { data: accountsPayable, error: payablesError },
      { data: billings, error: billingsError },
      { data: sales, error: salesError }
    ] = await Promise.all([
      supabaseAdmin
        .from('partners')
        .select('id, status, partner_roles!inner(role)')
        .eq('partner_roles.role', 'customer')
        .match(segmentFilter),
      supabaseAdmin
        .from('partners')
        .select('id, partner_roles!inner(role)')
        .eq('partner_roles.role', 'supplier')
        .match(segmentFilter),
      supabaseAdmin
        .from('products')
        .select('id, stock_quantity')
        .match(segmentFilter),
      supabaseAdmin
        .from('accounts_payable')
        .select('valor, status, data_vencimento')
        .gte('data_vencimento', firstDayStr)
        .lte('data_vencimento', lastDayStr)
        .match(segmentFilter),
      supabaseAdmin
        .from('billings')
        .select('amount, status, due_date')
        .eq('is_deleted', false)
        .gte('due_date', firstDayStr)
        .lte('due_date', lastDayStr)
        .match(segmentFilter),
      supabaseAdmin
        .from('sales')
        .select('id, total_amount, created_at, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .match(segmentFilter)
    ]);

    if (customersError) console.error('❌ Erro ao buscar clientes:', customersError);
    if (suppliersError) console.error('❌ Erro ao buscar fornecedores:', suppliersError);
    if (productsError) console.error('❌ Erro ao buscar produtos:', productsError);
    if (payablesError) console.error('❌ Erro ao buscar contas a pagar:', payablesError);
    if (billingsError) console.error('❌ Erro ao buscar cobranças:', billingsError);
    if (salesError) console.error('❌ Erro ao buscar vendas:', salesError);

    // Receita/Despesas/Lucro: apenas documentos do mês corrente (issue_date)
    let fdQuery = supabaseAdmin
      .from('financial_documents')
      .select('amount, direction, issue_date')
      .eq('is_deleted', false)
      .gte('issue_date', firstDayStr)
      .lte('issue_date', lastDayStr);
    if (hasSegmentFilter) {
      fdQuery = fdQuery.eq('segment_id', segment_id);
    }
    const FD_CHUNK = 1000;
    const financialDocuments: any[] = [];
    let fdOffset = 0;
    let fdHasMore = true;
    while (fdHasMore) {
      const { data: fdChunk, error: financialError } = await fdQuery.range(fdOffset, fdOffset + FD_CHUNK - 1);
      if (financialError) {
        console.error('❌ Erro ao buscar documentos financeiros:', financialError);
        break;
      }
      const rows = fdChunk || [];
      financialDocuments.push(...rows);
      fdHasMore = rows.length >= FD_CHUNK;
      fdOffset += FD_CHUNK;
    }
    console.log('📄 [metrics] Documentos financeiros (paginado, alinhado a financial-kpis):', financialDocuments.length);

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

    // Agregação idêntica a /api/financial-kpis: entradas = receivable, saidas = payable, só financial_documents
    const receivables = financialDocuments.filter((fd: any) => fd.direction === 'receivable');
    const payables = financialDocuments.filter((fd: any) => fd.direction === 'payable');
    const entradas = receivables.reduce((sum: number, fd: any) => sum + (Number(fd.amount) || 0), 0);
    const saidas = payables.reduce((sum: number, fd: any) => sum + (Number(fd.amount) || 0), 0);

    const totalRevenue = entradas;
    const totalExpenses = saidas;

    console.log('📊 [metrics] Receita/Despesas/Lucro (fiel a financial-kpis):', {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      receivables: receivables.length,
      payables: payables.length
    });

    // Série por dia para gráficos: até 31 pontos (mês = todos os dias; períodos longos = amostrados)
    const seriesDays: Array<{ date: string; sales: number; revenue: number; payables: number; receivables: number; cash_in: number; cash_out: number }> = [];
    const dayStrings: string[] = [];
    for (let t = startDate.getTime(); t <= endDate.getTime(); t += 24 * 60 * 60 * 1000) {
      dayStrings.push(new Date(t).toISOString().split('T')[0]);
    }
    const maxPoints = 31;
    const toIterate = dayStrings.length === 0
      ? []
      : dayStrings.length <= maxPoints
        ? dayStrings
        : Array.from({ length: maxPoints }, (_, i) => dayStrings[Math.min(Math.floor((i * (dayStrings.length - 1)) / (maxPoints - 1)), dayStrings.length - 1)]);
    for (const dateStr of toIterate) {
      const daySales = sales?.filter(sale => {
        const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
        return saleDate === dateStr;
      }) || [];
      const dayRevenue = daySales.reduce((sum, sale) => sum + (Number(sale.total_amount) || 0), 0);
      const dayPayables = accountsPayable?.filter(ap => {
        const payableDate = new Date(ap.data_vencimento).toISOString().split('T')[0];
        return payableDate === dateStr;
      }) || [];
      const dayPayablesValue = dayPayables.reduce((sum, ap) => sum + (Number(ap.valor) || 0), 0);
      const dayBillings = billings?.filter(b => {
        const billingDate = new Date(b.due_date).toISOString().split('T')[0];
        return billingDate === dateStr;
      }) || [];
      const dayBillingsValue = dayBillings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
      seriesDays.push({
        date: dateStr,
        sales: daySales.length,
        revenue: dayRevenue,
        payables: dayPayablesValue,
        receivables: dayBillingsValue,
        cash_in: dayRevenue + dayBillingsValue,
        cash_out: dayPayablesValue
      });
    }

    const metrics = {
      total_sales: totalSales,
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      net_profit: totalRevenue - totalExpenses,
      avg_ticket: avgTicket,
      total_customers: totalCustomers,
      active_customers: activeCustomers,
      total_suppliers: totalSuppliers,
      total_products: totalProducts,
      low_stock_count: lowStockCount,
      pending_invoices: pendingBillings,
      pending_payables: pendingPayables,
      total_payables_value: accountsPayableValue,
      total_receivables_value: totalBillingsValue,
      series_days: seriesDays,
      current_month_start: firstDayStr,
      current_month_end: lastDayStr,
      current_month_label: `${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
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
