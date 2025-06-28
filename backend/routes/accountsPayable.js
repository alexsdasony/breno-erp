import express from 'express';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateAccountPayable, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all accounts payable
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, segment_id, status } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = 'SELECT * FROM accounts_payable WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM accounts_payable WHERE 1=1';
    const params = [];
    const countParams = [];

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

    query += ' ORDER BY due_date ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const accountsPayable = await db.all(query, params);
    const total = await db.get(countQuery, countParams);

    res.json({
      accountsPayable,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get accounts payable error:', error);
    res.status(500).json({ error: 'Failed to fetch accounts payable' });
  }
});

// Create account payable
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { supplier, description, amount, due_date, status, segment_id } = req.body;
    const db = getDatabase();

    if (!supplier || !description || !amount || !due_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (segment_id) {
      const segment = await db.get('SELECT id FROM segments WHERE id = ?', [segment_id]);
      if (!segment) {
        return res.status(400).json({ error: 'Invalid segment ID' });
      }
    }

    const result = await db.run(
      'INSERT INTO accounts_payable (supplier, description, amount, due_date, status, segment_id) VALUES (?, ?, ?, ?, ?, ?)',
      [supplier, description, amount, due_date, status || 'pending', segment_id || null]
    );

    const account = await db.get('SELECT * FROM accounts_payable WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Account payable created successfully',
      account
    });

  } catch (error) {
    console.error('Create account payable error:', error);
    res.status(500).json({ error: 'Failed to create account payable' });
  }
});

// Update account payable
router.put('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier, description, amount, due_date, status, segment_id } = req.body;
    const db = getDatabase();

    const existingAccount = await db.get('SELECT * FROM accounts_payable WHERE id = ?', [id]);
    if (!existingAccount) {
      return res.status(404).json({ error: 'Account payable not found' });
    }

    await db.run(
      'UPDATE accounts_payable SET supplier = ?, description = ?, amount = ?, due_date = ?, status = ?, segment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [supplier, description, amount, due_date, status, segment_id || null, id]
    );

    const account = await db.get('SELECT * FROM accounts_payable WHERE id = ?', [id]);

    res.json({
      message: 'Account payable updated successfully',
      account
    });

  } catch (error) {
    console.error('Update account payable error:', error);
    res.status(500).json({ error: 'Failed to update account payable' });
  }
});

// Delete account payable
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const account = await db.get('SELECT * FROM accounts_payable WHERE id = ?', [id]);
    if (!account) {
      return res.status(404).json({ error: 'Account payable not found' });
    }

    await db.run('DELETE FROM accounts_payable WHERE id = ?', [id]);

    res.json({ message: 'Account payable deleted successfully' });

  } catch (error) {
    console.error('Delete account payable error:', error);
    res.status(500).json({ error: 'Failed to delete account payable' });
  }
});

export default router; 