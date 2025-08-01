import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/accounts-payable - Listar Accounts Payable
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
        supplier,
        description,
        amount,
        due_date,
        status,
        segment_id,
        created_at,
        updated_at
      FROM accounts_payable 
      ${whereClause}
      ORDER BY due_date ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      accounts_payable: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Accounts Payable:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/accounts-payable/:id - Buscar Accounts Payable por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        supplier,
        description,
        amount,
        due_date,
        status,
        segment_id,
        created_at,
        updated_at
      FROM accounts_payable 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Accounts Payable não encontrado'
      });
    }
    
    res.json({
      success: true,
      accounts_payable: result.rows[0]
    });
    
  } catch (error) {
    console.error(`Erro ao buscar Accounts Payable:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/accounts-payable - Criar Accounts Payable
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { supplier, description, amount, due_date, status, segment_id } = req.body;
    
    // Validar campos obrigatórios
    if (!supplier || !amount || !due_date) {
      return res.status(400).json({
        success: false,
        error: 'supplier, amount e due_date são obrigatórios'
      });
    }
    
    const query = `
      INSERT INTO accounts_payable (supplier, description, amount, due_date, status, segment_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const params = [
      supplier,
      description || '',
      amount,
      due_date,
      status || 'pending',
      segment_id || req.user.segment_id
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      accounts_payable: result.rows[0],
      message: 'Accounts Payable criado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao criar Accounts Payable:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/accounts-payable/:id - Atualizar Accounts Payable
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { supplier, description, amount, due_date, status, segment_id } = req.body;
    
    const query = `
      UPDATE accounts_payable SET
        supplier = COALESCE($1, supplier),
        description = COALESCE($2, description),
        amount = COALESCE($3, amount),
        due_date = COALESCE($4, due_date),
        status = COALESCE($5, status),
        segment_id = COALESCE($6, segment_id),
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `;
    
    const params = [supplier, description, amount, due_date, status, segment_id, id];
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Accounts Payable não encontrado'
      });
    }
    
    res.json({
      success: true,
      accounts_payable: result.rows[0],
      message: 'Accounts Payable atualizado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao atualizar Accounts Payable:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/accounts-payable/:id - Deletar Accounts Payable
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `DELETE FROM accounts_payable WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Accounts Payable não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Accounts Payable deletado com sucesso'
    });
    
  } catch (error) {
    console.error(`Erro ao deletar Accounts Payable:`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
