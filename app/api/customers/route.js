import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM customers ORDER BY name ASC');
    client.release();

    return NextResponse.json({
      success: true,
      customers: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar clientes' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO customers (
        name, email, phone, address, cpf_cnpj, segment_id
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        body.name, body.email, body.phone, body.address, body.cpf_cnpj, body.segment_id
      ]
    );
    client.release();

    return NextResponse.json({
      success: true,
      customers: result.rows[0],
      message: 'Cliente criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Erro ao criar cliente' },
      { status: 500 }
    );
  }
}
