import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/customers - Listar clientes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { segment_id, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('customers')
      .select('*')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    // Filtrar por segmento do usuário
    if (req.user.segment_id) {
      query = query.eq('segment_id', req.user.segment_id);
    }

    // Filtros opcionais
    if (segment_id) query = query.eq('segment_id', segment_id);

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
      customers: customers || [],
      count: customers?.length || 0
    });

  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/customers - Criar cliente
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, cpf, phone, address, city, state, segment_id } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    // Verificar se email já existe
    const { data: existingEmail, error: emailCheck } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (emailCheck) {
      console.error('Erro ao verificar email:', emailCheck);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (existingEmail && existingEmail.length > 0) {
      return res.status(409).json({
        error: 'Cliente com este email já existe',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Verificar se CPF já existe (se fornecido)
    if (cpf) {
      const { data: existingCpf, error: cpfCheck } = await supabase
        .from('customers')
        .select('id')
        .eq('cpf', cpf)
        .limit(1);

      if (cpfCheck) {
        console.error('Erro ao verificar CPF:', cpfCheck);
        return res.status(500).json({
          error: 'Erro interno do servidor',
          code: 'DATABASE_ERROR'
        });
      }

      if (existingCpf && existingCpf.length > 0) {
        return res.status(409).json({
          error: 'Cliente com este CPF já existe',
          code: 'CPF_ALREADY_EXISTS'
        });
      }
    }

    const customerData = {
      name,
      email,
      cpf: cpf || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      segment_id: segment_id || req.user.segment_id,
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };

    const { data: customer, error } = await supabase
      .from('customers')
      .insert(customerData)
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
      customer,
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

// PUT /api/customers/:id - Atualizar cliente
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, cpf, phone, address, city, state } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Nome e email são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    // Verificar se email já existe (exceto para o cliente atual)
    const { data: existingEmail, error: emailCheck } = await supabase
      .from('customers')
      .select('id')
      .eq('email', email)
      .neq('id', id)
      .limit(1);

    if (emailCheck) {
      console.error('Erro ao verificar email:', emailCheck);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (existingEmail && existingEmail.length > 0) {
      return res.status(409).json({
        error: 'Email já está em uso por outro cliente',
        code: 'EMAIL_ALREADY_EXISTS'
      });
    }

    // Verificar se CPF já existe (exceto para o cliente atual)
    if (cpf) {
      const { data: existingCpf, error: cpfCheck } = await supabase
        .from('customers')
        .select('id')
        .eq('cpf', cpf)
        .neq('id', id)
        .limit(1);

      if (cpfCheck) {
        console.error('Erro ao verificar CPF:', cpfCheck);
        return res.status(500).json({
          error: 'Erro interno do servidor',
          code: 'DATABASE_ERROR'
        });
      }

      if (existingCpf && existingCpf.length > 0) {
        return res.status(409).json({
          error: 'CPF já está em uso por outro cliente',
          code: 'CPF_ALREADY_EXISTS'
        });
      }
    }

    const updateData = {
      name,
      email,
      cpf: cpf || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      state: state || null,
      updated_at: new Date().toISOString()
    };

    const { data: customer, error } = await supabase
      .from('customers')
      .update(updateData)
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

    if (!customer) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        code: 'CUSTOMER_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      customer,
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

// DELETE /api/customers/:id - Excluir cliente
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir cliente:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/customers/:id - Buscar cliente específico
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

export default router; 