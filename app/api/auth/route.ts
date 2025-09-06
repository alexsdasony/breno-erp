import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 API Route POST /api/auth');
    
    const body = await request.json();
    const { email, password } = body;
    
    console.log('📝 Dados de login:', { email, hasPassword: !!password });
    
    // Simular autenticação - em produção, usar Supabase Auth
    if (email && password) {
      // Buscar usuário no banco
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('status', 'ativo')
        .single();
      
      if (error || !user) {
        console.log('❌ Usuário não encontrado:', error);
        return NextResponse.json(
          { error: 'Credenciais inválidas' },
          { status: 401 }
        );
      }
      
      // Simular token JWT simples
      const token = Buffer.from(JSON.stringify({
        user_id: user.id,
        email: user.email,
        name: user.name,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 horas
      })).toString('base64');
      
      console.log('✅ Login realizado com sucesso para:', user.email);
      
      return NextResponse.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          segment_id: user.segment_id
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Email e senha são obrigatórios' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
