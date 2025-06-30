import express from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all users with segment info (admin only)
router.get('/', authenticateToken, requireAdmin, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, segment_id, status } = req.query;
    const offset = (page - 1) * limit;
    const db = await getDatabase();

    // Build query with optional segment filter
    let query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.segment_id,
        u.status,
        u.created_at, 
        u.updated_at,
        s.name as segment_name
      FROM users u
      LEFT JOIN segments s ON u.segment_id = s.id
    `;
    let countQuery = 'SELECT COUNT(*) as count FROM users u';
    let params = [];
    let countParams = [];

    // Build WHERE clause
    let whereConditions = [];
    
    // Filter by segment if requested
    if (segment_id !== undefined) {
      if (segment_id === 'null' || segment_id === '') {
        whereConditions.push('u.segment_id IS NULL');
      } else {
        whereConditions.push('u.segment_id = ?');
        params.push(parseInt(segment_id));
        countParams.push(parseInt(segment_id));
      }
    }
    
    // Filter by status if requested
    if (status) {
      whereConditions.push('u.status = ?');
      params.push(status);
      countParams.push(status);
    }
    
    // Apply WHERE conditions
    if (whereConditions.length > 0) {
      const whereClause = ' WHERE ' + whereConditions.join(' AND ');
      query += whereClause;
      countQuery += whereClause;
    }

    query += ' ORDER BY u.name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const users = await db.all(query, params);
    const total = await db.get(countQuery, countParams);

    // Get all segments for frontend
    const segments = await db.all('SELECT id, name FROM segments ORDER BY name ASC');

    // Structure users with proper null handling
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      segment_id: user.segment_id, // null for master users
      segment: user.segment_id ? {
        id: user.segment_id,
        name: user.segment_name
      } : null,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_master: user.segment_id === null
    }));

    res.json({
      users: formattedUsers,
      segments: segments || [],
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

// Get user by ID with segment info (admin only)
router.get('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const user = await db.get(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.segment_id,
        u.status,
        u.created_at, 
        u.updated_at,
        s.name as segment_name
      FROM users u
      LEFT JOIN segments s ON u.segment_id = s.id
      WHERE u.id = ?
    `, [id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all segments for editing
    const segments = await db.all('SELECT id, name FROM segments ORDER BY name ASC');

    // Structure response with proper null handling
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      segment_id: user.segment_id,
      segment: user.segment_id ? {
        id: user.segment_id,
        name: user.segment_name
      } : null,
      created_at: user.created_at,
      updated_at: user.updated_at,
      is_master: user.segment_id === null
    };

    res.json({ 
      user: userProfile,
      segments: segments || []
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role = 'user', segment_id } = req.body;
    const db = await getDatabase();

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required' });
    }

    // Validate role if provided
    if (role && role !== '' && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be user, admin, or empty' });
    }

    // Check if email already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Validate segment_id if provided
    if (segment_id !== undefined && segment_id !== null && segment_id !== '') {
      const segment = await db.get('SELECT id FROM segments WHERE id = ?', [parseInt(segment_id)]);
      if (!segment) {
        return res.status(400).json({ error: 'Invalid segment ID' });
      }
    }

    // Normalize role and segment_id
    const normalizedRole = role === '' ? null : role;
    const normalizedSegmentId = (normalizedRole === 'admin' || segment_id === '' || segment_id === 0 || segment_id === '0') ? null : segment_id;

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user with default status 'bloqueado' and normalized role
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, segment_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, normalizedRole, normalizedSegmentId, 'bloqueado']
    );

    // Get created user with segment info
    const newUser = await db.get(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.segment_id,
        u.status,
        u.created_at,
        s.name as segment_name
      FROM users u
      LEFT JOIN segments s ON u.segment_id = s.id
      WHERE u.id = ?
    `, [result.lastID]);

    // Structure response
    const userProfile = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      segment_id: newUser.segment_id,
      segment: newUser.segment_id ? {
        id: newUser.segment_id,
        name: newUser.segment_name
      } : null,
      created_at: newUser.created_at,
      is_master: newUser.segment_id === null
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userProfile
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, segment_id, status } = req.body;
    const db = await getDatabase();

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Validate role if provided
    if (role && role !== '' && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be user, admin, or empty' });
    }

    // Validate status if provided
    if (status && !['ativo', 'bloqueado', 'inativo'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be ativo, bloqueado, or inativo' });
    }

    // Check if user exists
    const existingUser = await db.get('SELECT id, email, role FROM users WHERE id = ?', [id]);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is taken by another user
    if (email !== existingUser.email) {
      const emailTaken = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, id]);
      if (emailTaken) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    // Validate segment_id if provided
    if (segment_id !== undefined && segment_id !== null && segment_id !== '') {
      const segment = await db.get('SELECT id FROM segments WHERE id = ?', [parseInt(segment_id)]);
      if (!segment) {
        return res.status(400).json({ error: 'Invalid segment ID' });
      }
    }

    // Normalize role and segment_id
    const finalRole = role === '' ? null : (role || existingUser.role);
    const normalizedSegmentId = (finalRole === 'admin' || segment_id === '' || segment_id === 0 || segment_id === '0') ? null : segment_id;

    // Update user
    const updateFields = ['name = ?', 'email = ?', 'role = ?', 'segment_id = ?'];
    const updateValues = [name, email, finalRole, normalizedSegmentId];
    
    if (status) {
      updateFields.push('status = ?');
      updateValues.push(status);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);
    
    await db.run(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Get updated user with segment info
    const updatedUser = await db.get(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.segment_id,
        u.status,
        u.updated_at,
        s.name as segment_name
      FROM users u
      LEFT JOIN segments s ON u.segment_id = s.id
      WHERE u.id = ?
    `, [id]);

    // Structure response
    const userProfile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      segment_id: updatedUser.segment_id,
      segment: updatedUser.segment_id ? {
        id: updatedUser.segment_id,
        name: updatedUser.segment_name
      } : null,
      updated_at: updatedUser.updated_at,
      is_master: updatedUser.segment_id === null
    };

    res.json({
      message: 'User updated successfully',
      user: userProfile
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Check if user exists
    const user = await db.get('SELECT id, name, email FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting self
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user
    await db.run('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      message: 'User deleted successfully',
      deleted_user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router; 