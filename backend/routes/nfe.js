import express from 'express';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all NFe
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, segment_id, status } = req.query;
    const offset = (page - 1) * limit;
    const db = await getDatabase();

    let query = 'SELECT * FROM nfe WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM nfe WHERE 1=1';
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

    query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const nfeList = await db.all(query, params);
    const total = await db.get(countQuery, countParams);

    res.json({
      nfeList,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get NFe error:', error);
    res.status(500).json({ error: 'Failed to fetch NFe' });
  }
});

// Create NFe
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { number, customer_name, date, total, status, segment_id } = req.body;
    const db = await getDatabase();

    if (!number || !customer_name || !date || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (segment_id) {
      const segment = await db.get('SELECT id FROM segments WHERE id = ?', [segment_id]);
      if (!segment) {
        return res.status(400).json({ error: 'Invalid segment ID' });
      }
    }

    const result = await db.run(
      'INSERT INTO nfe (number, customer_name, date, total, status, segment_id) VALUES (?, ?, ?, ?, ?, ?)',
      [number, customer_name, date, total, status || 'Emitida', segment_id || null]
    );

    const nfe = await db.get('SELECT * FROM nfe WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'NFe created successfully',
      nfe
    });

  } catch (error) {
    console.error('Create NFe error:', error);
    res.status(500).json({ error: 'Failed to create NFe' });
  }
});

// Update NFe
router.put('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { number, customer_name, date, total, status, segment_id } = req.body;
    const db = await getDatabase();

    const existingNfe = await db.get('SELECT * FROM nfe WHERE id = ?', [id]);
    if (!existingNfe) {
      return res.status(404).json({ error: 'NFe not found' });
    }

    await db.run(
      'UPDATE nfe SET number = ?, customer_name = ?, date = ?, total = ?, status = ?, segment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [number, customer_name, date, total, status, segment_id || null, id]
    );

    const nfe = await db.get('SELECT * FROM nfe WHERE id = ?', [id]);

    res.json({
      message: 'NFe updated successfully',
      nfe
    });

  } catch (error) {
    console.error('Update NFe error:', error);
    res.status(500).json({ error: 'Failed to update NFe' });
  }
});

// Delete NFe
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const nfe = await db.get('SELECT * FROM nfe WHERE id = ?', [id]);
    if (!nfe) {
      return res.status(404).json({ error: 'NFe not found' });
    }

    await db.run('DELETE FROM nfe WHERE id = ?', [id]);

    res.json({ message: 'NFe deleted successfully' });

  } catch (error) {
    console.error('Delete NFe error:', error);
    res.status(500).json({ error: 'Failed to delete NFe' });
  }
});

export default router; 