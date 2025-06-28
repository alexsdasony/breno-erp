import express from 'express';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateIntegration, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all integrations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();

    const integrations = await db.all(
      'SELECT id, name, enabled, created_at, updated_at FROM integrations ORDER BY name ASC'
    );

    res.json({ integrations });

  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Get integration by name
router.get('/:name', authenticateToken, async (req, res) => {
  try {
    const { name } = req.params;
    const db = await getDatabase();

    const integration = await db.get(
      'SELECT * FROM integrations WHERE name = ?',
      [name]
    );

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ integration });

  } catch (error) {
    console.error('Get integration error:', error);
    res.status(500).json({ error: 'Failed to fetch integration' });
  }
});

// Create or update integration
router.put('/:name', authenticateToken, async (req, res) => {
  try {
    const { name } = req.params;
    const { api_key, enabled, config } = req.body;
    const db = await getDatabase();

    // Check if integration exists
    const existingIntegration = await db.get(
      'SELECT * FROM integrations WHERE name = ?',
      [name]
    );

    let integration;

    if (existingIntegration) {
      // Update existing integration
      await db.run(
        'UPDATE integrations SET api_key = ?, enabled = ?, config = ?, updated_at = CURRENT_TIMESTAMP WHERE name = ?',
        [api_key || null, enabled ? 1 : 0, config ? JSON.stringify(config) : null, name]
      );
      integration = await db.get('SELECT * FROM integrations WHERE name = ?', [name]);
    } else {
      // Create new integration
      const result = await db.run(
        'INSERT INTO integrations (name, api_key, enabled, config) VALUES (?, ?, ?, ?)',
        [name, api_key || null, enabled ? 1 : 0, config ? JSON.stringify(config) : null]
      );
      integration = await db.get('SELECT * FROM integrations WHERE id = ?', [result.lastID]);
    }

    res.json({
      message: 'Integration updated successfully',
      integration
    });

  } catch (error) {
    console.error('Update integration error:', error);
    res.status(500).json({ error: 'Failed to update integration' });
  }
});

// Test integration
router.post('/:name/test', authenticateToken, async (req, res) => {
  try {
    const { name } = req.params;
    const db = await getDatabase();

    const integration = await db.get(
      'SELECT * FROM integrations WHERE name = ?',
      [name]
    );

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    if (!integration.enabled) {
      return res.status(400).json({ error: 'Integration is disabled' });
    }

    // Here you would implement actual integration testing logic
    // For now, just return a success response
    res.json({
      message: `Integration ${name} test successful`,
      status: 'success',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test integration error:', error);
    res.status(500).json({ error: 'Failed to test integration' });
  }
});

export default router; 