import express from 'express';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProduct, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all products
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, segment_id, category, low_stock } = req.query;
    const offset = (page - 1) * limit;
    const db = await getDatabase();

    let query = 'SELECT * FROM products WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const params = [];
    const countParams = [];

    // Add filters
    if (segment_id && segment_id !== 'null' && segment_id !== '') {
      query += ' AND segment_id = ?';
      countQuery += ' AND segment_id = ?';
      params.push(parseInt(segment_id));
      countParams.push(parseInt(segment_id));
    }

    if (category) {
      query += ' AND category LIKE ?';
      countQuery += ' AND category LIKE ?';
      params.push(`%${category}%`);
      countParams.push(`%${category}%`);
    }

    if (low_stock === 'true') {
      query += ' AND stock <= min_stock';
      countQuery += ' AND stock <= min_stock';
    }

    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = await db.all(query, params);
    const total = await db.get(countQuery, countParams);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Get sales history for this product
    const salesHistory = await db.all(
      'SELECT * FROM sales WHERE product = ? ORDER BY date DESC LIMIT 10',
      [product.name]
    );

    res.json({ 
      product,
      salesHistory
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product
router.post('/', authenticateToken, validateProduct, async (req, res) => {
  try {
    const { name, stock, min_stock, price, category, segment_id } = req.body;
    const db = await getDatabase();

    // Verify segment exists
    const segment = await db.get('SELECT id FROM segments WHERE id = ?', [segment_id]);
    if (!segment) {
      return res.status(400).json({ error: 'Invalid segment ID' });
    }

    // Check if product name already exists in the same segment
    const existingProduct = await db.get(
      'SELECT id FROM products WHERE name = ? AND segment_id = ?',
      [name, segment_id]
    );
    if (existingProduct) {
      return res.status(400).json({ error: 'Product with this name already exists in this segment' });
    }

    const result = await db.run(
      'INSERT INTO products (name, stock, min_stock, price, category, segment_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, stock, min_stock, price, category, segment_id]
    );

    const product = await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product
router.put('/:id', authenticateToken, validateId, validateProduct, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, stock, min_stock, price, category, segment_id } = req.body;
    const db = await getDatabase();

    // Check if product exists
    const existingProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existingProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Verify segment exists
    const segment = await db.get('SELECT id FROM segments WHERE id = ?', [segment_id]);
    if (!segment) {
      return res.status(400).json({ error: 'Invalid segment ID' });
    }

    // Check if name is taken by another product in the same segment
    const nameConflict = await db.get(
      'SELECT id FROM products WHERE name = ? AND segment_id = ? AND id != ?',
      [name, segment_id, id]
    );
    if (nameConflict) {
      return res.status(400).json({ error: 'Product name already exists in this segment' });
    }

    await db.run(
      'UPDATE products SET name = ?, stock = ?, min_stock = ?, price = ?, category = ?, segment_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, stock, min_stock, price, category, segment_id, id]
    );

    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Update product stock
router.patch('/:id/stock', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation = 'set' } = req.body; // operation: 'set', 'add', 'subtract'
    const db = await getDatabase();

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }

    // Check if product exists
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    let newStock;
    switch (operation) {
      case 'add':
        newStock = product.stock + stock;
        break;
      case 'subtract':
        newStock = Math.max(0, product.stock - stock);
        break;
      case 'set':
      default:
        newStock = stock;
    }

    await db.run(
      'UPDATE products SET stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStock, id]
    );

    const updatedProduct = await db.get('SELECT * FROM products WHERE id = ?', [id]);

    res.json({
      message: 'Product stock updated successfully',
      product: updatedProduct,
      operation,
      oldStock: product.stock,
      newStock
    });

  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: 'Failed to update product stock' });
  }
});

// Delete product
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Check if product exists
    const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if product is used in sales
    const salesCount = await db.get(
      'SELECT COUNT(*) as count FROM sales WHERE product = ?',
      [product.name]
    );
    if (salesCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product with existing sales. Consider deactivating instead.' 
      });
    }

    await db.run('DELETE FROM products WHERE id = ?', [id]);

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Get low stock products
router.get('/alerts/low-stock', authenticateToken, async (req, res) => {
  try {
    const { segment_id } = req.query;
    const db = await getDatabase();

    let query = 'SELECT * FROM products WHERE stock <= min_stock';
    const params = [];

    if (segment_id) {
      query += ' AND segment_id = ?';
      params.push(segment_id);
    }

    query += ' ORDER BY (stock - min_stock) ASC';

    const lowStockProducts = await db.all(query, params);

    res.json({ lowStockProducts });

  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({ error: 'Failed to fetch low stock products' });
  }
});

// Bulk import products
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { products } = req.body;
    const db = await getDatabase();

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Invalid products data' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        // Validate required fields
        if (!product.name || !product.price || !product.category || !product.segment_id) {
          errors.push({ index: i, error: 'Missing required fields' });
          continue;
        }

        // Verify segment exists
        const segment = await db.get('SELECT id FROM segments WHERE id = ?', [product.segment_id]);
        if (!segment) {
          errors.push({ index: i, error: 'Invalid segment ID' });
          continue;
        }

        // Check for duplicates
        const existingProduct = await db.get(
          'SELECT id FROM products WHERE name = ? AND segment_id = ?',
          [product.name, product.segment_id]
        );
        if (existingProduct) {
          errors.push({ index: i, error: 'Product already exists in this segment' });
          continue;
        }

        const result = await db.run(
          'INSERT INTO products (name, stock, min_stock, price, category, segment_id) VALUES (?, ?, ?, ?, ?, ?)',
          [
            product.name,
            product.stock || 0,
            product.min_stock || 0,
            parseFloat(product.price),
            product.category,
            product.segment_id
          ]
        );

        results.push({ index: i, id: result.lastID });

      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    res.json({
      message: `Bulk import completed. ${results.length} products imported, ${errors.length} errors`,
      imported: results.length,
      errors: errors.length,
      details: { results, errors }
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import products' });
  }
});

export default router; 