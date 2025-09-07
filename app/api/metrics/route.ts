import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
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

    // Construir filtros baseados no segmento
    const segmentFilter = segment_id && segment_id !== 'null' && segment_id !== '0' 
      ? { segment_id } 
      : {};

    // Buscar métricas básicas
    const [
      { data: customers, error: customersError },
      { data: suppliers, error: suppliersError },
      { data: products, error: productsError },
      { data: accountsPayable, error: payablesError },
      { data: accountsReceivable, error: receivablesError }
    ] = await Promise.all([
      // Total de clientes
      supabase
        .from('partners')
        .select('id')
        .eq('role', 'customer')
        .match(segmentFilter),
      
      // Total de fornecedores
      supabase
        .from('partners')
        .select('id')
        .eq('role', 'supplier')
        .match(segmentFilter),
      
      // Total de produtos
      supabase
        .from('products')
        .select('id, stock_quantity')
        .match(segmentFilter),
      
      // Contas a pagar
      supabase
        .from('accounts_payable')
        .select('valor, status, data_vencimento')
        .match(segmentFilter),
      
      // Contas a receber (se existir a tabela)
      supabase
        .from('accounts_receivable')
        .select('valor, status, data_vencimento')
        .match(segmentFilter)
        .then(result => result.error ? { data: [], error: null } : result)
    ]);

    if (customersError) console.error('❌ Erro ao buscar clientes:', customersError);
    if (suppliersError) console.error('❌ Erro ao buscar fornecedores:', suppliersError);
    if (productsError) console.error('❌ Erro ao buscar produtos:', productsError);
    if (payablesError) console.error('❌ Erro ao buscar contas a pagar:', payablesError);
    if (receivablesError) console.error('❌ Erro ao buscar contas a receber:', receivablesError);

    // Calcular métricas
    const totalCustomers = customers?.length || 0;
    const totalSuppliers = suppliers?.length || 0;
    const totalProducts = products?.length || 0;
    
    // Produtos com estoque baixo (menos de 10)
    const lowStockCount = products?.filter(p => (p.stock_quantity || 0) < 10).length || 0;
    
    // Contas a pagar pendentes
    const pendingPayables = accountsPayable?.filter(ap => 
      ap.status === 'pendente' || ap.status === 'pending'
    ).length || 0;
    
    // Contas a receber pendentes
    const pendingReceivables = accountsReceivable?.filter(ar => 
      ar.status === 'pendente' || ar.status === 'pending'
    ).length || 0;

    // Calcular valores totais
    const totalPayablesValue = accountsPayable?.reduce((sum, ap) => 
      sum + (Number(ap.valor) || 0), 0) || 0;
    
    const totalReceivablesValue = accountsReceivable?.reduce((sum, ar) => 
      sum + (Number(ar.valor) || 0), 0) || 0;

    // Calcular Receita Total (contas a receber pagas)
    const totalRevenue = accountsReceivable?.filter(ar => 
      ar.status === 'paga' || ar.status === 'paid'
    ).reduce((sum, ar) => sum + (Number(ar.valor) || 0), 0) || 0;

    // Calcular Despesas (contas a pagar pagas)
    const totalExpenses = accountsPayable?.filter(ap => 
      ap.status === 'paga' || ap.status === 'paid'
    ).reduce((sum, ap) => sum + (Number(ap.valor) || 0), 0) || 0;

    // Calcular Lucro (Receita - Despesas)
    const totalProfit = totalRevenue - totalExpenses;

    // Gerar série de dados para gráficos (últimos 7 dias)
    const seriesDays = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      seriesDays.push({
        date: dateStr,
        sales: Math.floor(Math.random() * 10), // Mock data
        revenue: Math.floor(Math.random() * 1000),
        payables: Math.floor(Math.random() * 500),
        receivables: Math.floor(Math.random() * 800),
        cash_in: Math.floor(Math.random() * 1200),
        cash_out: Math.floor(Math.random() * 600)
      });
    }

    const metrics = {
      total_sales: Math.floor(Math.random() * 100), // Mock data
      total_revenue: totalRevenue, // Receita real das contas a receber pagas
      total_expenses: totalExpenses, // Despesas reais das contas a pagar pagas
      total_profit: totalProfit, // Lucro real (Receita - Despesas)
      avg_ticket: totalRevenue > 0 ? Math.floor(totalRevenue / Math.max(totalCustomers, 1)) : 0,
      total_customers: totalCustomers,
      total_suppliers: totalSuppliers,
      total_products: totalProducts,
      low_stock_count: lowStockCount,
      pending_invoices: pendingReceivables,
      pending_payables: pendingPayables,
      total_payables_value: totalPayablesValue,
      total_receivables_value: totalReceivablesValue,
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
