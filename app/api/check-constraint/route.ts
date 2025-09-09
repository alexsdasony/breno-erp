import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    // Consultar a constraint da tabela accounts_payable
    const { data, error } = await supabaseAdmin
      .rpc('get_constraint_info', {
        table_name: 'accounts_payable',
        constraint_name: 'accounts_payable_status_check'
      });

    if (error) {
      // Se a função RPC não existir, tentar consulta direta
      const { data: directData, error: directError } = await supabaseAdmin
        .from('information_schema.check_constraints')
        .select('check_clause')
        .eq('constraint_name', 'accounts_payable_status_check');

      if (directError) {
        return NextResponse.json({
          success: false,
          error: 'Erro ao consultar constraint',
          details: directError.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        constraint: directData?.[0]?.check_clause || 'Constraint não encontrada',
        message: 'Consulta direta realizada'
      });
    }

    return NextResponse.json({
      success: true,
      constraint: data,
      message: 'Constraint consultada via RPC'
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: err.message
    }, { status: 500 });
  }
}
