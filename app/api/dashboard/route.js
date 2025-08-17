import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:admin123@localhost:5432/breno_erp',
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const segmentId = searchParams.get('segmentId');
    
    const client = await pool.connect();
    
    // Construir filtro de segmento
    const segmentFilter = segmentId ? 'WHERE segment_id = $1' : '';
    const params = segmentId ? [segmentId] : [];
    
    // Buscar dados de vendas
    const salesQuery = `
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(final_amount), 0) as total_revenue,
        COALESCE(AVG(final_amount), 0) as avg_sale_value
      FROM sales 
      ${segmentFilter}
    `;
    
    // Buscar dados de produtos
    const productsQuery = `
      SELECT 
        COUNT(*) as total_products,
        COALESCE(SUM(stock_quantity), 0) as total_stock,
        COUNT(CASE WHEN stock_quantity <= minimum_stock THEN 1 END) as low_stock_count
      FROM products 
      ${segmentFilter}
    `;
    
    // Buscar dados de clientes
    const customersQuery = `
      SELECT COUNT(*) as total_customers
      FROM customers 
      ${segmentFilter}
    `;
    
    // Buscar dados de cobranças
    const billingsQuery = `
      SELECT 
        COUNT(*) as total_billings,
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(CASE WHEN status = 'Pendente' THEN 1 END) as pending_count,
        COUNT(CASE WHEN status = 'Paga' THEN 1 END) as paid_count,
        COALESCE(SUM(CASE WHEN status = 'Pendente' THEN amount ELSE 0 END), 0) as pending_amount
      FROM billings 
      ${segmentFilter}
    `;
    
    // Buscar dados de transações
    const transactionsQuery = `
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount), 0) as total_transaction_amount,
        COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) as total_revenue_from_transactions
      FROM transactions 
      ${segmentFilter}
    `;
    
    // Executar todas as queries
    const [salesResult, productsResult, customersResult, billingsResult, transactionsResult] = await Promise.all([
      client.query(salesQuery, params),
      client.query(productsQuery, params),
      client.query(customersQuery, params),
      client.query(billingsQuery, params),
      client.query(transactionsQuery, params)
    ]);
    
    client.release();
    
    // Calcular métricas
    const sales = salesResult.rows[0];
    const products = productsResult.rows[0];
    const customers = customersResult.rows[0];
    const billings = billingsResult.rows[0];
    const transactions = transactionsResult.rows[0];
    
    // Retornar dados em formato plano compatível com o frontend
    const metrics = {
      totalRevenue: parseFloat(sales.total_revenue) || 0,
      totalExpenses: parseFloat(transactions.total_expenses) || 0, // Usar transações como despesas
      totalProducts: parseInt(products.total_products) || 0,
      lowStockProducts: parseInt(products.low_stock_count) || 0,
      totalSales: parseInt(sales.total_sales) || 0,
      totalCustomers: parseInt(customers.total_customers) || 0,
      totalBillings: parseInt(billings.total_billings) || 0,
      totalPendingAmount: parseFloat(billings.pending_amount) || 0,
      averageSaleValue: parseFloat(sales.avg_sale_value) || 0,
      totalStock: parseInt(products.total_stock) || 0,
      pendingBillings: parseInt(billings.pending_count) || 0,
      paidBillings: parseInt(billings.paid_count) || 0,
      totalTransactions: parseInt(transactions.total_transactions) || 0,
      totalTransactionAmount: parseFloat(transactions.total_transaction_amount) || 0
    };
    
    return NextResponse.json({
      success: true,
      metrics,
      segmentId: segmentId || null
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do dashboard' },
      { status: 500 }
    );
  }
}
