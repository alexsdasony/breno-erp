import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM transactions ORDER BY created_at DESC');
    client.release();

    return NextResponse.json({
      success: true,
      transactions: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar transações' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO transactions (
        description, amount, type, date, category, cost_center_id, segment_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        body.description, body.amount, body.type, body.date, body.category,
        body.cost_center_id, body.segment_id
      ]
    );
    client.release();

    return NextResponse.json({
      success: true,
      transactions: result.rows[0],
      message: 'Transação criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Erro ao criar transação' },
      { status: 500 }
    );
  }
}
