import express from 'express';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateBilling, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all billings
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, segment_id, status, overdue } = req.query;
    const offset = (page - 1) * limit;
    const db = await getDatabase();

    let query = 'SELECT * FROM billings WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM billings WHERE 1=1';
    const params = [];
    const countParams = [];

    if (segment_id && segment_id !== 'null' && segment_id !== '') {
      query += ' AND segment_id = ?';
      countQuery += ' AND segment_id = ?';
      params.push(parseInt(segment_id));
      countParams.push(parseInt(segment_id));
    }

    if (status) {
      query += ' AND status = ?';
      countQuery += ' AND status = ?';
      params.push(status);
      countParams.push(status);
    }

    if (overdue === 'true') {
      query += ' AND due_date < date("now") AND status != "Paga"';
      countQuery += ' AND due_date < date("now") AND status != "Paga"';
    }

    query += ' ORDER BY due_date ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const billings = await db.all(query, params);
    const total = await db.get(countQuery, countParams);

    res.json({
      billings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get billings error:', error);
    res.status(500).json({ error: 'Failed to fetch billings' });
  }
});

// Create billing
router.post('/', authenticateToken, validateBilling, async (req, res) => {
  try {
    const { customer_id, customer_name, amount, due_date, status, segment_id, nfe_id, description } = req.body;
    const db = await getDatabase();

    const customer = await db.get('SELECT id FROM customers WHERE id = ?', [customer_id]);
    if (!customer) {
      return res.status(400).json({ error: 'Invalid customer ID' });
    }

    const segment = await db.get('SELECT id FROM segments WHERE id = ?', [segment_id]);
    if (!segment) {
      return res.status(400).json({ error: 'Invalid segment ID' });
    }

    const result = await db.run(
      'INSERT INTO billings (customer_id, customer_name, amount, due_date, status, segment_id, nfe_id, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [customer_id, customer_name, amount, due_date, status, segment_id, nfe_id || null, description || null]
    );

    const billing = await db.get('SELECT * FROM billings WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Billing created successfully',
      billing
    });

  } catch (error) {
    console.error('Create billing error:', error);
    res.status(500).json({ error: 'Failed to create billing' });
  }
});

// Update billing
router.put('/:id', authenticateToken, validateId, validateBilling, async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_id, customer_name, amount, due_date, status, payment_date, segment_id, nfe_id, description } = req.body;
    
    const db = await getDatabase();

    const existingBilling = await db.get('SELECT * FROM billings WHERE id = ?', [id]);
    if (!existingBilling) {
      return res.status(404).json({ error: 'Billing not found' });
    }

    // Se customer_name não foi fornecido, buscar pelo customer_id
    let finalCustomerName = customer_name;
    if (!finalCustomerName && customer_id) {
      const customer = await db.get('SELECT name FROM customers WHERE id = ?', [customer_id]);
      if (customer) {
        finalCustomerName = customer.name;
      }
    }

    await db.run(
      'UPDATE billings SET customer_id = ?, customer_name = ?, amount = ?, due_date = ?, status = ?, payment_date = ?, segment_id = ?, nfe_id = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [customer_id, finalCustomerName, amount, due_date, status, payment_date || null, segment_id, nfe_id || null, description || null, id]
    );

    const billing = await db.get('SELECT * FROM billings WHERE id = ?', [id]);

    res.json({
      message: 'Billing updated successfully',
      billing
    });

  } catch (error) {
    console.error('Update billing error:', error);
    res.status(500).json({ error: 'Failed to update billing' });
  }
});

// Delete billing
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const billing = await db.get('SELECT * FROM billings WHERE id = ?', [id]);
    if (!billing) {
      return res.status(404).json({ error: 'Billing not found' });
    }

    await db.run('DELETE FROM billings WHERE id = ?', [id]);

    res.json({ message: 'Billing deleted successfully' });

  } catch (error) {
    console.error('Delete billing error:', error);
    res.status(500).json({ error: 'Failed to delete billing' });
  }
});

export default router; 