import express from 'express';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { segmentId } = req.query; // Confirme se está pegando corretamente

    console.log('🔍 Dashboard - SegmentId recebido:', segmentId);

    // Validar segmentId - aceitar undefined/null para "todos os segmentos"
    if (segmentId === undefined || segmentId === null || segmentId === '') {
      console.log('🔍 Dashboard - SegmentId não fornecido, usando todos os segmentos');
    }

    // Construir filtro de segmento
    let segmentFilter = '';
    let segmentParams = [];
    
    // Se segmentId é válido e não é 0, aplicar filtro
    if (segmentId && segmentId !== '0' && segmentId !== 0 && segmentId !== 'null' && segmentId !== '') {
      segmentFilter = 'WHERE segment_id = ?';
      segmentParams = [parseInt(segmentId)];
      console.log('🔍 Dashboard - Aplicando filtro para segmento:', segmentId);
    } else {
      console.log('🔍 Dashboard - Sem filtro de segmento (todos os segmentos)');
    }

    // Buscar métricas básicas com filtro de segmento
    const [transactionsData, salesData, billingsData, nfeData, productsData, customersData] = await Promise.all([
      // Transações do mês atual
      db.all(`
        SELECT COUNT(*) as count, COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) as revenue,
               COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as expenses
        FROM transactions 
        ${segmentFilter ? segmentFilter + ' AND' : 'WHERE'} EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE) 
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
      `, segmentParams),
      
      // Vendas do mês atual
      db.all(`
        SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
        FROM sales 
        ${segmentFilter ? segmentFilter + ' AND' : 'WHERE'} EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE) 
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
      `, segmentParams),
      
      // Cobranças do mês atual
      db.all(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
        FROM billings 
        ${segmentFilter ? segmentFilter + ' AND' : 'WHERE'} EXTRACT(YEAR FROM due_date) = EXTRACT(YEAR FROM CURRENT_DATE) 
        AND EXTRACT(MONTH FROM due_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      `, segmentParams),
      
      // NF-e do mês atual
      db.all(`
        SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total
        FROM nfe 
        ${segmentFilter ? segmentFilter + ' AND' : 'WHERE'} EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE) 
        AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM CURRENT_DATE)
      `, segmentParams),
      
      // Total de produtos
      db.all(`
        SELECT COUNT(*) as count
        FROM products 
        ${segmentFilter || ''}
      `, segmentParams),
      
      // Total de clientes
      db.all(`
        SELECT COUNT(*) as count
        FROM customers 
        ${segmentFilter || ''}
      `, segmentParams)
    ]);

    // Verificar se os dados foram carregados corretamente
    if (!transactionsData && !salesData && !billingsData && !nfeData && !productsData && !customersData) {
      console.log('❌ Dashboard - Nenhum dado encontrado');
      return res.status(500).json({ error: 'Failed to load dashboard data' });
    }

    // Extrair valores das consultas
    const transactions = transactionsData[0] || { count: 0, revenue: 0, expenses: 0 };
    const sales = salesData[0] || { count: 0, total: 0 };
    const billings = billingsData[0] || { count: 0, total: 0 };
    const nfe = nfeData[0] || { count: 0, total: 0 };
    const products = productsData[0] || { count: 0 };
    const customers = customersData[0] || { count: 0 };

    // Calcular lucro
    const profit = parseFloat(transactions.revenue) - parseFloat(transactions.expenses);

    const dashboardData = {
      metrics: {
        totalTransactions: parseInt(transactions.count),
        totalRevenue: parseFloat(transactions.revenue),
        totalExpenses: parseFloat(transactions.expenses),
        profit: profit,
        totalSales: parseInt(sales.count),
        totalSalesAmount: parseFloat(sales.total),
        totalBillings: parseInt(billings.count),
        totalBillingsAmount: parseFloat(billings.total),
        totalNFe: parseInt(nfe.count),
        totalNFeAmount: parseFloat(nfe.total),
        totalProducts: parseInt(products.count),
        totalCustomers: parseInt(customers.count)
      },
      recentTransactions: [],
      recentSales: [],
      recentBillings: []
    };

    console.log('✅ Dashboard - Dados processados com sucesso:', dashboardData);

    res.json(dashboardData);
  } catch (error) {
    console.error('❌ Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

export default router; 