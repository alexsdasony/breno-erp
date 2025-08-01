import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/metrics - Listar Metrics
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
        name,
        segment_id,
        created_at,
        updated_at
      FROM metrics 
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      metrics: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Metrics:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/metrics/:id - Buscar Metrics por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        name,
        segment_id,
        created_at,
        updated_at
      FROM metrics 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Metrics não encontrado'
      });
    }
    
    res.json({
      success: true,
      metrics: result.rows[0]
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Metrics:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/metrics - Criar Metrics
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { name, segment_id } = req.body;
    
    // Validar campos obrigatórios
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nome é obrigatório'
      });
    }
    
    const query = `
      INSERT INTO metrics (name, segment_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    
    const params = [
      name,
      segment_id || req.user.segment_id
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      metrics: result.rows[0],
      message: 'Metrics criado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao criar Metrics:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/metrics/:id - Atualizar Metrics
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { name, segment_id } = req.body;
    
    const query = `
      UPDATE metrics SET
        name = COALESCE($1, name),
        segment_id = COALESCE($2, segment_id),
        updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    
    const params = [name, segment_id, id];
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Metrics não encontrado'
      });
    }
    
    res.json({
      success: true,
      metrics: result.rows[0],
      message: 'Metrics atualizado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao atualizar Metrics:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/metrics/:id - Deletar Metrics
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `DELETE FROM metrics WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Metrics não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Metrics deletado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao deletar Metrics:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
