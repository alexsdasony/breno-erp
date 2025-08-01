import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const accounts = await db.all(`
      SELECT 
        coa.*,
        s.name as segment_name,
        parent.account_name as parent_account_name
      FROM chart_of_accounts coa
      LEFT JOIN segments s ON coa.segment_id = s.id
      LEFT JOIN chart_of_accounts parent ON coa.parent_account_id = parent.id
      WHERE coa.is_active = true
      ORDER BY coa.account_code
    `);

    res.json(accounts);
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Failed to get accounts' });
  }
});

// Get account by ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();
    
    const account = await db.get(`
      SELECT 
        coa.*,
        s.name as segment_name,
        parent.account_name as parent_account_name
      FROM chart_of_accounts coa
      LEFT JOIN segments s ON coa.segment_id = s.id
      LEFT JOIN chart_of_accounts parent ON coa.parent_account_id = parent.id
      WHERE coa.id = ? AND coa.is_active = true
    `, [id]);

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(account);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Failed to get account' });
  }
});

// Create new account
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      account_code, 
      account_name, 
      account_type, 
      account_category, 
      description, 
      parent_account_id, 
      segment_id 
    } = req.body;
    
    const db = await getDatabase();

    // Validate required fields
    if (!account_code || !account_name || !account_type || !account_category) {
      return res.status(400).json({ error: 'Account code, name, type and category are required' });
    }

    // Validate account type
    const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
    if (!validTypes.includes(account_type)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    // Check if account code already exists
    const existingAccount = await db.get('SELECT id FROM chart_of_accounts WHERE account_code = ?', [account_code]);
    if (existingAccount) {
      return res.status(400).json({ error: 'Account code already exists' });
    }

    const result = await db.run(`
      INSERT INTO chart_of_accounts (
        account_code, account_name, account_type, account_category, 
        description, parent_account_id, segment_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [account_code, account_name, account_type, account_category, description, parent_account_id || null, segment_id || null]);

    const account = await db.get('SELECT * FROM chart_of_accounts WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Account created successfully',
      account
    });

  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// Update account
router.put('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      account_code, 
      account_name, 
      account_type, 
      account_category, 
      description, 
      parent_account_id, 
      segment_id,
      is_active 
    } = req.body;
    
    const db = await getDatabase();

    // Check if account exists
    const existingAccount = await db.get('SELECT * FROM chart_of_accounts WHERE id = ?', [id]);
    if (!existingAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check if account code is taken by another account
    if (account_code && account_code !== existingAccount.account_code) {
      const codeConflict = await db.get(
        'SELECT id FROM chart_of_accounts WHERE account_code = ? AND id != ?',
        [account_code, id]
      );
      if (codeConflict) {
        return res.status(400).json({ error: 'Account code already taken by another account' });
      }
    }

    await db.run(`
      UPDATE chart_of_accounts 
      SET account_code = ?, account_name = ?, account_type = ?, account_category = ?,
          description = ?, parent_account_id = ?, segment_id = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      account_code || existingAccount.account_code,
      account_name || existingAccount.account_name,
      account_type || existingAccount.account_type,
      account_category || existingAccount.account_category,
      description || existingAccount.description,
      parent_account_id || existingAccount.parent_account_id,
      segment_id || existingAccount.segment_id,
      is_active !== undefined ? is_active : existingAccount.is_active,
      id
    ]);

    const account = await db.get('SELECT * FROM chart_of_accounts WHERE id = ?', [id]);

    res.json({
      message: 'Account updated successfully',
      account
    });

  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

// Delete account (soft delete)
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Check if account exists
    const account = await db.get('SELECT * FROM chart_of_accounts WHERE id = ?', [id]);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check if account has child accounts
    const childAccounts = await db.get('SELECT COUNT(*) as count FROM chart_of_accounts WHERE parent_account_id = ?', [id]);
    if (childAccounts.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete account with child accounts. Consider deactivating instead.' 
      });
    }

    // Check if account is used in cost centers
    const costCenterUsage = await db.get('SELECT COUNT(*) as count FROM cost_center_accounts WHERE account_id = ?', [id]);
    if (costCenterUsage.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete account used by cost centers. Consider deactivating instead.' 
      });
    }

    // Soft delete
    await db.run('UPDATE chart_of_accounts SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

// Get accounts by type
router.get('/type/:type', authenticateToken, async (req, res) => {
  try {
    const { type } = req.params;
    const db = await getDatabase();
    
    const validTypes = ['asset', 'liability', 'equity', 'revenue', 'expense'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }

    const accounts = await db.all(`
      SELECT 
        coa.*,
        s.name as segment_name,
        parent.account_name as parent_account_name
      FROM chart_of_accounts coa
      LEFT JOIN segments s ON coa.segment_id = s.id
      LEFT JOIN chart_of_accounts parent ON coa.parent_account_id = parent.id
      WHERE coa.account_type = ? AND coa.is_active = true
      ORDER BY coa.account_code
    `, [type]);

    res.json(accounts);
  } catch (error) {
    console.error('Get accounts by type error:', error);
    res.status(500).json({ error: 'Failed to get accounts by type' });
  }
});

// Get accounts by segment
router.get('/segment/:segmentId', authenticateToken, validateId, async (req, res) => {
  try {
    const { segmentId } = req.params;
    const db = await getDatabase();
    
    const accounts = await db.all(`
      SELECT 
        coa.*,
        s.name as segment_name,
        parent.account_name as parent_account_name
      FROM chart_of_accounts coa
      LEFT JOIN segments s ON coa.segment_id = s.id
      LEFT JOIN chart_of_accounts parent ON coa.parent_account_id = parent.id
      WHERE coa.segment_id = ? AND coa.is_active = true
      ORDER BY coa.account_code
    `, [segmentId]);

    res.json(accounts);
  } catch (error) {
    console.error('Get accounts by segment error:', error);
    res.status(500).json({ error: 'Failed to get accounts by segment' });
  }
});

export default router; 