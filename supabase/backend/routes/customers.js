import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Buscar todos os clientes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { segment_id } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('customers')
      .select('*')
      .order('name');

    // Filtrar por segmento se especificado
    if (segment_id) {
      query = query.eq('segment_id', segment_id);
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      customers: customers || []
    });

  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Buscar cliente por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar cliente:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (!customer) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        code: 'CUSTOMER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      customer
    });

  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Criar novo cliente
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, address, cpf_cnpj, segment_id } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Nome do cliente é obrigatório',
        code: 'MISSING_NAME'
      });
    }

    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        cpf_cnpj: cpf_cnpj || null,
        segment_id: segment_id || req.user.segment_id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar cliente:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.status(201).json({
      success: true,
      customer: newCustomer,
      message: 'Cliente criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atualizar cliente
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, cpf_cnpj, segment_id } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Nome do cliente é obrigatório',
        code: 'MISSING_NAME'
      });
    }

    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update({
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        cpf_cnpj: cpf_cnpj || null,
        segment_id: segment_id || req.user.segment_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar cliente:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (!updatedCustomer) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        code: 'CUSTOMER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      customer: updatedCustomer,
      message: 'Cliente atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Deletar cliente
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar cliente:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      message: 'Cliente deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router; 