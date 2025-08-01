import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/nfe - Listar Nfe
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
        number,
        customer_name,
        date,
        total,
        status,
        segment_id,
        created_at,
        updated_at
      FROM nfe 
      ${whereClause}
      ORDER BY date DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      nfe: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Nfe:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/nfe/:id - Buscar Nfe por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        number,
        customer_name,
        date,
        total,
        status,
        segment_id,
        created_at,
        updated_at
      FROM nfe 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nfe não encontrado'
      });
    }
    
    res.json({
      success: true,
      nfe: result.rows[0]
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Nfe:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/nfe - Criar Nfe
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { number, customer_name, date, total, status, segment_id } = req.body;
    
    // Validar campos obrigatórios
    if (!number || !customer_name || !date || !total) {
      return res.status(400).json({
        success: false,
        error: 'number, customer_name, date e total são obrigatórios'
      });
    }
    
    const query = `
      INSERT INTO nfe (number, customer_name, date, total, status, segment_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const params = [
      number,
      customer_name,
      date,
      total,
      status || 'Emitida',
      segment_id || req.user.segment_id
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      nfe: result.rows[0],
      message: 'Nfe criado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao criar Nfe:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/nfe/:id - Atualizar Nfe
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { number, customer_name, date, total, status, segment_id } = req.body;
    
    const query = `
      UPDATE nfe SET
        number = COALESCE($1, number),
        customer_name = COALESCE($2, customer_name),
        date = COALESCE($3, date),
        total = COALESCE($4, total),
        status = COALESCE($5, status),
        segment_id = COALESCE($6, segment_id),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const params = [number, customer_name, date, total, status, segment_id, id];
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nfe não encontrado'
      });
    }
    
    res.json({
      success: true,
      nfe: result.rows[0],
      message: 'Nfe atualizado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao atualizar Nfe:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/nfe/:id - Deletar Nfe
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `DELETE FROM nfe WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Nfe não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Nfe deletado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao deletar Nfe:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
