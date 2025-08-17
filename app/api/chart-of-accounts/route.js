import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT 
        coa.*,
        s.name as segment_name,
        CASE 
          WHEN coa.type = 'asset' THEN 'Ativo'
          WHEN coa.type = 'liability' THEN 'Passivo'
          WHEN coa.type = 'equity' THEN 'Patrimônio'
          WHEN coa.type = 'revenue' THEN 'Receita'
          WHEN coa.type = 'expense' THEN 'Despesa'
          ELSE coa.type
        END as category
      FROM chart_of_accounts coa
      LEFT JOIN segments s ON coa.segment_id = s.id
      ORDER BY coa.code ASC
    `);
    client.release();

    return NextResponse.json({
      success: true,
      chartOfAccounts: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching chart of accounts:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar plano de contas' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO chart_of_accounts (
        code, name, type, parent_id, segment_id
      ) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        body.code, body.name, body.type, body.parent_id, body.segment_id
      ]
    );
    client.release();

    return NextResponse.json({
      success: true,
      chartOfAccounts: result.rows[0],
      message: 'Conta criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating chart of account:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta' },
      { status: 500 }
    );
  }
}
