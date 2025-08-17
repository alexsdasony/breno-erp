import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM segments ORDER BY name ASC');
    client.release();

    return NextResponse.json({
      success: true,
      segments: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching segments:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar segmentos' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(
      'INSERT INTO segments (name, description) VALUES ($1, $2) RETURNING *',
      [body.name, body.description]
    );
    client.release();

    return NextResponse.json({
      success: true,
      segments: result.rows[0],
      message: 'Segmento criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating segment:', error);
    return NextResponse.json(
      { error: 'Erro ao criar segmento' },
      { status: 500 }
    );
  }
}
