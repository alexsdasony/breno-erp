import express from 'express';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateSegment, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all segments
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const segments = await db.all(
      'SELECT * FROM segments ORDER BY name ASC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const total = await db.get('SELECT COUNT(*) as count FROM segments');

    res.json({
      segments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get segments error:', error);
    res.status(500).json({ error: 'Failed to fetch segments' });
  }
});

// Get segment by ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const segment = await db.get('SELECT * FROM segments WHERE id = ?', [id]);

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json({ segment });

  } catch (error) {
    console.error('Get segment error:', error);
    res.status(500).json({ error: 'Failed to fetch segment' });
  }
});

// Create new segment
router.post('/', authenticateToken, validateSegment, async (req, res) => {
  try {
    const { name, description } = req.body;
    const db = getDatabase();

    // Check if segment name already exists
    const existingSegment = await db.get('SELECT id FROM segments WHERE name = ?', [name]);
    if (existingSegment) {
      return res.status(400).json({ error: 'Segment with this name already exists' });
    }

    const result = await db.run(
      'INSERT INTO segments (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    const segment = await db.get('SELECT * FROM segments WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Segment created successfully',
      segment
    });

  } catch (error) {
    console.error('Create segment error:', error);
    res.status(500).json({ error: 'Failed to create segment' });
  }
});

// Update segment
router.put('/:id', authenticateToken, validateId, validateSegment, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const db = getDatabase();

    // Check if segment exists
    const existingSegment = await db.get('SELECT * FROM segments WHERE id = ?', [id]);
    if (!existingSegment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    // Check if name is taken by another segment
    const nameConflict = await db.get(
      'SELECT id FROM segments WHERE name = ? AND id != ?',
      [name, id]
    );
    if (nameConflict) {
      return res.status(400).json({ error: 'Segment with this name already exists' });
    }

    await db.run(
      'UPDATE segments SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description || null, id]
    );

    const segment = await db.get('SELECT * FROM segments WHERE id = ?', [id]);

    res.json({
      message: 'Segment updated successfully',
      segment
    });

  } catch (error) {
    console.error('Update segment error:', error);
    res.status(500).json({ error: 'Failed to update segment' });
  }
});

// Delete segment
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Check if segment exists
    const segment = await db.get('SELECT * FROM segments WHERE id = ?', [id]);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    // Check if segment is being used
    const usageChecks = [
      { table: 'users', column: 'segment_id' },
      { table: 'products', column: 'segment_id' },
      { table: 'transactions', column: 'segment_id' },
      { table: 'sales', column: 'segment_id' },
      { table: 'billings', column: 'segment_id' },
      { table: 'cost_centers', column: 'segment_id' }
    ];

    for (const check of usageChecks) {
      const usage = await db.get(
        `SELECT COUNT(*) as count FROM ${check.table} WHERE ${check.column} = ?`,
        [id]
      );
      if (usage.count > 0) {
        return res.status(400).json({ 
          error: `Cannot delete segment. It is being used in ${check.table}` 
        });
      }
    }

    await db.run('DELETE FROM segments WHERE id = ?', [id]);

    res.json({ message: 'Segment deleted successfully' });

  } catch (error) {
    console.error('Delete segment error:', error);
    res.status(500).json({ error: 'Failed to delete segment' });
  }
});

export default router; 