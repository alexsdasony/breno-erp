import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Buscando clientes com nome "CLIENTE"...');
    
    // Buscar clientes com nome "CLIENTE"
    const { data: customers, error } = await supabaseAdmin
      .from('partners')
      .select(`
        id,
        name,
        email,
        phone,
        tax_id,
        created_at,
        partner_roles!inner(role)
      `)
      .eq('partner_roles.role', 'customer')
      .eq('name', 'CLIENTE');

    if (error) {
      console.error('❌ Erro ao buscar clientes:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao buscar clientes',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log(`📊 Encontrados ${customers.length} clientes com nome "CLIENTE"`);
    
    // Processar sugestões de nomes baseados em email
    const customersWithSuggestions = customers.map(customer => {
      let suggestedName = null;
      if (customer.email) {
        const emailName = customer.email.split('@')[0];
        suggestedName = emailName
          .replace(/[._-]/g, ' ')
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }
      
      return {
        ...customer,
        suggestedName
      };
    });

    return NextResponse.json({
      success: true,
      count: customers.length,
      customers: customersWithSuggestions
    });
    
  } catch (error) {
    console.error('❌ Erro na API:', error);
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, newName } = body;
    
    if (!customerId || !newName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'customerId e newName são obrigatórios'
        },
        { status: 400 }
      );
    }

    console.log(`🔧 Atualizando cliente ${customerId} para nome: ${newName}`);
    
    // Atualizar o nome do cliente
    const { data, error } = await supabaseAdmin
      .from('partners')
      .update({ name: newName })
      .eq('id', customerId)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erro ao atualizar cliente',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('✅ Cliente atualizado:', data);
    return NextResponse.json({
      success: true,
      customer: data
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error);
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
