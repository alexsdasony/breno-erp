import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM accounts_payable ORDER BY due_date ASC');
    client.release();

    // Mapear os status para o formato esperado pelo frontend
    const accountsPayable = result.rows.map(row => ({
      ...row,
      status: row.status === 'pending' ? 'pendente' : 
              row.status === 'paid' ? 'paga' : 
              row.status === 'overdue' ? 'vencida' : row.status
    }));

    return NextResponse.json({
      success: true,
      accountsPayable,
      total: accountsPayable.length
    });
  } catch (error) {
    console.error('Error fetching accounts payable:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar contas a pagar' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const data = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO accounts_payable (
        description, 
        amount, 
        due_date, 
        status, 
        supplier_id, 
        segment_id,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
      [
        data.description,
        data.amount,
        data.due_date,
        data.status || 'Pendente',
        data.supplier_id,
        data.segment_id
      ]
    );
    
    client.release();

    return NextResponse.json({
      success: true,
      accountsPayable: result.rows[0],
      message: 'Conta a pagar criada com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating accounts payable:', error);
    return NextResponse.json(
      { error: 'Erro ao criar conta a pagar' },
      { status: 500 }
    );
  }
}
