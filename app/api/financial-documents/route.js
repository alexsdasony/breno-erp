import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM billings ORDER BY created_at DESC');
    client.release();

    return NextResponse.json({
      success: true,
      billings: result.rows,
      financialDocuments: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching financial documents:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar documentos financeiros' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO billings (
        customer_id, amount, due_date, status, payment_date, billing_date, segment_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        body.customer_id, body.amount, body.due_date, body.status,
        body.payment_date, body.billing_date || new Date(), body.segment_id
      ]
    );
    client.release();

    return NextResponse.json({
      success: true,
      financialDocuments: result.rows[0],
      message: 'Documento financeiro criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating financial document:', error);
    return NextResponse.json(
      { error: 'Erro ao criar documento financeiro' },
      { status: 500 }
    );
  }
}
