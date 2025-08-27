// @ts-ignore - Deno imports
import { serve } from "https://deno.land/std@0.202.0/http/server.ts"
// @ts-ignore - Deno imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true'
}

// Simple deterministic pseudo-random generator (seeded per day)
function seededRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    // xorshift32
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    // Map to [0, 1)
    return ((s >>> 0) % 1_000_000) / 1_000_000;
  };
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

function randInt(r: () => number, min: number, max: number) {
  return Math.floor(r() * (max - min + 1)) + min;
}

// Utility function to convert period strings to date ranges
// Nova lógica de parse de datas
function parseDateRange(filterby?: string, tag?: string, from?: string, to?: string) {
  console.log('parseDateRange input:', { filterby, tag, from, to });
  
  // Se from e to estiverem definidos, use-os diretamente
  if (from && to) {
    return { start_date: from, end_date: to };
  }
  
  // Se period/filterby for 'custom', mas não tiver from/to, retorne vazio
  if ((filterby === 'custom' || filterby === 'period') && (!from || !to)) {
    return {};
  }
  
  const today = new Date();
  let start_date: Date;
  let end_date = new Date(today);
  
  // Processar filterby e tag
  if (filterby === 'year' && tag) {
    if (tag === '1yr') {
      // Último ano completo
      start_date = new Date(today);
      start_date.setFullYear(today.getFullYear() - 1);
    } else if (tag === 'last-year') {
      // Ano passado (ano anterior completo)
      start_date = new Date(today.getFullYear() - 1, 0, 1); // 1º de janeiro do ano passado
      end_date = new Date(today.getFullYear() - 1, 11, 31); // 31 de dezembro do ano passado
    } else {
      // Ano específico: 2021, 2022, etc.
      const year = parseInt(tag);
      start_date = new Date(year, 0, 1); // 1º de janeiro
      end_date = new Date(year, 11, 31); // 31 de dezembro
    }
  } 
  else if (filterby === 'month' && tag) {
    if (tag === '6mo') {
      // Últimos 6 meses
      start_date = new Date(today);
      start_date.setMonth(today.getMonth() - 6);
    } else {
      // Mês específico: formato YYYY-MM
      const [year, month] = tag.split('-').map(Number);
      start_date = new Date(year, month - 1, 1); // Primeiro dia do mês
      end_date = new Date(year, month, 0); // Último dia do mês
    }
  }
  else if (filterby === 'day' && tag) {
    if (tag === '7d') {
      // Últimos 7 dias
      start_date = new Date(today);
      start_date.setDate(today.getDate() - 6); // Hoje + 6 dias anteriores = 7 dias
    } 
    else if (tag === '30d') {
      // Últimos 30 dias
      start_date = new Date(today);
      start_date.setDate(today.getDate() - 29); // Hoje + 29 dias anteriores = 30 dias
    }
    else if (tag === '90d') {
      // Últimos 90 dias
      start_date = new Date(today);
      start_date.setDate(today.getDate() - 89); // Hoje + 89 dias anteriores = 90 dias
    }
  }
  // Processar period (compatibilidade com frontend existente)
  else if (filterby === '7d' || filterby === '30d' || filterby === '90d' || 
           filterby === '6mo' || filterby === '1yr' || filterby === 'last-year') {
    // Usar filterby como period
    const result = parsePeriod(filterby);
    console.log(`Parsed period ${filterby}:`, result);
    return result;
  }
  else {
    // Verificar se há um parâmetro period (compatibilidade com frontend existente)
    const result = parsePeriod(filterby);
    console.log(`Parsed period ${filterby}:`, result);
    return result;
  }
  
  // Este código só será executado se start_date e end_date forem definidos nos blocos acima
  if (start_date && end_date) {
    const result = {
      start_date: formatDate(start_date),
      end_date: formatDate(end_date)
    };
    console.log('parseDateRange result:', { filterby, tag, result });
    return result;
  }
  
  // Se chegou aqui, retorna objeto vazio
  return {};
}

// Função auxiliar para processar o parâmetro period
function parsePeriod(period?: string) {
if (!period) return {};
const today = new Date();
let start_date: Date;
const end_date = new Date(today);
// Processar períodos predefinidos
if (period === '7d') {
start_date = new Date(today);
start_date.setDate(today.getDate() - 6); // Últimos 7 dias (hoje + 6 dias anteriores)
console.log('7d period:', { start_date, end_date, today });
} 
else if (period === '30d') {
start_date = new Date(today);
start_date.setDate(today.getDate() - 29); // Últimos 30 dias
} 
else if (period === '90d') {
start_date = new Date(today);
start_date.setDate(today.getDate() - 89); // Últimos 90 dias
} 
else if (period === '6mo') {
start_date = new Date(today);
start_date.setMonth(today.getMonth() - 6); // Últimos 6 meses
} 
else if (period === '1yr') {
start_date = new Date(today);
start_date.setFullYear(today.getFullYear() - 1); // Último ano
} 
else if (period === 'last-year') {
start_date = new Date(today.getFullYear() - 1, 0, 1); // 1º de janeiro do ano passado
end_date.setFullYear(today.getFullYear() - 1, 11, 31); // 31 de dezembro do ano passado
} 
else {
// Período desconhecido, retornar vazio
return {};
}
return {
start_date: formatDate(start_date),
end_date: formatDate(end_date)
};
}

// Função auxiliar para formatar data como YYYY-MM-DD
function formatDate(date: Date): string {
  const formatted = date.toISOString().split('T')[0];
  console.log('formatDate:', { date, formatted });
  return formatted;
}

// Calculate real sales metrics from database
async function calculateSalesMetrics(supabase: any, params: { segment_id?: string | null, start_date?: string, end_date?: string } = {}) {
  const { segment_id, start_date, end_date } = params;
  
  let salesQuery = supabase
    .from('sales')
    .select('id, total_amount, created_at, customer_id');
  
  if (start_date && end_date) {
    salesQuery = salesQuery.gte('created_at', start_date).lte('created_at', end_date);
  }
  
  if (segment_id) {
    // Filter by segment_id directly on sales table
    salesQuery = salesQuery.eq('segment_id', segment_id);
  }
  
  const { data: sales, error } = await salesQuery;
  
  if (error) {
    console.error('Error fetching sales:', error);
    return { total_sales: 0, total_revenue: 0, avg_ticket: 0 };
  }
  
  const total_sales = sales?.length || 0;
  const total_revenue = sales?.reduce((sum, sale) => sum + (sale.total_amount || 0), 0) || 0;
  const avg_ticket = total_sales > 0 ? Math.round(total_revenue / total_sales) : 0;
  
  return { total_sales, total_revenue, avg_ticket };
}

// Calculate real financial metrics from database
async function calculateFinancialMetrics(supabase: any, params: { segment_id?: string | null, start_date?: string, end_date?: string } = {}) {
  const { start_date, end_date } = params;
  
  // Get transactions for cash flow
  let transactionsQuery = supabase
    .from('transactions')
    .select('amount, type, created_at');
  
  if (start_date && end_date) {
    transactionsQuery = transactionsQuery.gte('created_at', start_date).lte('created_at', end_date);
  }
  
  const { data: transactions, error: transError } = await transactionsQuery;
  
  if (transError) {
    console.error('Error fetching transactions:', transError);
  }
  
  const cash_in = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const cash_out = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
  const balance = cash_in - cash_out;
  
  return { cash_in, cash_out, balance };
}

// Calculate receivables and payables
async function calculateReceivablesPayables(supabase: any, params: { segment_id?: string | null, start_date?: string, end_date?: string } = {}) {
  const { segment_id, start_date, end_date } = params;
  
  // Get pending billings (receivables)
  let billingsQuery = supabase
    .from('billings')
    .select('amount')
    .eq('status', 'pending');
  
  if (start_date && end_date) {
    billingsQuery = billingsQuery.gte('created_at', start_date).lte('created_at', end_date);
  }
  
  const { data: billings, error: billError } = await billingsQuery;
  
  if (billError) {
    console.error('Error fetching billings:', billError);
  }
  
  // Get pending accounts payable
  let payablesQuery = supabase
    .from('accounts_payable')
    .select('valor')
    .eq('status', 'pendente');
  
  if (start_date && end_date) {
    payablesQuery = payablesQuery.gte('created_at', start_date).lte('created_at', end_date);
  }
  
  const { data: payables, error: payError } = await payablesQuery;
  
  if (payError) {
    console.error('Error fetching accounts payable:', payError);
  }
  
  const receivables = billings?.reduce((sum, bill) => sum + (bill.amount || 0), 0) || 0;
  const pending_payables = payables?.reduce((sum, pay) => sum + (pay.valor || 0), 0) || 0;
  const pending_invoices = billings?.length || 0;
  
  return { receivables, pending_payables, pending_invoices };
}

// Calculate customer count
async function calculateCustomerMetrics(supabase: any, params: { segment_id?: string | null, start_date?: string, end_date?: string } = {}) {
  const { segment_id, start_date, end_date } = params;
  
  let customerQuery = supabase
    .from('partner_roles')
    .select('partner_id, partners!inner(id, status, segment_id, created_at)', { count: 'exact' })
    .eq('role', 'customer')
    .eq('partners.status', 'active');
  
  if (segment_id) {
    customerQuery = customerQuery.eq('partners.segment_id', segment_id);
  }
  
  if (start_date) {
    customerQuery = customerQuery.gte('partners.created_at', start_date);
  }
  
  if (end_date) {
    customerQuery = customerQuery.lte('partners.created_at', end_date + 'T23:59:59.999Z');
  }
  
  const { count, error } = await customerQuery;
  
  if (error) {
    console.error('Error fetching customers from partners:', error);
    return { total_customers: 0 };
  }
  
  return { total_customers: count || 0 };
}

// Generate time series data for charts
async function generateTimeSeries(supabase: any, params: { segment_id?: string | null, days?: number, start_date?: string, end_date?: string } = {}) {
  const { segment_id, days = 7, start_date, end_date } = params;
  const series_days: { date: string; sales: number; revenue: number; payables: number; receivables: number; cash_in: number; cash_out: number }[] = [];
  
  // If start_date and end_date are provided, use them to calculate the date range
  let startDate: Date;
  let endDate: Date;
  
  if (start_date && end_date) {
    startDate = new Date(start_date);
    endDate = new Date(end_date);
  } else {
    // Fallback to last N days from today
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(endDate.getDate() - (days - 1));
  }
  
  // Calculate the number of days between start and end
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  for (let i = 0; i < daysDiff; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const nextDateStr = new Date(date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Get sales for this day
    const salesMetrics = await calculateSalesMetrics(supabase, {
      segment_id,
      start_date: dateStr,
      end_date: nextDateStr
    });
    
    // Get financial metrics for this day
    const financialMetrics = await calculateFinancialMetrics(supabase, {
      segment_id,
      start_date: dateStr,
      end_date: nextDateStr
    });
    
    series_days.push({
      date: dateStr,
      sales: salesMetrics.total_sales,
      revenue: salesMetrics.total_revenue,
      payables: 0, // Will be calculated from daily payables if needed
      receivables: 0, // Will be calculated from daily receivables if needed
      cash_in: financialMetrics.cash_in,
      cash_out: financialMetrics.cash_out
    });
  }
  
  return series_days;
}

// Main function to build real dashboard metrics
async function buildRealDashboardMetrics(supabase: any, params: { segment_id?: string | null, filterby?: string, tag?: string, start_date?: string, end_date?: string, days?: number, from?: string, to?: string } = {}) {
  try {
    // Parse date range using the new utility function
    const dateRange = parseDateRange(params.filterby, params.tag?.toString(), params.from?.toString(), params.to?.toString());
    
    const dateParams = {
      segment_id: params.segment_id,
      start_date: dateRange.start_date,
      end_date: dateRange.end_date
    };
    
    // Calculate all metrics in parallel for better performance
    const [salesMetrics, financialMetrics, receivablesPayables, customerMetrics, timeSeries] = await Promise.all([
      calculateSalesMetrics(supabase, dateParams),
      calculateFinancialMetrics(supabase, dateParams),
      calculateReceivablesPayables(supabase, dateParams),
      calculateCustomerMetrics(supabase, dateParams),
      generateTimeSeries(supabase, { segment_id: params.segment_id, days: params.days || 7, start_date: dateRange.start_date, end_date: dateRange.end_date })
    ]);
    
    // Get low stock count (using correct field names from schema)
    const { count: low_stock_count } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .lt('stock_quantity', 10) || { count: 0 }; // Usando valor fixo 10 em vez de supabase.raw
    
    return {
      total_sales: salesMetrics.total_sales,
      total_revenue: salesMetrics.total_revenue,
      avg_ticket: salesMetrics.avg_ticket,
      total_customers: customerMetrics.total_customers,
      low_stock_count: low_stock_count || 0,
      pending_invoices: receivablesPayables.pending_invoices,
      pending_payables: receivablesPayables.pending_payables,
      cash_in: financialMetrics.cash_in,
      cash_out: financialMetrics.cash_out,
      balance: financialMetrics.balance,
      receivables: receivablesPayables.receivables,
      payables: receivablesPayables.pending_payables,
      series_days: timeSeries,
    };
  } catch (error) {
    console.error('Error building real dashboard metrics:', error);
    // Não usar mais dados mockados, retornar erro para que o frontend possa tratar
    throw error;
  }
}

// Keep mock function as fallback
function buildMockDashboardMetrics(params: { segment_id?: string | null } = {}) {
  const today = new Date();
  const seed = Number(`${today.getUTCFullYear()}${today.getUTCMonth()+1}${today.getUTCDate()}`);
  const rng = seededRng(seed + (params.segment_id ? params.segment_id.length : 0));

  // Customers and products
  const total_customers = randInt(rng, 48, 220);
  const low_stock_count = randInt(rng, 3, 25);

  // Sales
  const total_sales = randInt(rng, 8, 45);
  const avg_ticket = randInt(rng, 120, 850);
  const total_revenue = total_sales * avg_ticket;

  // Billings and AP
  const pending_invoices = randInt(rng, 2, 18);
  const pending_payables = randInt(rng, 4, 22);

  // Trend series (last 7 days)
  const series_days: { date: string; sales: number; revenue: number; payables: number; receivables: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const localSeed = seed - i;
    const r = seededRng(localSeed)();
    const sales = clamp(Math.round(total_sales / 7 + (r - 0.5) * 6), 0, 60);
    const revenue = clamp(Math.round(total_revenue / 7 + (r - 0.5) * 1200), 0, 999999);
    const payables = clamp(Math.round(pending_payables / 7 + (r - 0.5) * 5), 0, 30);
    const receivables = clamp(Math.round(pending_invoices / 7 + (r - 0.5) * 5), 0, 30);
    series_days.push({
      date: d.toISOString().slice(0, 10),
      sales,
      revenue,
      payables,
      receivables,
    });
  }

  return {
    total_sales,
    total_revenue,
    avg_ticket,
    total_customers,
    low_stock_count,
    pending_invoices,
    pending_payables,
    series_days,
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = (globalThis as any).Deno?.env?.get('SUPABASE_URL') || process.env.SUPABASE_URL!
    const supabaseServiceKey = (globalThis as any).Deno?.env?.get('SUPABASE_SERVICE_ROLE_KEY') || process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const url = new URL(req.url)
    const pathSegments = url.pathname.split('/')
    const lastSegment = pathSegments[pathSegments.length - 1]
    const isSpecificId = lastSegment && lastSegment !== 'metrics' && lastSegment.length > 16
    const isFinancial = lastSegment === 'financial'
    const isSales = lastSegment === 'sales'

    // GET - Dashboard summary (real data)
    // GET - Dashboard summary (real data)
    if (req.method === 'GET' && !isSpecificId && !isFinancial && !isSales) {
    const params = Object.fromEntries(url.searchParams.entries());
    
    // Parse date range parameters - support period, from/to, and start_date/end_date
    const period = params.period;
    const filterby = params.filterby || period; // Usar period como fallback para filterby
    const tag = params.tag || period; // Usar period como fallback para tag também
    const from = params.from || params.start_date || params.start;
    const to = params.to || params.end_date || params.end;
    const days = params.days ? parseInt(params.days) : 7;
    
    console.log('Received params:', { period, filterby, tag, from, to, days, original_params: params });
    
    try {
      const metrics = await buildRealDashboardMetrics(supabase, { 
      segment_id: params.segment_id || null,
      filterby,
      tag,
      from,
      to,
    days
    });
    
    return new Response(
    JSON.stringify({ success: true, metrics }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    } catch (error) {
      console.error('Error in dashboard metrics endpoint:', error);
      return new Response(JSON.stringify({ success: false, error: 'Erro ao obter métricas do dashboard', details: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    }

    // GET - Financial metrics (real data)
    if (req.method === 'GET' && isFinancial) {
      const params = Object.fromEntries(url.searchParams.entries());
      
      // Parse date range parameters
      const start_date = params.start_date;
      const end_date = params.end_date;
      const days = params.days ? parseInt(params.days) : 7;
      
      const [financialMetrics, receivablesPayables, timeSeries] = await Promise.all([
        calculateFinancialMetrics(supabase, { segment_id: params.segment_id || null, start_date, end_date }),
        calculateReceivablesPayables(supabase, { segment_id: params.segment_id || null }),
        generateTimeSeries(supabase, { segment_id: params.segment_id || null, days })
      ]);
      
      const payload = {
        success: true,
        metrics: {
          cash_in: financialMetrics.cash_in,
          cash_out: financialMetrics.cash_out,
          balance: financialMetrics.balance,
          receivables: receivablesPayables.receivables,
          payables: receivablesPayables.pending_payables,
          series_days: timeSeries.map(d => ({ date: d.date, cash_in: d.cash_in, cash_out: d.cash_out })),
        }
      };
      return new Response(JSON.stringify(payload), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET - Sales metrics (real data)
    if (req.method === 'GET' && isSales) {
      const params = Object.fromEntries(url.searchParams.entries());
      
      // Parse date range parameters
      const start_date = params.start_date;
      const end_date = params.end_date;
      const days = params.days ? parseInt(params.days) : 7;
      
      const [salesMetrics, timeSeries] = await Promise.all([
        calculateSalesMetrics(supabase, { segment_id: params.segment_id || null, start_date, end_date }),
        generateTimeSeries(supabase, { segment_id: params.segment_id || null, days })
      ]);
      
      const payload = {
        success: true,
        metrics: {
          total_sales: salesMetrics.total_sales,
          total_revenue: salesMetrics.total_revenue,
          avg_ticket: salesMetrics.avg_ticket,
          series_days: timeSeries.map(d => ({ date: d.date, sales: d.sales, revenue: d.revenue })),
        }
      };
      return new Response(JSON.stringify(payload), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET - Buscar por ID (mantido para compatibilidade, retorna dados reais)
    if (req.method === 'GET' && isSpecificId) {
      const metrics = await buildRealDashboardMetrics(supabase, {});
      return new Response(
        JSON.stringify({ success: true, metric: { id: lastSegment, ...metrics } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST - Modo mocado: ecoa payload e anexa cálculo rápido
    if (req.method === 'POST') {
      const body = await req.json()
      const metrics = buildMockDashboardMetrics();
      return new Response(
        JSON.stringify({ success: true, metric: { ...body, mock: true, snapshot: metrics }, message: 'OK (mock)' }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT - Modo mocado: retorna merge com id
    if (req.method === 'PUT' && isSpecificId) {
      const body = await req.json()
      return new Response(
        JSON.stringify({ success: true, metric: { id: lastSegment, ...body, mock: true }, message: 'OK (mock)' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE - Modo mocado
    if (req.method === 'DELETE' && isSpecificId) {
      return new Response(
        JSON.stringify({ success: true, message: 'OK (mock)' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
    console.error('Erro em metrics:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})