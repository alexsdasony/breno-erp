import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    
    const client = await pool.connect();
    let query = '';
    let orderBy = '';
    
    if (role === 'customer') {
      query = 'SELECT *, \'customer\' as role FROM customers';
      orderBy = 'ORDER BY name ASC';
    } else {
      query = 'SELECT *, \'supplier\' as role FROM fornecedores';
      orderBy = 'ORDER BY razao_social ASC';
    }
    
    const result = await client.query(query + ' ' + orderBy);
    client.release();

    return NextResponse.json({
      success: true,
      partners: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar parceiros' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO fornecedores (
        razao_social, nome_fantasia, cpf_cnpj, email, telefone_fixo, telefone_celular
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        body.razao_social, body.nome_fantasia, body.cpf_cnpj, 
        body.email, body.telefone_fixo, body.telefone_celular
      ]
    );
    client.release();

    return NextResponse.json({
      success: true,
      partners: result.rows[0],
      message: 'Parceiro criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json(
      { error: 'Erro ao criar parceiro' },
      { status: 500 }
    );
  }
}
