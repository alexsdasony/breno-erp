import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ALLOWED_FIELDS = new Set([
  'supplier_id','numero_nota_fiscal','descricao','valor','data_vencimento','data_pagamento',
  'status','categoria_id','forma_pagamento','observacoes','responsavel_pagamento',
  'numero_parcela','total_parcelas','segment_id','is_deleted','deleted_at'
]);

function toNullIfEmpty(v: any) {
  return v === '' || v === undefined ? null : v;
}

function toNumberOrNull(v: any) {
  if (v === '' || v === null || v === undefined) return null;
  if (typeof v === 'number') return v;
  const n = Number(String(v).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function toDateOrNull(v: any) {
  const val = toNullIfEmpty(v);
  if (val === null) return null;
  // aceita YYYY-MM-DD
  return String(val);
}

function pickAllowed(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const k of Object.keys(obj)) if (ALLOWED_FIELDS.has(k)) out[k] = obj[k];
  return out;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 API Route GET /api/accounts-payable/[id]:', id);
    
    const { data, error } = await supabaseAdmin
      .from('accounts_payable')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.log('❌ Conta a pagar não encontrada:', { id, error });
      return NextResponse.json(
        { error: 'Conta a Pagar não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      account_payable: data
    });
  } catch (error) {
    console.error('❌ Erro na API route GET [id]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || !UUID_RE.test(id)) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const raw = await req.json();
    console.log('🔍 [AP UPDATE] id:', id);
    console.log('📥 Payload bruto:', raw);

    // Normalização
    const payload: Record<string, any> = {
      ...raw,
      valor: toNumberOrNull(raw?.valor),
      data_vencimento: toDateOrNull(raw?.data_vencimento),
      data_pagamento: toDateOrNull(raw?.data_pagamento),
      supplier_id: toNullIfEmpty(raw?.supplier_id),
      categoria_id: toNullIfEmpty(raw?.categoria_id),
      forma_pagamento: toNullIfEmpty(raw?.forma_pagamento),
      observacoes: toNullIfEmpty(raw?.observacoes),
      responsavel_pagamento: toNullIfEmpty(raw?.responsavel_pagamento),
      numero_parcela: raw?.numero_parcela ?? null,
      total_parcelas: raw?.total_parcelas ?? null,
      segment_id: toNullIfEmpty(raw?.segment_id),
      deleted_at: toNullIfEmpty(raw?.deleted_at),
      is_deleted: raw?.is_deleted ?? false,
    };

    // Validação segment_id
    if (payload.segment_id !== null && payload.segment_id !== undefined) {
      if (!UUID_RE.test(payload.segment_id)) {
        return NextResponse.json({ error: 'segment_id inválido (UUID esperado)' }, { status: 400 });
      }
      // existe no banco?
      const { data: seg, error: segErr } = await supabaseAdmin
        .from('segments')
        .select('id')
        .eq('id', payload.segment_id)
        .maybeSingle();

      if (segErr) {
        console.error('❌ Erro ao validar segment_id:', segErr);
        return NextResponse.json({ error: 'Falha ao validar segment_id' }, { status: 500 });
      }
      if (!seg) {
        return NextResponse.json({ error: 'segment_id não encontrado' }, { status: 400 });
      }
    }

    // Confere existência do registro
    const { data: existing, error: existErr } = await supabaseAdmin
      .from('accounts_payable')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existErr) {
      console.error('❌ Erro ao verificar existência:', existErr);
      return NextResponse.json({ error: 'Falha ao verificar existência' }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Conta a pagar não encontrada' }, { status: 404 });
    }

    // Só envia campos permitidos + sem undefined
    const cleaned = pickAllowed(payload);
    for (const k of Object.keys(cleaned)) if (cleaned[k] === undefined) delete cleaned[k];

    console.log('🧹 Payload normalizado:', cleaned);

    const { data, error } = await supabaseAdmin
      .from('accounts_payable')
      .update(cleaned)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('❌ Supabase UPDATE error:', {
        message: error.message,
        code: (error as any).code,
        hint: (error as any).hint,
        details: (error as any).details,
        full: error
      });
      return NextResponse.json({ error: error.message, details: (error as any).details }, { status: 500 });
    }

    console.log('✅ Atualizado:', data);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (e: any) {
    console.error('💥 Exceção no handler:', e);
    return NextResponse.json({ error: 'Erro interno', details: String(e?.message ?? e) }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 API Route DELETE /api/accounts-payable/[id]:', id);
    
    const { error } = await supabaseAdmin
      .from('accounts_payable')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar conta a pagar:', error);
      return NextResponse.json(
        { error: 'Conta a Pagar não encontrado', details: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conta a Pagar deletado com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro na API route DELETE [id]:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
