import { getDatabase } from '../database/prodConfig.js';
import jwt from 'jsonwebtoken';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verificar se JWT_SECRET existe
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', { userId: decoded.userId });
    
    // Get user from database to ensure they still exist
    try {
      const db = await getDatabase();
      const user = await db.get(
        'SELECT id, name, email, role, segment_id FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (!user) {
        console.log('User not found in database:', decoded.userId);
        return res.status(401).json({ error: 'User not found' });
      }

      console.log('User found:', user.email);
      req.user = user;
      next();
    } catch (dbError) {
      console.error('Database error in auth:', dbError);
      return res.status(500).json({ error: 'Database error during authentication' });
    }
  } catch (jwtError) {
    console.error('JWT verification error:', jwtError.message);
    return res.status(403).json({ 
      error: 'Invalid or expired token',
      debug: process.env.NODE_ENV === 'development' ? jwtError.message : undefined
    });
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
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
}; 