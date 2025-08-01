import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/sales - Listar vendas
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { segment_id, start_date, end_date, customer_id, status, limit = 100, offset = 0 } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Filtrar por segmento se fornecido
    if (segment_id) {
      whereClause += ` AND s.segment_id = $${paramIndex++}`;
      params.push(segment_id);
    }
    
    // Filtrar por período
    if (start_date) {
      whereClause += ` AND s.sale_date >= $${paramIndex++}`;
      params.push(start_date);
    }
    
    if (end_date) {
      whereClause += ` AND s.sale_date <= $${paramIndex++}`;
      params.push(end_date);
    }
    
    // Filtrar por cliente
    if (customer_id) {
      whereClause += ` AND s.customer_id = $${paramIndex++}`;
      params.push(customer_id);
    }
    
    // Filtrar por status
    if (status) {
      whereClause += ` AND s.status = $${paramIndex++}`;
      params.push(status);
    }
    
    const query = `
      SELECT 
        s.id,
        s.sale_date,
        s.total_amount,
        s.status,
        s.payment_method,
        s.notes,
        s.segment_id,
        s.customer_id,
        s.created_at,
        s.updated_at,
        c.name as customer_name,
        c.email as customer_email
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      ${whereClause}
      ORDER BY s.sale_date DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      sales: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/sales/:id - Buscar venda por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `
      SELECT 
        s.id,
        s.sale_date,
        s.total_amount,
        s.status,
        s.payment_method,
        s.notes,
        s.segment_id,
        s.customer_id,
        s.created_at,
        s.updated_at,
        c.name as customer_name,
        c.email as customer_email
      FROM sales s
      LEFT JOIN customers c ON s.customer_id = c.id
      WHERE s.id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }
    
    res.json({
      success: true,
      sale: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao buscar venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/sales - Criar venda
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const {
      sale_date,
      total_amount,
      status,
      payment_method,
      notes,
      customer_id,
      segment_id
    } = req.body;
    
    // Validar campos obrigatórios
    if (!sale_date || !total_amount) {
      return res.status(400).json({
        success: false,
        error: 'Data da venda e valor total são obrigatórios'
      });
    }
    
    const query = `
      INSERT INTO sales (
        sale_date, total_amount, status, payment_method, 
        notes, customer_id, segment_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const params = [
      sale_date,
      total_amount,
      status || 'completed',
      payment_method || 'cash',
      notes || '',
      customer_id,
      segment_id || req.user.segment_id
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      sale: result.rows[0],
      message: 'Venda criada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/sales/:id - Atualizar venda
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const {
      sale_date,
      total_amount,
      status,
      payment_method,
      notes,
      customer_id,
      segment_id
    } = req.body;
    
    const query = `
      UPDATE sales SET
        sale_date = COALESCE($1, sale_date),
        total_amount = COALESCE($2, total_amount),
        status = COALESCE($3, status),
        payment_method = COALESCE($4, payment_method),
        notes = COALESCE($5, notes),
        customer_id = COALESCE($6, customer_id),
        segment_id = COALESCE($7, segment_id),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    
    const params = [
      sale_date,
      total_amount,
      status,
      payment_method,
      notes,
      customer_id,
      segment_id,
      id
    ];
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }
    
    res.json({
      success: true,
      sale: result.rows[0],
      message: 'Venda atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/sales/:id - Deletar venda
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = 'DELETE FROM sales WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Venda deletada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router; 