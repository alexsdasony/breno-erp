import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get comprehensive metrics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { segment_id, start_date, end_date } = req.query;
    const db = getDatabase();

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (segment_id) {
      whereClause += ' AND segment_id = ?';
      params.push(segment_id);
    }

    if (start_date) {
      whereClause += ' AND date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ' AND date <= ?';
      params.push(end_date);
    }

    // Financial metrics
    const [revenueData, expenseData] = await Promise.all([
      db.get(`SELECT SUM(amount) as total FROM transactions ${whereClause} AND type = 'receita'`, params),
      db.get(`SELECT SUM(amount) as total FROM transactions ${whereClause} AND type = 'despesa'`, params)
    ]);

    const totalRevenue = revenueData.total || 0;
    const totalExpenses = expenseData.total || 0;
    const profit = totalRevenue - totalExpenses;

    // Product metrics
    let productWhereClause = '1=1';
    const productParams = [];
    if (segment_id) {
      productWhereClause += ' AND segment_id = ?';
      productParams.push(segment_id);
    }

    const [productsData, lowStockData] = await Promise.all([
      db.get(`SELECT COUNT(*) as total FROM products WHERE ${productWhereClause}`, productParams),
      db.get(`SELECT COUNT(*) as total FROM products WHERE ${productWhereClause} AND stock <= min_stock`, productParams)
    ]);

    const totalProducts = productsData.total;
    const lowStockProducts = lowStockData.total;

    // Sales metrics
    const [salesData, completedSalesData] = await Promise.all([
      db.get(`SELECT COUNT(*) as total FROM sales ${whereClause}`, params),
      db.get(`SELECT COUNT(*) as total FROM sales ${whereClause} AND status = 'Concluída'`, params)
    ]);

    const totalSales = salesData.total;
    const completedSales = completedSalesData.total;

    // Customer metrics
    let customerQuery = 'SELECT COUNT(DISTINCT id) as total FROM customers';
    let customerParams = [];

    if (segment_id) {
      // For segment filtering, count customers who have sales in that segment
      customerQuery = 'SELECT COUNT(DISTINCT customer_id) as total FROM sales WHERE segment_id = ?';
      customerParams = [segment_id];
    }

    const customersData = await db.get(customerQuery, customerParams);
    const totalCustomers = customersData.total;

    // NFe metrics
    const nfeData = await db.get(`SELECT COUNT(*) as total FROM nfe ${whereClause}`, params);
    const totalNFe = nfeData.total;

    // Billing metrics
    const [billingsData, overdueBillingsData, totalPendingData] = await Promise.all([
      db.get(`SELECT COUNT(*) as total FROM billings ${whereClause}`, params),
      db.get(`SELECT COUNT(*) as total FROM billings ${whereClause} AND status = 'Vencida'`, params),
      db.get(`SELECT SUM(amount) as total FROM billings ${whereClause} AND status IN ('Pendente', 'Vencida')`, params)
    ]);

    const totalBillings = billingsData.total;
    const overdueBillings = overdueBillingsData.total;
    const totalPendingAmount = totalPendingData.total || 0;
    const defaultRate = totalBillings > 0 ? (overdueBillings / totalBillings) * 100 : 0;

    res.json({
      financial: {
        totalRevenue,
        totalExpenses,
        profit,
        profitMargin: totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
      },
      products: {
        totalProducts,
        lowStockProducts,
        lowStockPercentage: totalProducts > 0 ? (lowStockProducts / totalProducts) * 100 : 0
      },
      sales: {
        totalSales,
        completedSales,
        conversionRate: totalSales > 0 ? (completedSales / totalSales) * 100 : 0
      },
      customers: {
        totalCustomers
      },
      nfe: {
        totalNFe
      },
      billing: {
        totalBillings,
        overdueBillings,
        totalPendingAmount,
        defaultRate
      },
      period: {
        start_date: start_date || 'all',
        end_date: end_date || 'all',
        segment_id: segment_id || 'all'
      }
    });

  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get financial dashboard data
router.get('/financial', authenticateToken, async (req, res) => {
  try {
    const { segment_id, period = '30' } = req.query;
    const db = getDatabase();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    const startDateStr = startDate.toISOString().split('T')[0];

    let whereClause = 'WHERE date >= ?';
    const params = [startDateStr];

    if (segment_id) {
      whereClause += ' AND segment_id = ?';
      params.push(segment_id);
    }

    // Daily revenue and expenses
    const dailyData = await db.all(`
      SELECT 
        date,
        SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END) as revenue,
        SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END) as expenses
      FROM transactions 
      ${whereClause}
      GROUP BY date 
      ORDER BY date
    `, params);

    // Category breakdown
    const categoryData = await db.all(`
      SELECT 
        category,
        type,
        SUM(amount) as total
      FROM transactions 
      ${whereClause}
      GROUP BY category, type 
      ORDER BY total DESC
    `, params);

    // Monthly comparison
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const [currentMonthData, lastMonthData] = await Promise.all([
      db.get(`
        SELECT 
          SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END) as revenue,
          SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END) as expenses
        FROM transactions 
        WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
        ${segment_id ? 'AND segment_id = ?' : ''}
      `, segment_id ? [String(currentMonth + 1).padStart(2, '0'), String(currentYear), segment_id] : [String(currentMonth + 1).padStart(2, '0'), String(currentYear)]),
      
      db.get(`
        SELECT 
          SUM(CASE WHEN type = 'receita' THEN amount ELSE 0 END) as revenue,
          SUM(CASE WHEN type = 'despesa' THEN amount ELSE 0 END) as expenses
        FROM transactions 
        WHERE strftime('%m', date) = ? AND strftime('%Y', date) = ?
        ${segment_id ? 'AND segment_id = ?' : ''}
      `, segment_id ? [String(lastMonth + 1).padStart(2, '0'), String(lastMonthYear), segment_id] : [String(lastMonth + 1).padStart(2, '0'), String(lastMonthYear)])
    ]);

    res.json({
      dailyData,
      categoryData,
      monthlyComparison: {
        current: {
          revenue: currentMonthData.revenue || 0,
          expenses: currentMonthData.expenses || 0,
          profit: (currentMonthData.revenue || 0) - (currentMonthData.expenses || 0)
        },
        previous: {
          revenue: lastMonthData.revenue || 0,
          expenses: lastMonthData.expenses || 0,
          profit: (lastMonthData.revenue || 0) - (lastMonthData.expenses || 0)
        }
      }
    });

  } catch (error) {
    console.error('Get financial metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch financial metrics' });
  }
});

// Get sales dashboard data
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const { segment_id, period = '30' } = req.query;
    const db = getDatabase();

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    const startDateStr = startDate.toISOString().split('T')[0];

    let whereClause = 'WHERE date >= ?';
    const params = [startDateStr];

    if (segment_id) {
      whereClause += ' AND segment_id = ?';
      params.push(segment_id);
    }

    // Daily sales data
    const dailySales = await db.all(`
      SELECT 
        date,
        COUNT(*) as sales_count,
        SUM(total) as revenue,
        AVG(total) as avg_ticket
      FROM sales 
      ${whereClause} AND status = 'Concluída'
      GROUP BY date 
      ORDER BY date
    `, params);

    // Top products
    const topProducts = await db.all(`
      SELECT 
        product,
        COUNT(*) as sales_count,
        SUM(total) as revenue,
        SUM(quantity) as total_quantity
      FROM sales 
      ${whereClause} AND status = 'Concluída'
      GROUP BY product 
      ORDER BY sales_count DESC 
      LIMIT 10
    `, params);

    // Top customers
    const topCustomers = await db.all(`
      SELECT 
        customer_name,
        COUNT(*) as sales_count,
        SUM(total) as revenue
      FROM sales 
      ${whereClause} AND status = 'Concluída'
      GROUP BY customer_id, customer_name 
      ORDER BY revenue DESC 
      LIMIT 10
    `, params);

    // Sales by status
    const salesByStatus = await db.all(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total) as total_value
      FROM sales 
      ${whereClause}
      GROUP BY status
    `, params);

    res.json({
      dailySales,
      topProducts,
      topCustomers,
      salesByStatus
    });

  } catch (error) {
    console.error('Get sales metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch sales metrics' });
  }
});

export default router; 