import express from 'express';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateIntegration, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all integrations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Get integrations settings from database
    const integrations = await db.all('SELECT * FROM integrations ORDER BY name ASC');
    
    // Default integrations structure if none exist
    const defaultIntegrations = [
      {
        id: 1,
        name: 'WhatsApp Business',
        description: 'Integração com WhatsApp para notificações',
        status: 'inactive',
        config: {
          phone: '',
          token: '',
          webhook_url: ''
        }
      },
      {
        id: 2,
        name: 'Mercado Pago',
        description: 'Gateway de pagamento',
        status: 'inactive',
        config: {
          access_token: '',
          public_key: '',
          webhook_url: ''
        }
      },
      {
        id: 3,
        name: 'Correios',
        description: 'Cálculo de frete e rastreamento',
        status: 'inactive',
        config: {
          user: '',
          password: '',
          contract: ''
        }
      },
      {
        id: 4,
        name: 'NFe.io',
        description: 'Emissão de notas fiscais',
        status: 'inactive',
        config: {
          api_key: '',
          company_id: ''
        }
      }
    ];

    res.json({
      integrations: integrations.length > 0 ? integrations : defaultIntegrations,
      total: integrations.length > 0 ? integrations.length : defaultIntegrations.length
    });

  } catch (error) {
    console.error('Get integrations error:', error);
    res.status(500).json({ error: 'Failed to fetch integrations' });
  }
});

// Get integration by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const integration = await db.get('SELECT * FROM integrations WHERE id = ?', [id]);

    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }

    res.json({ integration });

  } catch (error) {
    console.error('Get integration error:', error);
    res.status(500).json({ error: 'Failed to fetch integration' });
  }
});

// Update integration
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, config } = req.body;
    const db = await getDatabase();

    await db.run(
      'UPDATE integrations SET name = ?, description = ?, status = ?, config = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, description, status, JSON.stringify(config), id]
    );

    const updatedIntegration = await db.get('SELECT * FROM integrations WHERE id = ?', [id]);

    res.json({
      message: 'Integration updated successfully',
      integration: {
        ...updatedIntegration,
        config: JSON.parse(updatedIntegration.config)
      }
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