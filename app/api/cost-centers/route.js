import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM cost_centers ORDER BY name ASC');
    client.release();

    return NextResponse.json({
      success: true,
      costCenters: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching cost centers:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar centros de custo' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(
      'INSERT INTO cost_centers (name, description, segment_id) VALUES ($1, $2, $3) RETURNING *',
      [body.name, body.description, body.segment_id]
    );
    client.release();

    return NextResponse.json({
      success: true,
      costCenters: result.rows[0],
      message: 'Centro de custo criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating cost center:', error);
    return NextResponse.json(
      { error: 'Erro ao criar centro de custo' },
      { status: 500 }
    );
  }
}
