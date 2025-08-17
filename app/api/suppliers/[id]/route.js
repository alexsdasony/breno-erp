import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(`
      UPDATE fornecedores SET 
        razao_social = $1, nome_fantasia = $2, ramo_atividade = $3, tipo_contribuinte = $4,
        cpf_cnpj = $5, inscricao_estadual = $6, inscricao_municipal = $7, uf = $8, cidade = $9,
        cep = $10, endereco = $11, numero = $12, complemento = $13, bairro = $14, pessoa_contato = $15,
        telefone_fixo = $16, telefone_celular = $17, email = $18, site = $19, banco_nome = $20,
        banco_codigo = $21, agencia_numero = $22, agencia_digito = $23, conta_numero = $24,
        conta_digito = $25, pix_chave = $26, condicao_pagamento = $27, status = $28, observacoes = $29,
        updated_at = NOW()
      WHERE id = $30
      RETURNING *
    `, [
      body.razao_social, body.nome_fantasia, body.ramo_atividade, body.tipo_contribuinte,
      body.cpf_cnpj, body.inscricao_estadual, body.inscricao_municipal, body.uf, body.cidade,
      body.cep, body.endereco, body.numero, body.complemento, body.bairro, body.pessoa_contato,
      body.telefone_fixo, body.telefone_celular, body.email, body.site, body.banco_nome,
      body.banco_codigo, body.agencia_numero, body.agencia_digito, body.conta_numero,
      body.conta_digito, body.pix_chave, body.condicao_pagamento, body.status, body.observacoes,
      id
    ]);
    
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      supplier: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar fornecedor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const client = await pool.connect();
    
    const result = await client.query('DELETE FROM fornecedores WHERE id = $1 RETURNING *', [id]);
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Fornecedor não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Fornecedor excluído com sucesso'
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir fornecedor' },
      { status: 500 }
    );
  }
}
