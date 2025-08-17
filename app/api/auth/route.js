import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';

// Configuração do banco local
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

const JWT_SECRET = process.env.JWT_SECRET || 'f3696dd52f7674b95e4606c46a6e69065b65600544b4129ba7b09538476f06fa600fcc77ebe4c610026a24bfc95c4ce4cad1e353a4a9246562c1d90e35f01a1d';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar usuário no banco
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE email = $1 AND status = $2',
        [email, 'active']
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 401 }
        );
      }

      const user = result.rows[0];

      // Verificar senha
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Senha incorreta' },
          { status: 401 }
        );
      }

      // Gerar token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Retornar resposta sem dados sensíveis
      const userResponse = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status
      };

      return NextResponse.json({
        success: true,
        user: userResponse,
        token: token
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Erro na autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscar usuário atualizado no banco
      const client = await pool.connect();
      try {
        const result = await client.query(
          'SELECT id, email, name, role, status FROM users WHERE id = $1 AND status = $2',
          [decoded.id, 'active']
        );

        if (result.rows.length === 0) {
          return NextResponse.json(
            { error: 'Usuário não encontrado' },
            { status: 401 }
          );
        }

        const user = result.rows[0];
        return NextResponse.json({
          success: true,
          user: user
        });

      } finally {
        client.release();
      }

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
