import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateSale, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all sales
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, segment_id, status, customer_id, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = 'SELECT * FROM sales WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM sales WHERE 1=1';
    const params = [];
    const countParams = [];

    // Add filters
    if (segment_id) {
      query += ' AND segment_id = ?';
      countQuery += ' AND segment_id = ?';
      params.push(segment_id);
      countParams.push(segment_id);
    }

    if (status) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (customer_id) {
      query += ' AND customer_id = ?';
      countQuery += ' AND customer_id = ?';
      params.push(customer_id);
      countParams.push(customer_id);
    }

    if (start_date) {
      query += ' AND date >= ?';
      countQuery += ' AND date >= ?';
      params.push(start_date);
      countParams.push(start_date);
    }

    if (end_date) {
      query += ' AND date <= ?';
      countQuery += ' AND date <= ?';
      params.push(end_date);
      countParams.push(end_date);
    }

    query += ' ORDER BY date DESC, created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const sales = await db.all(query, params);
    const total = await db.get(countQuery, countParams);

    res.json({
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

// Get sale by ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const sale = await db.get('SELECT * FROM sales WHERE id = ?', [id]);

    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Get customer details
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [sale.customer_id]);

    res.json({ 
      sale,
      customer
    });

  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Failed to fetch sale' });
  }
});

// Create new sale
router.post('/', authenticateToken, validateSale, async (req, res) => {
  try {
    const { customer_id, customer_name, product, quantity, total, date, status, segment_id } = req.body;
    const db = getDatabase();

    // Verify customer exists
    const customer = await db.get('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (!customer) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    // Verify segment exists
    const segment = await db.get('SELECT id FROM segments WHERE id = ?', [segment_id]);
    if (!segment) {
      return res.status(400).json({ error: 'Invalid segment ID' });
    }

    const result = await db.run(
      'INSERT INTO sales (customer_id, customer_name, product, quantity, total, date, status, segment_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [customer_id, customer_name, product, quantity, total, date, status, segment_id]
    );

    // Update customer total purchases if sale is completed
    if (status === 'Concluída') {
      await db.run(
        'UPDATE customers SET total_purchases = total_purchases + ?, last_purchase_date = ? WHERE id = ?',
        [total, date, customer_id]
      );

      // Try to update product stock if product exists
      const productRecord = await db.get('SELECT * FROM products WHERE name = ? AND segment_id = ?', [product, segment_id]);
      if (productRecord) {
        const newStock = Math.max(0, productRecord.stock - quantity);
        await db.run('UPDATE products SET stock = ? WHERE id = ?', [newStock, productRecord.id]);
      }
    }

    const sale = await db.get('SELECT * FROM sales WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Sale created successfully',
      sale
    });

  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Failed to create sale' });
  }
});

// Update sale
router.put('/:id', authenticateToken, validateId, validateSale, async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, customer_name, product, quantity, total, date, status, segment_id } = req.body;
    const db = getDatabase();

    // Check if sale exists
    const existingSale = await db.get('SELECT * FROM sales WHERE id = ?', [id]);
    if (!existingSale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // Verify customer exists
    const customer = await db.get('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (!customer) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    // Verify segment exists
    const segment = await db.get('SELECT id FROM segments WHERE id = ?', [segment_id]);
    if (!segment) {
      return res.status(400).json({ error: 'Invalid segment ID' });
    }

    // Handle customer total purchases update
    if (existingSale.status === 'Concluída' && status !== 'Concluída') {
      // Sale was completed, now it's not - subtract from customer total
      await db.run(
        'UPDATE customers SET total_purchases = total_purchases - ? WHERE id = ?',
        [existingSale.total, existingSale.customer_id]
      );
    } else if (existingSale.status !== 'Concluída' && status === 'Concluída') {
      // Sale was not completed, now it is - add to customer total
      await db.run(
        'UPDATE customers SET total_purchases = total_purchases + ?, last_purchase_date = ? WHERE id = ?',
        [total, date, customer_id]
      );
    } else if (existingSale.status === 'Concluída' && status === 'Concluída') {
      // Sale was and still is completed - update the difference
      const difference = total - existingSale.total;
      await db.run(
        'UPDATE customers SET total_purchases = total_purchases + ?, last_purchase_date = ? WHERE id = ?',
        [difference, date, customer_id]
      );
    }

    await db.run(
      'UPDATE sales SET customer_id = ?, customer_name = ?, product = ?, quantity = ?, total = ?, date = ?, status = ?, segment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [customer_id, customer_name, product, quantity, total, date, status, segment_id, id]
    );

    const sale = await db.get('SELECT * FROM sales WHERE id = ?', [id]);

    res.json({
      message: 'Sale updated successfully',
      sale
    });

  } catch (error) {
    console.error('Update sale error:', error);
    res.status(500).json({ error: 'Failed to update sale' });
  }
});

// Delete sale
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if sale exists
    const sale = await db.get('SELECT * FROM sales WHERE id = ?', [id]);
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    // If sale was completed, subtract from customer total purchases
    if (sale.status === 'Concluída') {
      await db.run(
        'UPDATE customers SET total_purchases = total_purchases - ? WHERE id = ?',
        [sale.total, sale.customer_id]
      );
    }

    await db.run('DELETE FROM sales WHERE id = ?', [id]);

    res.json({ message: 'Sale deleted successfully' });

  } catch (error) {
    console.error('Delete sale error:', error);
    res.status(500).json({ error: 'Failed to delete sale' });
  }
});

// Get sales analytics
router.get('/analytics/summary', authenticateToken, async (req, res) => {
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

    const [totalSales, completedSales, pendingSales, cancelledSales, totalRevenue, averageTicket, topProducts] = await Promise.all([
      db.get(`SELECT COUNT(*) as count FROM sales ${whereClause}`, params),
      db.get(`SELECT COUNT(*) as count FROM sales ${whereClause} AND status = 'Concluída'`, params),
      db.get(`SELECT COUNT(*) as count FROM sales ${whereClause} AND status = 'Pendente'`, params),
      db.get(`SELECT COUNT(*) as count FROM sales ${whereClause} AND status = 'Cancelada'`, params),
      db.get(`SELECT SUM(total) as total FROM sales ${whereClause} AND status = 'Concluída'`, params),
      db.get(`SELECT AVG(total) as average FROM sales ${whereClause} AND status = 'Concluída'`, params),
      db.all(`SELECT product, COUNT(*) as sales_count, SUM(total) as revenue FROM sales ${whereClause} AND status = 'Concluída' GROUP BY product ORDER BY sales_count DESC LIMIT 5`, params)
    ]);

    res.json({
      summary: {
        totalSales: totalSales.count,
        completedSales: completedSales.count,
        pendingSales: pendingSales.count,
        cancelledSales: cancelledSales.count,
        totalRevenue: totalRevenue.total || 0,
        averageTicket: averageTicket.average || 0
      },
      topProducts
    });

  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch sales analytics' });
  }
});

// Bulk import sales
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { sales } = req.body;
    const db = getDatabase();

    if (!Array.isArray(sales) || sales.length === 0) {
      return res.status(400).json({ error: 'Invalid sales data' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < sales.length; i++) {
      const sale = sales[i];
      try {
        // Validate required fields
        if (!sale.customer_id || !sale.customer_name || !sale.product || !sale.quantity || !sale.total || !sale.date || !sale.segment_id) {
          errors.push({ index: i, error: 'Missing required fields' });
          continue;
        }

        // Verify customer exists
        const customer = await db.get('SELECT id FROM customers WHERE id = ?', [sale.customer_id]);
        if (!customer) {
          errors.push({ index: i, error: 'Invalid customer ID' });
          continue;
        }

        // Verify segment exists
        const segment = await db.get('SELECT id FROM segments WHERE id = ?', [sale.segment_id]);
        if (!segment) {
          errors.push({ index: i, error: 'Invalid segment ID' });
          continue;
        }

        const result = await db.run(
          'INSERT INTO sales (customer_id, customer_name, product, quantity, total, date, status, segment_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            sale.customer_id,
            sale.customer_name,
            sale.product,
            parseInt(sale.quantity),
            parseFloat(sale.total),
            sale.date,
            sale.status || 'Pendente',
            sale.segment_id
          ]
        );

        // Update customer total if sale is completed
        if ((sale.status || 'Pendente') === 'Concluída') {
          await db.run(
            'UPDATE customers SET total_purchases = total_purchases + ?, last_purchase_date = ? WHERE id = ?',
            [parseFloat(sale.total), sale.date, sale.customer_id]
          );
        }

        results.push({ index: i, id: result.lastID });

      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    res.json({
      message: `Bulk import completed. ${results.length} sales imported, ${errors.length} errors`,
      imported: results.length,
      errors: errors.length,
      details: { results, errors }
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import sales' });
  }
});

export default router; 