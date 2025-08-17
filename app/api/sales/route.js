import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM sales ORDER BY created_at DESC');
    client.release();

    return NextResponse.json({
      success: true,
      sales: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vendas' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO sales (
        product, quantity, total, date, status, payment_method, notes,
        customer_id, segment_id, total_amount, final_amount
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        body.product, body.quantity, body.total, body.date, body.status,
        body.payment_method, body.notes, body.customer_id, body.segment_id,
        body.total_amount || body.total, body.final_amount || body.total
      ]
    );
    client.release();

    return NextResponse.json({
      success: true,
      sales: result.rows[0],
      message: 'Venda criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Erro ao criar venda' },
      { status: 500 }
    );
  }
}
