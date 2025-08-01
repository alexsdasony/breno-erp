import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/products - Listar produtos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { segment_id, low_stock, search, limit = 100, offset = 0 } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Filtrar por segmento se fornecido
    if (segment_id) {
      whereClause += ` AND segment_id = $${paramIndex++}`;
      params.push(segment_id);
    }
    
    // Filtrar produtos com baixo estoque
    if (low_stock === 'true') {
      whereClause += ` AND stock_quantity <= minimum_stock`;
    }
    
    // Busca por nome ou código
    if (search) {
      whereClause += ` AND (name ILIKE $${paramIndex++} OR code ILIKE $${paramIndex++})`;
      params.push(`%${search}%`);
      params.push(`%${search}%`);
    }
    
    const query = `
      SELECT 
        id,
        name,
        code,
        description,
        price,
        cost_price,
        stock_quantity,
        minimum_stock,
        category,
        supplier,
        segment_id,
        created_at,
        updated_at
      FROM products 
      ${whereClause}
      ORDER BY name ASC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      products: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/products/:id - Buscar produto por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = `
      SELECT 
        id,
        name,
        code,
        description,
        price,
        cost_price,
        stock_quantity,
        minimum_stock,
        category,
        supplier,
        segment_id,
        created_at,
        updated_at
      FROM products 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      product: result.rows[0]
    });
    
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/products - Criar produto
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const {
      name,
      code,
      description,
      price,
      cost_price,
      stock_quantity,
      minimum_stock,
      category,
      supplier,
      segment_id
    } = req.body;
    
    // Validar campos obrigatórios
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        error: 'Nome e código são obrigatórios'
      });
    }
    
    const query = `
      INSERT INTO products (
        name, code, description, price, cost_price, 
        stock_quantity, minimum_stock, category, supplier, segment_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const params = [
      name,
      code,
      description || '',
      price || 0,
      cost_price || 0,
      stock_quantity || 0,
      minimum_stock || 0,
      category || '',
      supplier || '',
      segment_id || req.user.segment_id
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      product: result.rows[0],
      message: 'Produto criado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/products/:id - Atualizar produto
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const {
      name,
      code,
      description,
      price,
      cost_price,
      stock_quantity,
      minimum_stock,
      category,
      supplier,
      segment_id
    } = req.body;
    
    const query = `
      UPDATE products SET
        name = COALESCE($1, name),
        code = COALESCE($2, code),
        description = COALESCE($3, description),
        price = COALESCE($4, price),
        cost_price = COALESCE($5, cost_price),
        stock_quantity = COALESCE($6, stock_quantity),
        minimum_stock = COALESCE($7, minimum_stock),
        category = COALESCE($8, category),
        supplier = COALESCE($9, supplier),
        segment_id = COALESCE($10, segment_id),
        updated_at = NOW()
      WHERE id = $11
      RETURNING *
    `;
    
    const params = [
      name,
      code,
      description,
      price,
      cost_price,
      stock_quantity,
      minimum_stock,
      category,
      supplier,
      segment_id,
      id
    ];
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      product: result.rows[0],
      message: 'Produto atualizado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/products/:id - Deletar produto
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: 'Produto deletado com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router; 