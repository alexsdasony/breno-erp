import express from 'express';
import { getDatabase } from '../database/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTransaction, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all transactions
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, segment_id, type, category, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    let query = 'SELECT * FROM transactions WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM transactions WHERE 1=1';
    const params = [];
    const countParams = [];

    // Add filters
    if (segment_id) {
      query += ' AND segment_id = ?';
      countQuery += ' AND segment_id = ?';
      params.push(segment_id);
      countParams.push(segment_id);
    }

    if (type) {
      query += ' AND type = ?';
      countQuery += ' AND type = ?';
      params.push(type);
      countParams.push(type);
    }

    if (category) {
      query += ' AND category LIKE ?';
      countQuery += ' AND category LIKE ?';
      params.push(`%${category}%`);
      countParams.push(`%${category}%`);
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

    const transactions = await db.all(query, params);
    const total = await db.get(countQuery, countParams);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction by ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// Create new transaction
router.post('/', authenticateToken, validateTransaction, async (req, res) => {
  try {
    const { type, description, amount, date, category, cost_center, segment_id } = req.body;
    const db = getDatabase();

    // Verify segment exists
    const segment = await db.get('SELECT id FROM segments WHERE id = ?', [segment_id]);
    if (!segment) {
      return res.status(400).json({ error: 'Invalid segment ID' });
    }

    const result = await db.run(
      'INSERT INTO transactions (type, description, amount, date, category, cost_center, segment_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [type, description, amount, date, category, cost_center || null, segment_id]
    );

    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Update transaction
router.put('/:id', authenticateToken, validateId, validateTransaction, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, amount, date, category, cost_center, segment_id } = req.body;
    const db = getDatabase();

    // Check if transaction exists
    const existingTransaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!existingTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify segment exists
    const segment = await db.get('SELECT id FROM segments WHERE id = ?', [segment_id]);
    if (!segment) {
      return res.status(400).json({ error: 'Invalid segment ID' });
    }

    await db.run(
      'UPDATE transactions SET type = ?, description = ?, amount = ?, date = ?, category = ?, cost_center = ?, segment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [type, description, amount, date, category, cost_center || null, segment_id, id]
    );

    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });

  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if transaction exists
    const transaction = await db.get('SELECT * FROM transactions WHERE id = ?', [id]);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    await db.run('DELETE FROM transactions WHERE id = ?', [id]);

    res.json({ message: 'Transaction deleted successfully' });

  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Bulk import transactions
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { transactions } = req.body;
    const db = getDatabase();

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'Invalid transactions data' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < transactions.length; i++) {
      const transaction = transactions[i];
      try {
        // Validate required fields
        if (!transaction.type || !transaction.description || !transaction.amount || !transaction.date || !transaction.category || !transaction.segment_id) {
          errors.push({ index: i, error: 'Missing required fields' });
          continue;
        }

        // Verify segment exists
        const segment = await db.get('SELECT id FROM segments WHERE id = ?', [transaction.segment_id]);
        if (!segment) {
          errors.push({ index: i, error: 'Invalid segment ID' });
          continue;
        }

        const result = await db.run(
          'INSERT INTO transactions (type, description, amount, date, category, cost_center, segment_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            transaction.type,
            transaction.description,
            parseFloat(transaction.amount),
            transaction.date,
            transaction.category,
            transaction.cost_center || null,
            transaction.segment_id
          ]
        );

        results.push({ index: i, id: result.lastID });

      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    res.json({
      message: `Bulk import completed. ${results.length} transactions imported, ${errors.length} errors`,
      imported: results.length,
      errors: errors.length,
      details: { results, errors }
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import transactions' });
  }
});

export default router; 