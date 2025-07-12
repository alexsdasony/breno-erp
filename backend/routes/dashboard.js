import express from 'express';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/dashboard
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { segmentId } = req.query;

    // Buscar métricas do dashboard
    const metrics = await db.get(`
      SELECT 
        COUNT(DISTINCT t.id) as total_transactions,
        COUNT(DISTINCT s.id) as total_sales,
        COUNT(DISTINCT b.id) as total_billings,
        COUNT(DISTINCT n.id) as total_nfe,
        COALESCE(SUM(s.total), 0) as total_revenue,
        COALESCE(SUM(b.amount), 0) as total_receivables
      FROM transactions t
      LEFT JOIN sales s ON s.id = t.id
      LEFT JOIN billings b ON b.id = t.id
      LEFT JOIN nfe n ON n.id = t.id
      ${segmentId ? 'WHERE t.segment_id = ?' : ''}
    `, segmentId ? [segmentId] : []);

    // Buscar dados para gráficos
    const monthlyData = await db.all(`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total
      FROM (
        SELECT created_at, total FROM sales
        UNION ALL
        SELECT created_at, amount as total FROM billings
      ) combined
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `);

    const topCustomers = await db.all(`
      SELECT 
        customer_name,
        COUNT(*) as count,
        COALESCE(SUM(total), 0) as total
      FROM sales
      GROUP BY customer_name
      ORDER BY total DESC
      LIMIT 5
    `);

    res.json({
      metrics,
      monthlyData,
      topCustomers
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
});

export default router; 