import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM fornecedores ORDER BY razao_social ASC');
    client.release();

    return NextResponse.json({
      success: true,
      suppliers: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar fornecedores' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(`
      INSERT INTO fornecedores (
        razao_social, nome_fantasia, ramo_atividade, tipo_contribuinte, 
        cpf_cnpj, inscricao_estadual, inscricao_municipal, uf, cidade, 
        cep, endereco, numero, complemento, bairro, pessoa_contato, 
        telefone_fixo, telefone_celular, email, site, banco_nome, 
        banco_codigo, agencia_numero, agencia_digito, conta_numero, 
        conta_digito, pix_chave, condicao_pagamento, status, observacoes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
      RETURNING *
    `, [
      body.razao_social, body.nome_fantasia, body.ramo_atividade, body.tipo_contribuinte,
      body.cpf_cnpj, body.inscricao_estadual, body.inscricao_municipal, body.uf, body.cidade,
      body.cep, body.endereco, body.numero, body.complemento, body.bairro, body.pessoa_contato,
      body.telefone_fixo, body.telefone_celular, body.email, body.site, body.banco_nome,
      body.banco_codigo, body.agencia_numero, body.agencia_digito, body.conta_numero,
      body.conta_digito, body.pix_chave, body.condicao_pagamento, body.status, body.observacoes
    ]);
    
    client.release();

    return NextResponse.json({
      success: true,
      supplier: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      { error: 'Erro ao criar fornecedor' },
      { status: 500 }
    );
  }
}
