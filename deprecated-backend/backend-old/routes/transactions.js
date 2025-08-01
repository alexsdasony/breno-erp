import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/transactions - Listar transações
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { segment_id, type, start_date, end_date, limit = 100, offset = 0 } = req.query;
    const userId = req.user.id;

    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filtrar por segmento do usuário
    if (req.user.segment_id) {
      query = query.eq('segment_id', req.user.segment_id);
    }

    // Filtros opcionais
    if (segment_id) query = query.eq('segment_id', segment_id);
    if (type) query = query.eq('type', type);
    if (start_date) query = query.gte('date', start_date);
    if (end_date) query = query.lte('date', end_date);

    const { data: transactions, error } = await query;

    if (error) {
      console.error('Erro ao buscar transações:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      transactions: transactions || [],
      count: transactions?.length || 0
    });

  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/transactions - Criar transação
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { description, amount, type, date, category, cost_center, segment_id } = req.body;

    if (!description || !amount || !type || !date) {
      return res.status(400).json({
        error: 'Descrição, valor, tipo e data são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    const transactionData = {
      description,
      amount: parseFloat(amount),
      type,
      date,
      category: category || 'Geral',
      cost_center: type === 'despesa' ? cost_center : null,
      segment_id: segment_id || req.user.segment_id,
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar transação:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.status(201).json({
      success: true,
      transaction,
      message: 'Transação criada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// PUT /api/transactions/:id - Atualizar transação
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, type, date, category, cost_center } = req.body;

    if (!description || !amount || !type || !date) {
      return res.status(400).json({
        error: 'Descrição, valor, tipo e data são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    const updateData = {
      description,
      amount: parseFloat(amount),
      type,
      date,
      category: category || 'Geral',
      cost_center: type === 'despesa' ? cost_center : null,
      updated_at: new Date().toISOString()
    };

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar transação:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (!transaction) {
      return res.status(404).json({
        error: 'Transação não encontrada',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      transaction,
      message: 'Transação atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// DELETE /api/transactions/:id - Excluir transação
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir transação:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      message: 'Transação excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/transactions/:id - Buscar transação específica
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar transação:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (!transaction) {
      return res.status(404).json({
        error: 'Transação não encontrada',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Erro ao buscar transação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/transactions/import - Importar transações
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        error: 'Lista de transações é obrigatória',
        code: 'MISSING_TRANSACTIONS'
      });
    }

    const processedTransactions = transactions.map(t => ({
      description: t.description || 'Transação importada',
      amount: parseFloat(t.amount) || 0,
      type: t.type || 'despesa',
      date: t.date || new Date().toISOString().split('T')[0],
      category: t.category || 'Geral',
      cost_center: t.type === 'despesa' ? t.cost_center : null,
      segment_id: t.segment_id || req.user.segment_id,
      created_by: req.user.id,
      created_at: new Date().toISOString()
    }));

    const { data: importedTransactions, error } = await supabase
      .from('transactions')
      .insert(processedTransactions)
      .select();

    if (error) {
      console.error('Erro ao importar transações:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.status(201).json({
      success: true,
      imported: importedTransactions?.length || 0,
      transactions: importedTransactions || [],
      message: `${importedTransactions?.length || 0} transações importadas com sucesso`
    });

  } catch (error) {
    console.error('Erro ao importar transações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router; 