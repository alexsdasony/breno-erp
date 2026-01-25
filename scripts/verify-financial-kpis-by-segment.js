/**
 * Verifica se entradas, saídas e saldo por segmento estão corretos no ambiente local.
 *
 * Compara:
 * 1. Valores retornados por /api/financial-kpis (por segmento)
 * 2. Soma manual a partir de /api/financial-documents (pageSize=10000, mesmo filtro)
 *
 * Uso: npm run dev (em outro terminal) e depois node scripts/verify-financial-kpis-by-segment.js
 */

const BASE = process.env.VERIFY_BASE_URL || 'http://localhost:3000';

async function fetchJson(path, params = {}) {
  const qs = new URLSearchParams(params).toString();
  const url = qs ? `${BASE}${path}?${qs}` : `${BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${url}`);
  return res.json();
}

function fromList(docs) {
  const receivables = (docs || []).filter((d) => d.direction === 'receivable');
  const payables = (docs || []).filter((d) => d.direction === 'payable');
  const entradas = receivables.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const saidas = payables.reduce((s, d) => s + (Number(d.amount) || 0), 0);
  const saldo = entradas - saidas;
  return { entradas, saidas, saldo, nReceivable: receivables.length, nPayable: payables.length };
}

function diff(a, b) {
  const e = Math.abs((a.entradas || 0) - (b.entradas || 0));
  const s = Math.abs((a.saidas ?? a.saídas ?? 0) - (b.saidas ?? b.saídas ?? 0));
  const sal = Math.abs((a.saldo || 0) - (b.saldo || 0));
  return { entradas: e, saidas: s, saldo: sal };
}

function ok(d) {
  const tol = 1e-6;
  return d.entradas < tol && d.saidas < tol && d.saldo < tol;
}

async function main() {
  console.log('🔍 Verificação de KPIs por segmento (ambiente local)\n');
  console.log('Base URL:', BASE);
  console.log('');

  let segments = [];
  try {
    const segRes = await fetchJson('/api/segments', { limit: 200 });
    segments = segRes.segments || [];
    console.log(`📋 Segmentos carregados: ${segments.length}\n`);
  } catch (e) {
    console.error('❌ Erro ao buscar segmentos:', e.message);
    console.log('   Confirme que o app está rodando (npm run dev) e acessível em', BASE);
    process.exit(1);
  }

  const rows = [];
  const allSegments = [{ id: null, name: '(Todos os segmentos)' }, ...segments];

  for (const seg of allSegments) {
    const segId = seg.id;
    const label = seg.name || segId || '(Todos)';
    const params = {};
    if (segId) params.segment_id = segId;

    try {
      const kpiRes = await fetchJson('/api/financial-kpis', params);
      const kpis = kpiRes.kpis || {};
      const kpi = {
        entradas: kpis.entradas ?? 0,
        saidas: kpis.saidas ?? 0,
        saldo: kpis.saldo ?? 0,
      };

      const listParams = { pageSize: 1000, page: 1 };
      if (segId) listParams.segment_id = segId;
      let docs = [];
      let page = 1;
      let chunk;
      do {
        const listRes = await fetchJson('/api/financial-documents', { ...listParams, page });
        chunk = listRes.financialDocuments || [];
        docs = docs.concat(chunk);
        page += 1;
      } while (chunk.length >= listParams.pageSize);
      const manual = fromList(docs);

      const d = diff(kpi, manual);
      rows.push({
        label,
        segmentId: segId || '-',
        kpi,
        manual,
        diff: d,
        ok: ok(d),
        nDocs: docs.length,
      });
    } catch (e) {
      rows.push({
        label,
        segmentId: segId || '-',
        error: e.message,
        ok: false,
      });
    }
  }

  // Relatório
  console.log('━'.repeat(100));
  console.log('Segmento                           | Entradas (KPI)   | Saídas (KPI)    | Saldo (KPI)     | Entradas (list) | Saídas (list)   | Saldo (list)    | Diff E/S/S  | Status');
  console.log('━'.repeat(100));

  let allOk = true;
  for (const r of rows) {
    if (r.error) {
      console.log(`${r.label.padEnd(34)} | ${r.error}`);
      allOk = false;
      continue;
    }
    const e1 = r.kpi.entradas.toFixed(2).padStart(14);
    const s1 = (r.kpi.saidas ?? r.kpi.saídas ?? 0).toFixed(2).padStart(14);
    const sal1 = r.kpi.saldo.toFixed(2).padStart(14);
    const e2 = r.manual.entradas.toFixed(2).padStart(14);
    const s2 = r.manual.saidas.toFixed(2).padStart(14);
    const sal2 = r.manual.saldo.toFixed(2).padStart(14);
    const de = r.diff.entradas.toFixed(4).padStart(8);
    const ds = r.diff.saidas.toFixed(4).padStart(8);
    const dsal = r.diff.saldo.toFixed(4).padStart(8);
    const st = r.ok ? '✅ OK' : '❌ DIFERENÇA';
    if (!r.ok) allOk = false;
    console.log(`${r.label.padEnd(34)} | ${e1} | ${s1} | ${sal1} | ${e2} | ${s2} | ${sal2} | ${de} ${ds} ${dsal} | ${st}`);
  }

  console.log('━'.repeat(100));
  if (allOk) {
    console.log('\n✅ Todos os segmentos: valores de entradas, saídas e saldo conferem com a listagem.');
  } else {
    console.log('\n❌ Há diferenças entre /api/financial-kpis e a soma a partir de /api/financial-documents.');
    console.log('   Revisar filtros (segment_id, issue_date) e o cálculo dos KPIs.');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
