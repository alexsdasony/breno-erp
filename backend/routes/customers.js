import express from 'express';
import { getDatabase } from '../database/prodConfig.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateCustomer, validateId, validatePagination } from '../middleware/validation.js';

const router = express.Router();

// Get all customers
router.get('/', authenticateToken, validatePagination, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;
    const db = await getDatabase();

    let query = 'SELECT * FROM customers WHERE 1=1';
    let countQuery = 'SELECT COUNT(*) as count FROM customers WHERE 1=1';
    const params = [];
    const countParams = [];

    // Add search filter
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR document LIKE ?)';
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR document LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const customers = await db.all(query, params);
    const total = await db.get(countQuery, countParams);

    res.json({
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total.count,
        pages: Math.ceil(total.count / limit)
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get customer sales history
    const sales = await db.all(
      'SELECT * FROM sales WHERE customer_id = ? ORDER BY date DESC LIMIT 10',
      [id]
    );

    // Get customer billings
    const billings = await db.all(
      'SELECT * FROM billings WHERE customer_id = ? ORDER BY due_date DESC LIMIT 10',
      [id]
    );

    res.json({ 
      customer,
      sales,
      billings
    });

  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/', authenticateToken, validateCustomer, async (req, res) => {
  try {
    const { name, document, email, phone, address, city, state } = req.body;
    const db = await getDatabase();

    // Check if document already exists (if provided)
    if (document) {
      const existingCustomer = await db.get('SELECT id FROM customers WHERE document = ?', [document]);
      if (existingCustomer) {
        return res.status(400).json({ error: 'Customer with this document already exists' });
      }
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await db.get('SELECT id FROM customers WHERE email = ?', [email]);
      if (existingEmail) {
        return res.status(400).json({ error: 'Customer with this email already exists' });
      }
    }

    const result = await db.run(
      'INSERT INTO customers (name, document, email, phone, address, city, state) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, document || null, email || null, phone || null, address || null, city || null, state || null]
    );

    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [result.lastID]);

    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', authenticateToken, validateId, validateCustomer, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, document, email, phone, address, city, state } = req.body;
    const db = await getDatabase();

    // Check if customer exists
    const existingCustomer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!existingCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if document is taken by another customer (if provided and changed)
    if (document && document !== existingCustomer.document) {
      const documentConflict = await db.get(
        'SELECT id FROM customers WHERE document = ? AND id != ?',
        [document, id]
      );
      if (documentConflict) {
        return res.status(400).json({ error: 'Document already taken by another customer' });
      }
    }

    // Check if email is taken by another customer (if provided and changed)
    if (email && email !== existingCustomer.email) {
      const emailConflict = await db.get(
        'SELECT id FROM customers WHERE email = ? AND id != ?',
        [email, id]
      );
      if (emailConflict) {
        return res.status(400).json({ error: 'Email already taken by another customer' });
      }
    }

    await db.run(
      'UPDATE customers SET name = ?, document = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, document || null, email || null, phone || null, address || null, city || null, state || null, id]
    );

    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);

    res.json({
      message: 'Customer updated successfully',
      customer
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', authenticateToken, validateId, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await getDatabase();

    // Check if customer exists
    const customer = await db.get('SELECT * FROM customers WHERE id = ?', [id]);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Check if customer has sales
    const salesCount = await db.get('SELECT COUNT(*) as count FROM sales WHERE customer_id = ?', [id]);
    if (salesCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing sales. Consider deactivating instead.' 
      });
    }

    // Check if customer has billings
    const billingsCount = await db.get('SELECT COUNT(*) as count FROM billings WHERE customer_id = ?', [id]);
    if (billingsCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete customer with existing billings. Consider deactivating instead.' 
      });
    }

    await db.run('DELETE FROM customers WHERE id = ?', [id]);

    res.json({ message: 'Customer deleted successfully' });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Bulk import customers
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { customers } = req.body;
    const db = await getDatabase();

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({ error: 'Invalid customers data' });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      try {
        // Validate required fields
        if (!customer.name) {
          errors.push({ index: i, error: 'Name is required' });
          continue;
        }

        // Check for duplicates
        if (customer.document) {
          const existingDocument = await db.get('SELECT id FROM customers WHERE document = ?', [customer.document]);
          if (existingDocument) {
            errors.push({ index: i, error: 'Document already exists' });
            continue;
          }
        }

        if (customer.email) {
          const existingEmail = await db.get('SELECT id FROM customers WHERE email = ?', [customer.email]);
          if (existingEmail) {
            errors.push({ index: i, error: 'Email already exists' });
            continue;
          }
        }

        const result = await db.run(
          'INSERT INTO customers (name, document, email, phone, address, city, state, total_purchases, last_purchase_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            customer.name,
            customer.document || null,
            customer.email || null,
            customer.phone || null,
            customer.address || null,
            customer.city || null,
            customer.state || null,
            customer.total_purchases || 0,
            customer.last_purchase_date || null
          ]
        );

        results.push({ index: i, id: result.lastID });

      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    res.json({
      message: `Bulk import completed. ${results.length} customers imported, ${errors.length} errors`,
      imported: results.length,
      errors: errors.length,
      details: { results, errors }
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ error: 'Failed to import customers' });
  }
});

export default router; 