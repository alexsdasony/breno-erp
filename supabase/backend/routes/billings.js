import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/billings - Listar Billings
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
        customer_id,
        customer_name,
        amount,
        due_date,
        status,
        payment_date,
        segment_id,
        created_at,
        updated_at
      FROM billings 
      ${whereClause}
      ORDER BY due_date ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      billings: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Billings:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/billings/:id - Buscar Billings por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        customer_id,
        customer_name,
        amount,
        due_date,
        status,
        payment_date,
        segment_id,
        created_at,
        updated_at
      FROM billings 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Billings não encontrado'
      });
    }
    
    res.json({
      success: true,
      billings: result.rows[0]
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Billings:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/billings - Criar Billings
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { customer_id, customer_name, amount, due_date, status, payment_date, segment_id } = req.body;
    
    // Validar campos obrigatórios
    if (!customer_name || !amount || !due_date) {
      return res.status(400).json({
        success: false,
        error: 'customer_name, amount e due_date são obrigatórios'
      });
    }
    
    const query = `
      INSERT INTO billings (customer_id, customer_name, amount, due_date, status, payment_date, segment_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const params = [
      customer_id,
      customer_name,
      amount,
      due_date,
      status || 'Pendente',
      payment_date,
      segment_id || req.user.segment_id
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      billings: result.rows[0],
      message: 'Billings criado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao criar Billings:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/billings/:id - Atualizar Billings
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { customer_id, customer_name, amount, due_date, status, payment_date, segment_id } = req.body;
    
    const query = `
      UPDATE billings SET
        customer_id = COALESCE($1, customer_id),
        customer_name = COALESCE($2, customer_name),
        amount = COALESCE($3, amount),
        due_date = COALESCE($4, due_date),
        status = COALESCE($5, status),
        payment_date = COALESCE($6, payment_date),
        segment_id = COALESCE($7, segment_id),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    
    const params = [customer_id, customer_name, amount, due_date, status, payment_date, segment_id, id];
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Billings não encontrado'
      });
    }
    
    res.json({
      success: true,
      billings: result.rows[0],
      message: 'Billings atualizado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao atualizar Billings:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/billings/:id - Deletar Billings
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `DELETE FROM billings WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Billings não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Billings deletado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao deletar Billings:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
