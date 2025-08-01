import express from 'express';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    console.log('🔍 Dashboard - Iniciando requisição');
    
    const db = await getDatabase();
    const { segmentId } = req.query;

    console.log('🔍 Dashboard - SegmentId recebido:', segmentId);

    // Query simples para testar
    const transactionsData = await db.all(`
      SELECT COUNT(*) as count, 
             COALESCE(SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END), 0) as revenue,
             COALESCE(SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END), 0) as expenses
      FROM transactions
    `);

    console.log('🔍 Dashboard - Dados de transações:', transactionsData);

    if (!transactionsData || transactionsData.length === 0) {
      console.log('❌ Dashboard - Nenhum dado de transações encontrado');
      return res.status(500).json({ error: 'Failed to load dashboard data' });
    }

    const transactions = transactionsData[0];
    const profit = parseFloat(transactions.revenue) - parseFloat(transactions.expenses);

    const dashboardData = {
      metrics: {
        totalTransactions: parseInt(transactions.count),
        totalRevenue: parseFloat(transactions.revenue),
        totalExpenses: parseFloat(transactions.expenses),
        profit: profit,
        totalSales: 0,
        totalSalesAmount: 0,
        totalBillings: 0,
        totalBillingsAmount: 0,
        totalNFe: 0,
        totalNFeAmount: 0,
        totalProducts: 0,
        totalCustomers: 0
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