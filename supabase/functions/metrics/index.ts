import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

// Build realistic mocked metrics aligned to current ERP modules
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
    const isSpecificId = lastSegment && lastSegment !== 'metrics' && lastSegment.length > 16
    const isFinancial = lastSegment === 'financial'
    const isSales = lastSegment === 'sales'

    // GET - Dashboard summary (mocked realistic data)
    if (req.method === 'GET' && !isSpecificId && !isFinancial && !isSales) {
      const params = Object.fromEntries(url.searchParams.entries());
      const metrics = buildMockDashboardMetrics({ segment_id: params.segment_id || null });
      return new Response(
        JSON.stringify({ success: true, metrics }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET - Financial metrics (mocked)
    if (req.method === 'GET' && isFinancial) {
      const params = Object.fromEntries(url.searchParams.entries());
      const base = buildMockDashboardMetrics({ segment_id: params.segment_id || null });
      const payload = {
        success: true,
        metrics: {
          cash_in: Math.round(base.total_revenue * 0.62),
          cash_out: Math.round(base.total_revenue * 0.41),
          balance: Math.round(base.total_revenue * 0.21),
          receivables: base.pending_invoices,
          payables: base.pending_payables,
          series_days: base.series_days.map(d => ({ date: d.date, cash_in: Math.round(d.revenue * 0.6), cash_out: Math.round(d.revenue * 0.4) })),
        }
      };
      return new Response(JSON.stringify(payload), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET - Sales metrics (mocked)
    if (req.method === 'GET' && isSales) {
      const params = Object.fromEntries(url.searchParams.entries());
      const base = buildMockDashboardMetrics({ segment_id: params.segment_id || null });
      const payload = {
        success: true,
        metrics: {
          total_sales: base.total_sales,
          total_revenue: base.total_revenue,
          avg_ticket: Math.round(base.total_revenue / Math.max(1, base.total_sales)),
          series_days: base.series_days.map(d => ({ date: d.date, sales: d.sales, revenue: d.revenue })),
        }
      };
      return new Response(JSON.stringify(payload), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // GET - Buscar por ID (mantido para compatibilidade, retorna mocado)
    if (req.method === 'GET' && isSpecificId) {
      const metrics = buildMockDashboardMetrics();
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