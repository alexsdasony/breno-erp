import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.error("Supabase env vars missing for fornecedores API");
}

// GET - Buscar fornecedor por ID
export async function GET(request, { params }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  try {
    const { id } = params;

    const { data, error } = await supabase
      .from('fornecedores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 });
      }
      console.error('Erro ao buscar fornecedor:', error);
      return NextResponse.json({ error: 'Erro ao buscar fornecedor' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API de fornecedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// PUT - Atualizar fornecedor
export async function PUT(request, { params }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  try {
    const { id } = params;
    const body = await request.json();

    // Validações básicas
    if (!body.razao_social || !body.cpf_cnpj) {
      return NextResponse.json(
        { error: 'Razão social e CPF/CNPJ são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se CPF/CNPJ já existe em outro fornecedor
    const { data: existing } = await supabase
      .from('fornecedores')
      .select('id')
      .eq('cpf_cnpj', body.cpf_cnpj)
      .neq('id', id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'CPF/CNPJ já cadastrado para outro fornecedor' },
        { status: 400 }
      );
    }

    // Preparar dados para atualização
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
      .update(fornecedorData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 });
      }
      console.error('Erro ao atualizar fornecedor:', error);
      return NextResponse.json({ error: 'Erro ao atualizar fornecedor' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro na API de fornecedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

// DELETE - Excluir fornecedor
export async function DELETE(request, { params }) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase não configurado' }, { status: 500 });
  }

  try {
    const { id } = params;

    const { error } = await supabase
      .from('fornecedores')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir fornecedor:', error);
      return NextResponse.json({ error: 'Erro ao excluir fornecedor' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Fornecedor excluído com sucesso' });
  } catch (error) {
    console.error('Erro na API de fornecedores:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
