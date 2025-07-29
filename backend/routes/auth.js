import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/prodConfig.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';
import ChatProService from '../services/chatpro.js';

const router = express.Router();

// Register new user
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { name, email, password, segmentId } = req.body;
    const db = await getDatabase();

    // Check if user already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user with default status 'bloqueado' and no role (sem perfil de acesso)
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, segment_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, null, segmentId || null, 'bloqueado']
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.lastID },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Get user data for response
    const user = await db.get(
      'SELECT id, name, email, role, segment_id FROM users WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDatabase();

    // Find user
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    // Se não encontrar usuário e for admin@erppro.com, criar automaticamente
    if (!user && email === 'admin@erppro.com' && password === 'admin123') {
      console.log('🔧 Criando usuário admin automaticamente...');
      
      try {
        // Verificar se segmento padrão existe
        let segmentId = null;
        const defaultSegment = await db.get('SELECT id FROM segments WHERE name = ?', ['Segmento Padrão']);
        
        if (!defaultSegment) {
          console.log('🏢 Criando segmento padrão...');
          const segmentResult = await db.run(
            'INSERT INTO segments (name, description, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            ['Segmento Padrão', 'Segmento padrão do sistema']
          );
          segmentId = segmentResult.lastID;
        } else {
          segmentId = defaultSegment.id;
        }
        
        // Criar usuário admin
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const result = await db.run(
          'INSERT INTO users (name, email, password, role, segment_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())',
          ['Admin', 'admin@erppro.com', hashedPassword, 'admin', segmentId, 'ativo']
        );
        
        console.log('✅ Usuário admin criado com sucesso');
        
        // Buscar usuário criado
        const newUser = await db.get('SELECT * FROM users WHERE id = ?', [result.lastID]);
        
        // Generate JWT token
        const token = jwt.sign(
          { userId: newUser.id },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;

        return res.json({
          message: 'Admin user created and logged in successfully',
          token,
          user: userWithoutPassword
        });
        
      } catch (createError) {
        console.error('❌ Erro ao criar usuário admin:', createError);
        return res.status(500).json({ error: 'Failed to create admin user' });
      }
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
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

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, name, email, role, segment_id FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Get user profile (complete data with segment info)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Get user with segment information  
    const user = await db.get(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.segment_id,
        u.created_at,
        u.updated_at,
        s.id as segment_id_check,
        s.name as segment_name
      FROM users u
      LEFT JOIN segments s ON u.segment_id = s.id
      WHERE u.id = ?
    `, [req.user.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all available segments for UI
    const segments = await db.all('SELECT id, name FROM segments ORDER BY name ASC');

    // Structure response with proper null handling
    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      segment_id: user.segment_id, // Can be null (master user)
      segment: user.segment_id ? {
        id: user.segment_id,
        name: user.segment_name
      } : null, // null for master users
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({ 
      user: userProfile,
      segments: segments || [], // Always return array, even if empty
      is_master: user.segment_id === null // Explicit flag for frontend
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile data' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, segment_id } = req.body;
    const db = await getDatabase();

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await db.get(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );
      if (existingUser) {
        return res.status(400).json({ error: 'Email already taken' });
      }
    }

    // Validate segment_id if provided (null is valid for master users)
    if (segment_id !== undefined && segment_id !== null && segment_id !== '') {
      const segment = await db.get('SELECT id FROM segments WHERE id = ?', [parseInt(segment_id)]);
      if (!segment) {
        return res.status(400).json({ error: 'Invalid segment ID' });
      }
    }

    // Normalize segment_id: empty string or 0 becomes null
    const normalizedSegmentId = (segment_id === '' || segment_id === 0 || segment_id === '0') ? null : segment_id;

    // Only allow segment change if user is admin or if it's explicitly being set to null/master
    const canChangeSegment = req.user.role === 'admin';
    
    if (canChangeSegment && segment_id !== undefined) {
      await db.run(
        'UPDATE users SET name = ?, email = ?, segment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, email, normalizedSegmentId, req.user.id]
      );
    } else {
      await db.run(
        'UPDATE users SET name = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, email, req.user.id]
      );
    }

    // Get updated user with complete segment info
    const updatedUser = await db.get(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.segment_id,
        u.updated_at,
        s.name as segment_name
      FROM users u
      LEFT JOIN segments s ON u.segment_id = s.id
      WHERE u.id = ?
    `, [req.user.id]);

    // Structure response with proper null handling
    const userProfile = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      segment_id: updatedUser.segment_id, // null for master users
      segment: updatedUser.segment_id ? {
        id: updatedUser.segment_id,
        name: updatedUser.segment_name
      } : null,
      updated_at: updatedUser.updated_at
    };

    res.json({
      message: 'Profile updated successfully',
      user: userProfile,
      is_master: updatedUser.segment_id === null
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const db = await getDatabase();

    // Get current user with password
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedNewPassword, req.user.id]
    );

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token
    const token = jwt.sign(
      { userId: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Token refreshed successfully',
      token
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, phone } = req.body;
    const db = await getDatabase();

    // Validate input
    if (!email && !phone) {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    } else {
      user = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset code (6 digits)
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store reset code in database
    await db.run(
      'UPDATE users SET reset_code = ?, reset_code_expiry = ? WHERE id = ?',
      [resetCode, resetExpiry.toISOString(), user.id]
    );

    // Send WhatsApp message if phone is available
    if (user.phone) {
      try {
        const chatproService = new ChatProService();
        await chatproService.sendPasswordResetMessage(user.phone, resetCode, user.name);
        
        res.json({ 
          message: 'Password reset code sent via WhatsApp',
          method: 'whatsapp'
        });
      } catch (whatsappError) {
        console.error('WhatsApp send error:', whatsappError);
        // Fallback to email if WhatsApp fails
        res.json({ 
          message: 'Password reset code generated (WhatsApp failed, check console)',
          method: 'email_fallback',
          resetCode: resetCode // Only for development
        });
      }
    } else {
      // Email fallback (for development)
      console.log(`[DEV] Password reset code for ${user.email}: ${resetCode}`);
      res.json({ 
        message: 'Password reset code generated (check console for development)',
        method: 'email_dev',
        resetCode: resetCode // Only for development
      });
    }

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Verify reset code and set new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, phone, resetCode, newPassword } = req.body;
    const db = await getDatabase();

    // Validate input
    if (!resetCode || !newPassword) {
      return res.status(400).json({ error: 'Reset code and new password are required' });
    }

    // Find user by email or phone
    let user;
    if (email) {
      user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    } else if (phone) {
      user = await db.get('SELECT * FROM users WHERE phone = ?', [phone]);
    } else {
      return res.status(400).json({ error: 'Email or phone number is required' });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if reset code is valid and not expired
    if (!user.reset_code || user.reset_code !== resetCode) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    if (!user.reset_code_expiry || new Date() > new Date(user.reset_code_expiry)) {
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset code
    await db.run(
      'UPDATE users SET password = ?, reset_code = NULL, reset_code_expiry = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

export default router; 