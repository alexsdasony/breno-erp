import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase env vars missing for fornecedores API");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Listar fornecedores
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segmentId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = supabase
      .from('fornecedores')
      .select('*')
      .order('razao_social', { ascending: true });

    // Filtros
    if (segmentId && segmentId !== '0') {
      query = query.eq('segment_id', segmentId);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`razao_social.ilike.%${search}%,nome_fantasia.ilike.%${search}%,cpf_cnpj.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar fornecedores:', error);
      return NextResponse.json({ error: 'Erro ao buscar fornecedores' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API de fornecedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// POST - Criar fornecedor
export async function POST(request) {
  try {
    const body = await request.json();

    // Validações básicas
    if (!body.razao_social || !body.cpf_cnpj) {
      return NextResponse.json(
        { error: 'Razão social e CPF/CNPJ são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se CPF/CNPJ já existe
    const { data: existing } = await supabase
      .from('fornecedores')
      .select('id')
      .eq('cpf_cnpj', body.cpf_cnpj)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'CPF/CNPJ já cadastrado' },
        { status: 400 }
      );
    }

    // Preparar dados para inserção
    const fornecedorData = {
      razao_social: body.razao_social,
      nome_fantasia: body.nome_fantasia || null,
      ramo_atividade: body.ramo_atividade || null,
      tipo_contribuinte: body.tipo_contribuinte || 'PJ',
      cpf_cnpj: body.cpf_cnpj,
      inscricao_estadual: body.inscricao_estadual || null,
      inscricao_municipal: body.inscricao_municipal || null,
      uf: body.uf || null,
      cidade: body.cidade || null,
      cep: body.cep || null,
      endereco: body.endereco || null,
      numero: body.numero || null,
      complemento: body.complemento || null,
      bairro: body.bairro || null,
      pessoa_contato: body.pessoa_contato || null,
      telefone_fixo: body.telefone_fixo || null,
      telefone_celular: body.telefone_celular || null,
      email: body.email || null,
      site: body.site || null,
      banco_nome: body.banco_nome || null,
      banco_codigo: body.banco_codigo || null,
      agencia_numero: body.agencia_numero || null,
      agencia_digito: body.agencia_digito || null,
      conta_numero: body.conta_numero || null,
      conta_digito: body.conta_digito || null,
      pix_chave: body.pix_chave || null,
      condicao_pagamento: body.condicao_pagamento || null,
      status: body.status || 'ATIVO',
      segment_id: body.segment_id || null,
      observacoes: body.observacoes || null
    };

    const { data, error } = await supabase
      .from('fornecedores')
      .insert([fornecedorData])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar fornecedor:', error);
      return NextResponse.json({ error: 'Erro ao criar fornecedor' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Erro na API de fornecedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
