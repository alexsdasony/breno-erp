import { getDatabase } from '../database/prodConfig.js';
import jwt from 'jsonwebtoken';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, name, email, role, segment_id, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if user is blocked or inactive
    if (user.status === 'bloqueado') {
      return res.status(403).json({ error: 'Account is blocked. Please contact administrator.' });
    }

    if (user.status === 'inativo') {
      return res.status(403).json({ error: 'Account is inactive. Please contact administrator.' });
    }

    // Check if user has a role (perfil de acesso)
    if (!user.role) {
      return res.status(403).json({ error: 'No access profile assigned. Please contact administrator.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const db = await getDatabase();
      const user = await db.get(
        'SELECT id, name, email, role, segment_id FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token invalid, but that's okay for optional auth
    }
  }

  next();
}; 