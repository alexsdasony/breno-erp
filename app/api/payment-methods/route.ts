import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';


export async function GET(request: NextRequest) {
  try {
    console.log('💳 API Route GET /api/payment-methods');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = (page - 1) * limit;
    
    console.log('📝 Parâmetros:', { page, limit, offset });
    
    // Métodos de pagamento padrão
    const defaultPaymentMethods = [
      { id: '1', name: 'Dinheiro', description: 'Pagamento em dinheiro', active: true },
      { id: '2', name: 'Cartão de Crédito', description: 'Pagamento com cartão de crédito', active: true },
      { id: '3', name: 'Cartão de Débito', description: 'Pagamento com cartão de débito', active: true },
      { id: '4', name: 'PIX', description: 'Pagamento via PIX', active: true },
      { id: '5', name: 'Boleto', description: 'Pagamento via boleto bancário', active: true },
      { id: '6', name: 'Transferência', description: 'Transferência bancária', active: true },
      { id: '7', name: 'Cheque', description: 'Pagamento via cheque', active: true }
    ];

    console.log('📥 Retornando métodos de pagamento padrão');

    return NextResponse.json({
      success: true,
      paymentMethods: defaultPaymentMethods,
      pagination: {
        page,
        limit,
        total: defaultPaymentMethods.length,
        totalPages: 1
      }
    });
    
  } catch (error) {
    console.error('❌ Erro na API de métodos de pagamento:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
