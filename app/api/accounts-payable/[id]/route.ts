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
    
    // Buscar na tabela financial_documents com direction = 'payable'
    const { data, error } = await supabaseAdmin
      .from('financial_documents')
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `)
      .eq('id', id)
      .eq('direction', 'payable')
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
  try {
    const { id } = await params;
    const body = await req.json();

    console.log("🚀 [AP UPDATE] Iniciando atualização");
    console.log("🔍 [AP UPDATE] id:", id);
    console.log("📥 Payload recebido:", body);

    // Mapear status para valores aceitos pela tabela financial_documents
    // Constraint: status IN ('draft','open','partially_paid','paid','canceled')
    const statusMap: Record<string, string> = {
      'pending': 'open',
      'paid': 'paid',
      'overdue': 'open', // Mapear overdue para open (será calculado na aplicação)
      'cancelled': 'canceled',
      'pendente': 'open',
      'pago': 'paid',
      'vencido': 'open', // Mapear vencido para open (será calculado na aplicação)
      'cancelado': 'canceled'
    };
    
    // Mapear forma de pagamento para payment_method_id (se necessário)
    const paymentMethodMap: Record<string, string> = {
      'boleto': 'boleto',
      'pix': 'pix',
      'transferencia': 'transferencia',
      'dinheiro': 'dinheiro',
      'cartao': 'cartao',
      'cheque': 'cheque'
    };
    
    // Normalizar o payload para a tabela financial_documents
    const normalizedBody = {
      direction: 'payable', // Sempre payable para contas a pagar
      description: body.descricao,
      amount: body.valor,
      due_date: body.data_vencimento,
      issue_date: body.data_vencimento, // Usar data_vencimento como issue_date se não houver
      status: statusMap[body.status] || body.status || 'paid',
      partner_id: body.supplier_id,
      segment_id: body.segment_id,
      payment_method_id: body.payment_method_id,
      doc_no: body.numero_nota_fiscal,
      notes: body.observacoes
    };

    console.log("🧹 Payload normalizado:", normalizedBody);

    const { data, error } = await supabaseAdmin
      .from("financial_documents")
      .update(normalizedBody)
      .eq("id", id)
      .eq("direction", "payable")
      .select(`
        *,
        partner:partners(name, id),
        payment_method_data:payment_methods(name, id)
      `);

    if (error) {
      console.error("❌ Supabase UPDATE error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log("✅ Supabase UPDATE sucesso:", data);
    return NextResponse.json({ 
      success: true,
      account_payable: data[0] 
    }, { status: 200 });
  } catch (err: any) {
    console.error("🔥 Erro inesperado no PUT /accounts-payable:", err);
    return NextResponse.json(
      { error: "Erro interno", details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 API Route DELETE /api/accounts-payable/[id]:', id);
    
    // Deletar da tabela financial_documents com direction = 'payable'
    const { error } = await supabaseAdmin
      .from('financial_documents')
      .delete()
      .eq('id', id)
      .eq('direction', 'payable');

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
