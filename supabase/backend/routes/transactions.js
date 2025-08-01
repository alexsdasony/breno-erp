import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/transactions - Listar transações
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { segment_id, start_date, end_date, type, limit = 100, offset = 0 } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Filtrar por segmento se fornecido
    if (segment_id) {
      whereClause += ` AND segment_id = $${paramIndex++}`;
      params.push(segment_id);
    }
    
    // Filtrar por data se especificado
    if (start_date) {
      whereClause += ` AND date >= $${paramIndex++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      whereClause += ` AND date <= $${paramIndex++}`;
      params.push(end_date);
    }
    
    // Filtrar por tipo se especificado
    if (type) {
      whereClause += ` AND type = $${paramIndex++}`;
      params.push(type);
    }
    
    const query = `
      SELECT 
        id,
        type,
        description,
        amount,
        date,
        category,
        cost_center,
        segment_id,
        created_at,
        updated_at
      FROM transactions 
      ${whereClause}
      ORDER BY date DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      transactions: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/transactions/:id - Buscar transação por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        type,
        description,
        amount,
        date,
        category,
        cost_center,
        segment_id,
        created_at,
        updated_at
      FROM transactions 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }
    
    res.json({
      success: true,
      transaction: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/transactions - Criar transação
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { type, description, amount, date, category, cost_center, segment_id } = req.body;
    
    // Validar campos obrigatórios
    if (!type || !description || !amount || !date) {
      return res.status(400).json({
        success: false,
        error: 'type, description, amount e date são obrigatórios'
      });
    }
    
    const query = `
      INSERT INTO transactions (type, description, amount, date, category, cost_center, segment_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const params = [
      type,
      description,
      amount,
      date,
      category || null,
      cost_center || null,
      segment_id || req.user.segment_id
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      transaction: result.rows[0],
      message: 'Transação criada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/transactions/:id - Atualizar transação
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { type, description, amount, date, category, cost_center, segment_id } = req.body;
    
    const query = `
      UPDATE transactions SET
        type = COALESCE($1, type),
        description = COALESCE($2, description),
        amount = COALESCE($3, amount),
        date = COALESCE($4, date),
        category = COALESCE($5, category),
        cost_center = COALESCE($6, cost_center),
        segment_id = COALESCE($7, segment_id),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    
    const params = [type, description, amount, date, category, cost_center, segment_id, id];
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }
    
    res.json({
      success: true,
      transaction: result.rows[0],
      message: 'Transação atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/transactions/:id - Deletar transação
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = 'DELETE FROM transactions WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Transação não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Transação deletada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/transactions/import - Importar transações em lote
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        success: false,
        error: 'Lista de transações é obrigatória'
      });
    }
    
    const insertedTransactions = [];
    
    for (const transaction of transactions) {
      const { type, description, amount, date, category, cost_center, segment_id } = transaction;
      
      if (!type || !description || !amount || !date) {
        continue; // Pular transações inválidas
      }
      
      const query = `
        INSERT INTO transactions (type, description, amount, date, category, cost_center, segment_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const params = [
        type,
        description,
        amount,
        date,
        category || null,
        cost_center || null,
        segment_id || req.user.segment_id
      ];
      
      const result = await db.query(query, params);
      insertedTransactions.push(result.rows[0]);
    }
    
    res.status(201).json({
      success: true,
      transactions: insertedTransactions,
      message: `${insertedTransactions.length} transações importadas com sucesso`
    });
    
  } catch (error) {
    console.error('Erro ao importar transações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router; 