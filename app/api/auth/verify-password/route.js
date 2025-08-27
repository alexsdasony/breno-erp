import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    // Extrair token do cabeçalho Authorization
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Token de acesso requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Verificar e decodificar o token JWT
    let decoded
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      return Response.json(
        { error: 'Token inválido ou expirado' },
        { status: 401 }
      )
    }

    // Extrair dados do corpo da requisição
    const { password } = await request.json()

    if (!password) {
      return Response.json(
        { error: 'Senha é obrigatória' },
        { status: 400 }
      )
    }

    // Buscar o usuário no banco de dados
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash')
      .eq('id', decoded.userId)
      .single()

    if (userError || !user) {
      return Response.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Verificar se a senha está correta
    const isPasswordValid = await bcrypt.compare(password, user.password_hash)

    if (!isPasswordValid) {
      return Response.json(
        { error: 'Senha incorreta' },
        { status: 401 }
      )
    }

    // Senha válida
    return Response.json(
      { message: 'Senha verificada com sucesso' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Erro ao verificar senha:', error)
    return Response.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}