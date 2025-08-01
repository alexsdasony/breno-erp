import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/integrations - Listar Integrations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { segment_id, limit = 100, offset = 0 } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Filtrar por segmento se fornecido
    if (segment_id) {
      whereClause += ` AND segment_id = $${paramIndex++}`;
      params.push(segment_id);
    }
    
    const query = `
      SELECT 
        id,
        service_name,
        api_key,
        enabled,
        config,
        segment_id,
        created_at,
        updated_at
      FROM integrations 
      ${whereClause}
      ORDER BY service_name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      integrations: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Integrations:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/integrations/:id - Buscar Integrations por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        service_name,
        api_key,
        enabled,
        config,
        segment_id,
        created_at,
        updated_at
      FROM integrations 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Integrations não encontrado'
      });
    }
    
    res.json({
      success: true,
      integrations: result.rows[0]
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Integrations:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/integrations - Criar Integrations
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { service_name, api_key, enabled, config, segment_id } = req.body;
    
    // Validar campos obrigatórios
    if (!service_name) {
      return res.status(400).json({
        success: false,
        error: 'service_name é obrigatório'
      });
    }
    
    const query = `
      INSERT INTO integrations (service_name, api_key, enabled, config, segment_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const params = [
      service_name,
      api_key || null,
      enabled || false,
      config || null,
      segment_id || req.user.segment_id
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      integrations: result.rows[0],
      message: 'Integrations criado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao criar Integrations:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/integrations/:id - Atualizar Integrations
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { service_name, api_key, enabled, config, segment_id } = req.body;
    
    const query = `
      UPDATE integrations SET
        service_name = COALESCE($1, service_name),
        api_key = COALESCE($2, api_key),
        enabled = COALESCE($3, enabled),
        config = COALESCE($4, config),
        segment_id = COALESCE($5, segment_id),
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    
    const params = [service_name, api_key, enabled, config, segment_id, id];
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Integrations não encontrado'
      });
    }
    
    res.json({
      success: true,
      integrations: result.rows[0],
      message: 'Integrations atualizado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao atualizar Integrations:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/integrations/:id - Deletar Integrations
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `DELETE FROM integrations WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Integrations não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Integrations deletado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao deletar Integrations:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
