import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM products ORDER BY name ASC');
    client.release();

    return NextResponse.json({
      success: true,
      products: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO products (
        name, stock_quantity, minimum_stock, price, category, code, 
        description, cost, supplier, segment_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        body.name, body.stock_quantity || body.stock, body.minimum_stock || body.min_stock,
        body.price, body.category, body.code, body.description, body.cost || body.cost_price,
        body.supplier, body.segment_id
      ]
    );
    client.release();

    return NextResponse.json({
      success: true,
      products: result.rows[0],
      message: 'Produto criado com sucesso'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    );
  }
}
