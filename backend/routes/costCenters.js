import express from 'express';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCostCenter, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all cost centers
router.get('/', validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, segment_id } = req.query;
    const offset = (page - 1) * limit;
    const db = await getDatabase();

    let query = 'SELECT * FROM cost_centers WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM cost_centers WHERE 1=1';
    const params = [];
    const countParams = [];

    if (segment_id && segment_id !== 'null' && segment_id !== '') {
      query += ' AND segment_id = ?';
      countQuery += ' AND segment_id = ?';
      params.push(parseInt(segment_id));
      countParams.push(parseInt(segment_id));
    }

    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const costCenters = await db.all(query, params);
    const total = await db.get(countQuery, countParams);

    res.json({
      costCenters,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get cost centers error:', error);
    res.status(500).json({ error: 'Failed to fetch cost centers' });
  }
});

// Create cost center
router.post('/', authenticateToken, validateCostCenter, async (req, res) => {
  try {
    const { name, segment_id } = req.body;
    const db = await getDatabase();

    if (segment_id) {
      const segment = await db.get('SELECT id FROM segments WHERE id = ?', [segment_id]);
      if (!segment) {
        return res.status(400).json({ error: 'Invalid segment ID' });
      }
    }

    const result = await db.run(
      'INSERT INTO cost_centers (name, segment_id) VALUES (?, ?)',
      [name, segment_id || null]
    );

    const costCenter = await db.get('SELECT * FROM cost_centers WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Cost center created successfully',
      costCenter
    });

  } catch (error) {
    console.error('Create cost center error:', error);
    res.status(500).json({ error: 'Failed to create cost center' });
  }
});

// Update cost center
router.put('/:id', authenticateToken, validateId, validateCostCenter, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, segment_id } = req.body;
    const db = await getDatabase();

    const existingCostCenter = await db.get('SELECT * FROM cost_centers WHERE id = ?', [id]);
    if (!existingCostCenter) {
      return res.status(404).json({ error: 'Cost center not found' });
    }

    await db.run(
      'UPDATE cost_centers SET name = ?, segment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, segment_id || null, id]
    );

    const costCenter = await db.get('SELECT * FROM cost_centers WHERE id = ?', [id]);

    res.json({
      message: 'Cost center updated successfully',
      costCenter
    });

  } catch (error) {
    console.error('Update cost center error:', error);
    res.status(500).json({ error: 'Failed to update cost center' });
  }
});

// Delete cost center
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const costCenter = await db.get('SELECT * FROM cost_centers WHERE id = ?', [id]);
    if (!costCenter) {
      return res.status(404).json({ error: 'Cost center not found' });
    }

    await db.run('DELETE FROM cost_centers WHERE id = ?', [id]);

    res.json({ message: 'Cost center deleted successfully' });

  } catch (error) {
    console.error('Delete cost center error:', error);
    res.status(500).json({ error: 'Failed to delete cost center' });
  }
});

export default router; 