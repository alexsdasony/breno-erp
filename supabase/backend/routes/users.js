import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/users - Listar Users
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
        email,
        role,
        status,
        segment_id,
        created_at,
        updated_at
      FROM users 
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      users: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Users:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/users/:id - Buscar Users por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        name,
        email,
        role,
        status,
        segment_id,
        created_at,
        updated_at
      FROM users 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Users não encontrado'
      });
    }
    
    res.json({
      success: true,
      users: result.rows[0]
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Users:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/users - Criar Users
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { name, email, password, role, status, segment_id } = req.body;
    
    // Validar campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'name, email e password são obrigatórios'
      });
    }
    
    const query = `
      INSERT INTO users (name, email, password, role, status, segment_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const params = [
      name,
      email,
      password,
      role || 'user',
      status || 'ativo',
      segment_id || req.user.segment_id
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      users: result.rows[0],
      message: 'Users criado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao criar Users:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/users/:id - Atualizar Users
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { name, email, password, role, status, segment_id } = req.body;
    
    const query = `
      UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        password = COALESCE($3, password),
        role = COALESCE($4, role),
        status = COALESCE($5, status),
        segment_id = COALESCE($6, segment_id),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const params = [name, email, password, role, status, segment_id, id];
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Users não encontrado'
      });
    }
    
    res.json({
      success: true,
      users: result.rows[0],
      message: 'Users atualizado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao atualizar Users:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/users/:id - Deletar Users
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `DELETE FROM users WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Users não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Users deletado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao deletar Users:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
