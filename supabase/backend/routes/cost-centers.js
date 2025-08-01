import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/cost-centers - Listar Cost Centers
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
      FROM cost_centers 
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      costcenters: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Cost Centers:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/cost-centers/:id - Buscar Cost Centers por ID
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
      FROM cost_centers 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cost Centers não encontrado'
      });
    }
    
    res.json({
      success: true,
      costcenters: result.rows[0]
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Cost Centers:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/cost-centers - Criar Cost Centers
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
      INSERT INTO cost_centers (name, segment_id)
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
      costcenters: result.rows[0],
      message: 'Cost Centers criado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao criar Cost Centers:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/cost-centers/:id - Atualizar Cost Centers
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { name, segment_id } = req.body;
    
    const query = `
      UPDATE cost_centers SET
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
        error: 'Cost Centers não encontrado'
      });
    }
    
    res.json({
      success: true,
      costcenters: result.rows[0],
      message: 'Cost Centers atualizado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao atualizar Cost Centers:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/cost-centers/:id - Deletar Cost Centers
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `DELETE FROM cost_centers WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Cost Centers não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Cost Centers deletado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao deletar Cost Centers:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
