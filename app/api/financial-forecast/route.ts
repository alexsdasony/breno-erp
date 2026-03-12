import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

/**
 * GET /api/financial-forecast
 * Previsão financeira automática a partir de contas a pagar, contas a receber e transações realizadas.
 * Parâmetros: month, year, segment_id, center_cost_id (opcional)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const segmentId = searchParams.get('segment_id') || null;
    const centerCostId = searchParams.get('center_cost_id') || null;

    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    if (m < 1 || m > 12) {
      return NextResponse.json({ error: 'Mês inválido (1-12)' }, { status: 400 });
    }
    const startDate = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const segmentFilter = segmentId && segmentId !== 'null' && segmentId !== '0' ? segmentId : null;

    // --- Receita prevista: financial_documents (receivable, open/partially_paid, due_date no mês)
    let qRevenueForecast = supabase
      .from('financial_documents')
      .select('amount, category_id')
      .eq('direction', 'receivable')
      .in('status', ['open', 'partially_paid'])
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .eq('is_deleted', false);
    if (segmentFilter) qRevenueForecast = qRevenueForecast.eq('segment_id', segmentFilter);
    const { data: revForecastRows } = await qRevenueForecast;
    const forecast_revenue = (revForecastRows || []).reduce((s, r) => s + Number(r.amount || 0), 0);

    // --- Despesa prevista: financial_documents (payable) + accounts_payable (pendente)
    let qExpenseForecast = supabase
      .from('financial_documents')
      .select('amount, category_id')
      .eq('direction', 'payable')
      .in('status', ['open', 'partially_paid'])
      .gte('due_date', startDate)
      .lte('due_date', endDate)
      .eq('is_deleted', false);
    if (segmentFilter) qExpenseForecast = qExpenseForecast.eq('segment_id', segmentFilter);
    const { data: expForecastDocs } = await qExpenseForecast;
    let forecast_expense = (expForecastDocs || []).reduce((s, r) => s + Number(r.amount || 0), 0);

    let qAp = supabase
      .from('accounts_payable')
      .select('valor, categoria_id')
      .eq('status', 'pendente')
      .gte('data_vencimento', startDate)
      .lte('data_vencimento', endDate)
      .eq('is_deleted', false);
    if (segmentFilter) qAp = qAp.eq('segment_id', segmentFilter);
    const { data: apRows } = await qAp;
    forecast_expense += (apRows || []).reduce((s, r) => s + Number(r.valor || 0), 0);

    // --- Receita/Despesa realizada: pagamentos no mês (financial_document_payments + financial_payments + doc direction)
    let qPayments = supabase
      .from('financial_payments')
      .select('id, payment_date')
      .gte('payment_date', startDate)
      .lte('payment_date', endDate);
    if (segmentFilter) qPayments = qPayments.eq('segment_id', segmentFilter);
    const { data: payments } = await qPayments;
    const paymentIds = (payments || []).map((p: { id: string }) => p.id);
    let realized_revenue = 0;
    let realized_expense = 0;
    if (paymentIds.length > 0) {
      const { data: fdpRows } = await supabase
        .from('financial_document_payments')
        .select('payment_id, document_id, amount_applied')
        .in('payment_id', paymentIds);
      const docIds = [...new Set((fdpRows || []).map((r: { document_id: string }) => r.document_id))];
      let docs: { id: string; direction: string }[] = [];
      if (docIds.length > 0) {
        const { data: docsData } = await supabase
          .from('financial_documents')
          .select('id, direction')
          .in('id', docIds);
        docs = docsData || [];
      }
      const docMap = new Map(docs.map((d) => [d.id, d.direction]));
      for (const r of fdpRows || []) {
        const dir = docMap.get(r.document_id);
        const amt = Number((r as { amount_applied?: number }).amount_applied || 0);
        if (dir === 'receivable') realized_revenue += amt;
        else if (dir === 'payable') realized_expense += amt;
      }
    }

    // financial_transactions (receita/despesa por data)
    let qFtRev = supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'receita')
      .gte('date', startDate)
      .lte('date', endDate);
    if (segmentFilter) qFtRev = qFtRev.eq('segment_id', segmentFilter);
    const { data: ftRev } = await qFtRev;
    realized_revenue += (ftRev || []).reduce((s, r) => s + Math.abs(Number(r.amount || 0)), 0);

    let qFtExp = supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'despesa')
      .gte('date', startDate)
      .lte('date', endDate);
    if (segmentFilter) qFtExp = qFtExp.eq('segment_id', segmentFilter);
    const { data: ftExp } = await qFtExp;
    realized_expense += (ftExp || []).reduce((s, r) => s + Math.abs(Number(r.amount || 0)), 0);

    // transactions (income/expense)
    let qTrIncome = supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'income')
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('is_deleted', false);
    if (segmentFilter) qTrIncome = qTrIncome.eq('segment_id', segmentFilter);
    if (centerCostId) {
      const { data: cc } = await supabase.from('cost_centers').select('name').eq('id', centerCostId).single();
      if (cc?.name) qTrIncome = qTrIncome.eq('cost_center', cc.name);
    }
    const { data: trIncome } = await qTrIncome;
    realized_revenue += (trIncome || []).reduce((s, r) => s + Number(r.amount || 0), 0);

    let qTrExp = supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate)
      .eq('is_deleted', false);
    if (segmentFilter) qTrExp = qTrExp.eq('segment_id', segmentFilter);
    if (centerCostId) {
      const { data: cc } = await supabase.from('cost_centers').select('name').eq('id', centerCostId).single();
      if (cc?.name) qTrExp = qTrExp.eq('cost_center', cc.name);
    }
    const { data: trExp } = await qTrExp;
    realized_expense += (trExp || []).reduce((s, r) => s + Number(r.amount || 0), 0);

    const percentage_revenue = forecast_revenue > 0
      ? Math.round((realized_revenue / forecast_revenue) * 10000) / 100
      : (realized_revenue > 0 ? 100 : 0);
    const percentage_expense = forecast_expense > 0
      ? Math.round((realized_expense / forecast_expense) * 10000) / 100
      : (realized_expense > 0 ? 100 : 0);

    // Categorias para tabela detalhada
    const categoryIds = new Set<string>();
    (revForecastRows || []).forEach((r: { category_id?: string }) => r.category_id && categoryIds.add(r.category_id));
    (expForecastDocs || []).forEach((r: { category_id?: string }) => r.category_id && categoryIds.add(r.category_id));
    (apRows || []).forEach((r: { categoria_id?: string }) => r.categoria_id && categoryIds.add(r.categoria_id));
    const catList = Array.from(categoryIds).filter(Boolean);
    const categories: { id: string; name: string; type: string; forecast: number; realized: number; difference: number; percentage: number }[] = [];
    if (catList.length > 0) {
      const { data: catNames } = await supabase.from('account_categories').select('id, name').in('id', catList);
      const nameMap = new Map((catNames || []).map((c: { id: string; name: string }) => [c.id, c.name]));
      for (const cid of catList) {
        const forecastRev = (revForecastRows || []).filter((r: { category_id?: string }) => r.category_id === cid).reduce((s, r) => s + Number(r.amount || 0), 0);
        const forecastExp = (expForecastDocs || []).filter((r: { category_id?: string }) => r.category_id === cid).reduce((s, r) => s + Number(r.amount || 0), 0);
        const forecastAp = (apRows || []).filter((r: { categoria_id?: string }) => r.categoria_id === cid).reduce((s, r) => s + Number(r.valor || 0), 0);
        const forecast = forecastRev + forecastExp + forecastAp;
        categories.push({
          id: cid,
          name: nameMap.get(cid) || 'Sem categoria',
          type: forecastRev > 0 ? 'Receita' : 'Despesa',
          forecast,
          realized: 0,
          difference: -forecast,
          percentage: 0,
        });
      }
    }
    const noCatRev = (revForecastRows || []).filter((r: { category_id?: string }) => !r.category_id).reduce((s, r) => s + Number(r.amount || 0), 0);
    const noCatExp = (expForecastDocs || []).filter((r: { category_id?: string }) => !r.category_id).reduce((s, r) => s + Number(r.amount || 0), 0);
    const noCatAp = (apRows || []).filter((r: { categoria_id?: string }) => !r.categoria_id).reduce((s, r) => s + Number(r.valor || 0), 0);
    if (noCatRev + noCatExp + noCatAp > 0) {
      categories.push({
        id: '',
        name: 'Sem categoria',
        type: noCatRev > 0 ? 'Receita' : 'Despesa',
        forecast: noCatRev + noCatExp + noCatAp,
        realized: 0,
        difference: -(noCatRev + noCatExp + noCatAp),
        percentage: 0,
      });
    }

    return NextResponse.json({
      success: true,
      forecast_revenue,
      realized_revenue,
      forecast_expense,
      realized_expense,
      percentage_revenue,
      percentage_expense,
      result_forecast: forecast_revenue - forecast_expense,
      result_realized: realized_revenue - realized_expense,
      period: { startDate, endDate, month: m, year: y },
      categories,
    });
  } catch (error) {
    console.error('Erro GET /api/financial-forecast:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro ao calcular previsão' },
      { status: 500 }
    );
  }
}
