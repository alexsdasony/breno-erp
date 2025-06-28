import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/init.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const db = getDatabase();
    const user = await db.get(
      'SELECT id, name, email, role, segment_id FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
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
      const db = getDatabase();
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