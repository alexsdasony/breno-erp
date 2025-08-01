import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { validateId } from '../middleware/validation.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// Get all cost center accounts
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const costCenterAccounts = await db.all(`
      SELECT 
        cca.*,
        cc.name as cost_center_name,
        coa.account_code,
        coa.account_name,
        coa.account_type,
        coa.account_category,
        s.name as segment_name
      FROM cost_center_accounts cca
      JOIN cost_centers cc ON cca.cost_center_id = cc.id
      JOIN chart_of_accounts coa ON cca.account_id = coa.id
      LEFT JOIN segments s ON cc.segment_id = s.id
      ORDER BY cc.name, coa.account_code
    `);

    res.json(costCenterAccounts);
  } catch (error) {
    console.error('Get cost center accounts error:', error);
    res.status(500).json({ error: 'Failed to get cost center accounts' });
  }
});

// Get accounts for a specific cost center
router.get('/cost-center/:costCenterId', authenticateToken, validateId, async (req, res) => {
  try {
    const { costCenterId } = req.params;
    const db = await getDatabase();
    
    const accounts = await db.all(`
      SELECT 
        cca.*,
        coa.account_code,
        coa.account_name,
        coa.account_type,
        coa.account_category,
        coa.description
      FROM cost_center_accounts cca
      JOIN chart_of_accounts coa ON cca.account_id = coa.id
      WHERE cca.cost_center_id = ? AND coa.is_active = true
      ORDER BY cca.is_primary DESC, coa.account_code
    `, [costCenterId]);

    res.json(accounts);
  } catch (error) {
    console.error('Get cost center accounts error:', error);
    res.status(500).json({ error: 'Failed to get cost center accounts' });
  }
});

// Get cost centers for a specific account
router.get('/account/:accountId', authenticateToken, validateId, async (req, res) => {
  try {
    const { accountId } = req.params;
    const db = await getDatabase();
    
    const costCenters = await db.all(`
      SELECT 
        cca.*,
        cc.name as cost_center_name,
        s.name as segment_name
      FROM cost_center_accounts cca
      JOIN cost_centers cc ON cca.cost_center_id = cc.id
      LEFT JOIN segments s ON cc.segment_id = s.id
      WHERE cca.account_id = ?
      ORDER BY cc.name
    `, [accountId]);

    res.json(costCenters);
  } catch (error) {
    console.error('Get account cost centers error:', error);
    res.status(500).json({ error: 'Failed to get account cost centers' });
  }
});

// Add account to cost center
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { cost_center_id, account_id, allocation_percentage, is_primary } = req.body;
    const db = await getDatabase();

    // Validate required fields
    if (!cost_center_id || !account_id) {
      return res.status(400).json({ error: 'Cost center ID and account ID are required' });
    }

    // Check if cost center exists
    const costCenter = await db.get('SELECT * FROM cost_centers WHERE id = ?', [cost_center_id]);
    if (!costCenter) {
      return res.status(404).json({ error: 'Cost center not found' });
    }

    // Check if account exists and is active
    const account = await db.get('SELECT * FROM chart_of_accounts WHERE id = ? AND is_active = true', [account_id]);
    if (!account) {
      return res.status(404).json({ error: 'Account not found or inactive' });
    }

    // Check if relationship already exists
    const existingRelation = await db.get(
      'SELECT * FROM cost_center_accounts WHERE cost_center_id = ? AND account_id = ?',
      [cost_center_id, account_id]
    );
    if (existingRelation) {
      return res.status(400).json({ error: 'Account already assigned to this cost center' });
    }

    // If this is primary, unset other primary accounts for this cost center
    if (is_primary) {
      await db.run(
        'UPDATE cost_center_accounts SET is_primary = false WHERE cost_center_id = ?',
        [cost_center_id]
      );
    }

    const result = await db.run(`
      INSERT INTO cost_center_accounts (
        cost_center_id, account_id, allocation_percentage, is_primary
      ) VALUES (?, ?, ?, ?)
    `, [cost_center_id, account_id, allocation_percentage || 100.00, is_primary || false]);

    const costCenterAccount = await db.get(`
      SELECT 
        cca.*,
        cc.name as cost_center_name,
        coa.account_code,
        coa.account_name,
        coa.account_type,
        coa.account_category
      FROM cost_center_accounts cca
      JOIN cost_centers cc ON cca.cost_center_id = cc.id
      JOIN chart_of_accounts coa ON cca.account_id = coa.id
      WHERE cca.id = ?
    `, [result.lastID]);

    res.status(201).json({
      message: 'Account assigned to cost center successfully',
      costCenterAccount
    });

  } catch (error) {
    console.error('Add account to cost center error:', error);
    res.status(500).json({ error: 'Failed to add account to cost center' });
  }
});

// Update cost center account relationship
router.put('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { allocation_percentage, is_primary } = req.body;
    const db = await getDatabase();

    // Check if relationship exists
    const existingRelation = await db.get('SELECT * FROM cost_center_accounts WHERE id = ?', [id]);
    if (!existingRelation) {
      return res.status(404).json({ error: 'Cost center account relationship not found' });
    }

    // If this is primary, unset other primary accounts for this cost center
    if (is_primary) {
      await db.run(
        'UPDATE cost_center_accounts SET is_primary = false WHERE cost_center_id = ? AND id != ?',
        [existingRelation.cost_center_id, id]
      );
    }

    await db.run(`
      UPDATE cost_center_accounts 
      SET allocation_percentage = ?, is_primary = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [allocation_percentage || existingRelation.allocation_percentage, is_primary !== undefined ? is_primary : existingRelation.is_primary, id]);

    const costCenterAccount = await db.get(`
      SELECT 
        cca.*,
        cc.name as cost_center_name,
        coa.account_code,
        coa.account_name,
        coa.account_type,
        coa.account_category
      FROM cost_center_accounts cca
      JOIN cost_centers cc ON cca.cost_center_id = cc.id
      JOIN chart_of_accounts coa ON cca.account_id = coa.id
      WHERE cca.id = ?
    `, [id]);

    res.json({
      message: 'Cost center account relationship updated successfully',
      costCenterAccount
    });

  } catch (error) {
    console.error('Update cost center account error:', error);
    res.status(500).json({ error: 'Failed to update cost center account relationship' });
  }
});

// Remove account from cost center
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Check if relationship exists
    const costCenterAccount = await db.get('SELECT * FROM cost_center_accounts WHERE id = ?', [id]);
    if (!costCenterAccount) {
      return res.status(404).json({ error: 'Cost center account relationship not found' });
    }

    await db.run('DELETE FROM cost_center_accounts WHERE id = ?', [id]);

    res.json({ message: 'Account removed from cost center successfully' });

  } catch (error) {
    console.error('Remove account from cost center error:', error);
    res.status(500).json({ error: 'Failed to remove account from cost center' });
  }
});

// Bulk assign accounts to cost center
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { cost_center_id, accounts } = req.body;
    const db = await getDatabase();

    if (!cost_center_id || !Array.isArray(accounts) || accounts.length === 0) {
      return res.status(400).json({ error: 'Cost center ID and accounts array are required' });
    }

    // Check if cost center exists
    const costCenter = await db.get('SELECT * FROM cost_centers WHERE id = ?', [cost_center_id]);
    if (!costCenter) {
      return res.status(404).json({ error: 'Cost center not found' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < accounts.length; i++) {
      const account = accounts[i];
      try {
        // Check if account exists and is active
        const accountExists = await db.get('SELECT * FROM chart_of_accounts WHERE id = ? AND is_active = true', [account.account_id]);
        if (!accountExists) {
          errors.push({ index: i, error: 'Account not found or inactive' });
          continue;
        }

        // Check if relationship already exists
        const existingRelation = await db.get(
          'SELECT * FROM cost_center_accounts WHERE cost_center_id = ? AND account_id = ?',
          [cost_center_id, account.account_id]
        );
        if (existingRelation) {
          errors.push({ index: i, error: 'Account already assigned to this cost center' });
          continue;
        }

        // If this is primary, unset other primary accounts
        if (account.is_primary) {
          await db.run(
            'UPDATE cost_center_accounts SET is_primary = false WHERE cost_center_id = ?',
            [cost_center_id]
          );
        }

        const result = await db.run(`
          INSERT INTO cost_center_accounts (
            cost_center_id, account_id, allocation_percentage, is_primary
          ) VALUES (?, ?, ?, ?)
        `, [cost_center_id, account.account_id, account.allocation_percentage || 100.00, account.is_primary || false]);

        results.push({ index: i, id: result.lastID });

      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    res.json({
      message: `Bulk assignment completed. ${results.length} accounts assigned, ${errors.length} errors`,
      assigned: results.length,
      errors: errors.length,
      details: { results, errors }
    });

  } catch (error) {
    console.error('Bulk assign accounts error:', error);
    res.status(500).json({ error: 'Failed to bulk assign accounts' });
  }
});

export default router; 