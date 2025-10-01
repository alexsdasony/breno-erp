import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 Iniciando limpeza de vendas...');

    // Buscar IDs dos clientes que devem ser mantidos
    const clientesToKeep = ['JOSINEI NUNES DO NASCIMENTO', 'LEONARDO DA SILVA LEITÃO'];
    
    const { data: customers, error: customersError } = await supabaseAdmin
      .from('partners')
      .select('id, name')
      .in('name', clientesToKeep);

    if (customersError) {
      console.error('❌ Erro ao buscar clientes:', customersError);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar clientes' },
        { status: 500 }
      );
    }

    console.log('✅ Clientes a manter:', customers);

    const customerIdsToKeep = customers?.map(c => c.id) || [];

    if (customerIdsToKeep.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nenhum cliente encontrado com os nomes especificados',
          clientesNaoEncontrados: clientesToKeep
        },
        { status: 400 }
      );
    }

    // Buscar todas as vendas que NÃO são desses clientes
    const { data: salesToDelete, error: salesError } = await supabaseAdmin
      .from('sales')
      .select('id, customer_name')
      .not('customer_id', 'in', `(${customerIdsToKeep.join(',')})`)
      .eq('is_deleted', false);

    if (salesError) {
      console.error('❌ Erro ao buscar vendas:', salesError);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar vendas' },
        { status: 500 }
      );
    }

    console.log(`📊 Vendas a serem deletadas: ${salesToDelete?.length || 0}`);

    if (!salesToDelete || salesToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhuma venda para deletar',
        clientesMantidos: customers.map(c => c.name),
        vendasDeletadas: 0
      });
    }

    const saleIdsToDelete = salesToDelete.map(s => s.id);

    // Deletar itens das vendas primeiro (relacionamento)
    const { error: itemsError } = await supabaseAdmin
      .from('sale_items')
      .delete()
      .in('sale_id', saleIdsToDelete);

    if (itemsError) {
      console.error('❌ Erro ao deletar itens:', itemsError);
    } else {
      console.log('✅ Itens das vendas deletados');
    }

    // Marcar vendas como deletadas (soft delete)
    const { data: deletedSales, error: deleteError } = await supabaseAdmin
      .from('sales')
      .update({ is_deleted: true })
      .in('id', saleIdsToDelete)
      .select();

    if (deleteError) {
      console.error('❌ Erro ao deletar vendas:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Erro ao deletar vendas', details: deleteError.message },
        { status: 500 }
      );
    }

    console.log('✅ Vendas deletadas com sucesso');

    return NextResponse.json({
      success: true,
      message: 'Vendas deletadas com sucesso',
      clientesMantidos: customers.map(c => c.name),
      vendasDeletadas: deletedSales?.length || 0,
      detalhes: {
        customerIdsPreservados: customerIdsToKeep,
        vendasRemovidasIds: saleIdsToDelete
      }
    });

  } catch (error) {
    console.error('❌ Erro ao limpar vendas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

