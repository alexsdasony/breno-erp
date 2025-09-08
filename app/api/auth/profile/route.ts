import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    console.log('👤 API Route GET /api/auth/profile');
    
    const authHeader = request.headers.get('X-User-Token');
    
    if (!authHeader) {
      console.log('❌ Token não fornecido');
      return NextResponse.json(
        { error: 'Token de autenticação necessário' },
        { status: 401 }
      );
    }
    
    // Decodificar token simples
    try {
      const tokenData = JSON.parse(Buffer.from(authHeader, 'base64').toString());
      
      if (tokenData.exp && tokenData.exp < Date.now()) {
        console.log('❌ Token expirado');
        return NextResponse.json(
          { error: 'Token expirado' },
          { status: 401 }
        );
      }
      
      // Buscar dados atualizados do usuário
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', tokenData.user_id)
        .single();
      
      if (error || !user) {
        console.log('❌ Usuário não encontrado:', error);
        return NextResponse.json(
          { error: 'Usuário não encontrado' },
          { status: 404 }
        );
      }
      
      console.log('✅ Perfil carregado para:', user.email);
      
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          profile: user.profile,
          segment_id: user.segment_id,
          status: user.status
        }
      });
      
    } catch (tokenError) {
      console.log('❌ Token inválido:', tokenError);
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('❌ Erro ao carregar perfil:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
