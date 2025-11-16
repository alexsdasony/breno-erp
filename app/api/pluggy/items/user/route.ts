import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

/**
 * GET /api/pluggy/items/user?userId=xxx
 * Lista items (conexões) da Pluggy associados ao usuário
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId é obrigatório'
        },
        { status: 400 }
      );
    }

    const { data: items, error } = await supabaseAdmin
      .from('pluggy_items')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar items Pluggy:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao buscar items',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      items: items || []
    });
  } catch (error) {
    console.error('❌ Erro ao buscar items Pluggy:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

