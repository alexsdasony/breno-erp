import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/getSupabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    console.log('🔧 Executando migração para adicionar coluna active na tabela payment_methods...');
    
    // Adicionar coluna active se não existir
    const { error: alterError } = await supabaseAdmin.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.payment_methods 
        ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
      `
    });
    
    if (alterError) {
      console.error('❌ Erro ao adicionar coluna active:', alterError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao adicionar coluna active',
          details: alterError.message 
        },
        { status: 500 }
      );
    }
    
    // Atualizar registros existentes
    const { error: updateError } = await supabaseAdmin
      .from('payment_methods')
      .update({ active: true })
      .is('active', null);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar registros existentes:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao atualizar registros existentes',
          details: updateError.message 
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Migração executada com sucesso!');
    
    return NextResponse.json({
      success: true,
      message: 'Coluna active adicionada com sucesso na tabela payment_methods'
    });
    
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}
