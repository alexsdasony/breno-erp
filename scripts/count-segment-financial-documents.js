/**
 * Contagem de registros em financial_documents por segmento:
 * - Sem segmento (segment_id IS NULL)
 * - Com segmento (segment_id IS NOT NULL)
 * - Por segment_id (detalhado)
 *
 * Uso: node scripts/count-segment-financial-documents.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas (.env.local)');
  process.exit(1);
}

supabaseServiceKey = supabaseServiceKey.replace(/\n/g, '').replace(/\r/g, '').trim();
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const base = supabase.from('financial_documents').select('id', { count: 'exact', head: true }).eq('is_deleted', false);

  const { count: total } = await base;
  const { count: semSegmento } = await supabase
    .from('financial_documents')
    .select('id', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .is('segment_id', null);
  const { count: comSegmento } = await supabase
    .from('financial_documents')
    .select('id', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .not('segment_id', 'is', null);

  console.log('📊 financial_documents (is_deleted = false)\n');
  console.log('   Total:                    ', total ?? 0);
  console.log('   Sem segmento (NULL):      ', semSegmento ?? 0);
  console.log('   Com segmento (NOT NULL):  ', comSegmento ?? 0);
  console.log('');
  console.log('   Mais registros sem segmento que segmentados?', (semSegmento ?? 0) > (comSegmento ?? 0) ? 'Sim' : 'Não');
  console.log('');

  const counts = {};
  let offset = 0;
  const chunk = 1000;
  let hasMore = true;
  while (hasMore) {
    const { data: chunkData } = await supabase
      .from('financial_documents')
      .select('segment_id')
      .eq('is_deleted', false)
      .not('segment_id', 'is', null)
      .range(offset, offset + chunk - 1);
    const rows = chunkData || [];
    for (const r of rows) {
      const id = r.segment_id || '';
      counts[id] = (counts[id] || 0) + 1;
    }
    hasMore = rows.length >= chunk;
    offset += chunk;
  }

  const ids = Object.keys(counts);
  let segList = [];
  if (ids.length > 0) {
    const res = await supabase.from('segments').select('id, name').in('id', ids);
    segList = res.data || [];
  }
  const segMap = new Map(segList.map((s) => [s.id, s.name]));

  console.log('   Por segment_id:');
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  for (const [id, n] of entries) {
    const nome = segMap.get(id) || '(nome não encontrado)';
    console.log('     ', id, '|', nome, '|', n);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
