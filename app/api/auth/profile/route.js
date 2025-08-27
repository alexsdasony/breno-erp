import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

const JWT_SECRET = process.env.JWT_SECRET || 'f3696dd52f7674b95e4606c46a6e69065b65600544b4129ba7b09538476f06fa600fcc77ebe4c610026a24bfc95c4ce4cad1e353a4a9246562c1d90e35f01a1d';

export async function GET(request) {
  try {
    // Extrair token do header Authorization ou X-User-Token
    let token = null;
    const authHeader = request.headers.get('authorization');
    const userTokenHeader = request.headers.get('x-user-token');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (userTokenHeader) {
      token = userTokenHeader;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }
    
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar dados do usuário no banco
    const client = await pool.connect();
    const result = await client.query(
      'SELECT id, email, name, role, active, created_at FROM users WHERE id = $1 AND active = true',
      [decoded.userId]
    );
    client.release();

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const user = result.rows[0];
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao buscar perfil' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    // Extrair token do header Authorization ou X-User-Token
    let token = null;
    const authHeader = request.headers.get('authorization');
    const userTokenHeader = request.headers.get('x-user-token');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (userTokenHeader) {
      token = userTokenHeader;
    }
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }
    
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    const { name, email } = body;
    
    // Validações básicas
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Verificar se o email já existe para outro usuário
    const client = await pool.connect();
    const emailCheck = await client.query(
      'SELECT id FROM users WHERE email = $1 AND id != $2',
      [email, decoded.userId]
    );
    
    if (emailCheck.rows.length > 0) {
      client.release();
      return NextResponse.json(
        { error: 'Este email já está sendo usado por outro usuário' },
        { status: 400 }
      );
    }
    
    // Atualizar dados do usuário
    const result = await client.query(
      'UPDATE users SET name = $1, email = $2, updated_at = NOW() WHERE id = $3 AND active = true RETURNING id, email, name, role, active, created_at',
      [name, email, decoded.userId]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        created_at: user.created_at
      },
      message: 'Perfil atualizado com sucesso'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
    
    if (error.name === 'TokenExpiredError') {
      return NextResponse.json(
        { error: 'Token expirado' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erro ao atualizar perfil' },
      { status: 500 }
    );
  }
}
