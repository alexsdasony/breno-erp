import express from 'express';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;
    const db = getDatabase();

    const users = await db.all(
      'SELECT id, name, email, role, segment_id, created_at, updated_at FROM users ORDER BY name ASC LIMIT ? OFFSET ?',
      [limit, offset]
    );

    const total = await db.get('SELECT COUNT(*) as count FROM users');

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID (admin only)
router.get('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    const user = await db.get(
      'SELECT id, name, email, role, segment_id, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

export default router; 