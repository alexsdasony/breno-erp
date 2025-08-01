import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Buscar todas as transações
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { segment_id, start_date, end_date, type } = req.query;

    let query = supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    // Filtrar por segmento se especificado
    if (segment_id) {
      query = query.eq('segment_id', segment_id);
    }

    // Filtrar por data se especificado
    if (start_date) {
      query = query.gte('created_at', start_date);
    }

    if (end_date) {
      query = query.lte('created_at', end_date);
    }

    // Filtrar por tipo se especificado
    if (type) {
      query = query.eq('type', type);
    }

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
      transactions: transactions || []
    });

  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Buscar transação por ID
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

// Criar nova transação
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      description, 
      amount, 
      type, 
      category, 
      customer_id, 
      cost_center_id,
      segment_id,
      date 
    } = req.body;

    if (!description || !amount || !type) {
      return res.status(400).json({
        error: 'Descrição, valor e tipo são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    const { data: newTransaction, error } = await supabase
      .from('transactions')
      .insert({
        description,
        amount: parseFloat(amount),
        type,
        category: category || null,
        customer_id: customer_id || null,
        cost_center_id: cost_center_id || null,
        segment_id: segment_id || req.user.segment_id,
        date: date || new Date().toISOString()
      })
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
      transaction: newTransaction,
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

// Atualizar transação
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      description, 
      amount, 
      type, 
      category, 
      customer_id, 
      cost_center_id,
      segment_id,
      date 
    } = req.body;

    if (!description || !amount || !type) {
      return res.status(400).json({
        error: 'Descrição, valor e tipo são obrigatórios',
        code: 'MISSING_FIELDS'
      });
    }

    const { data: updatedTransaction, error } = await supabase
      .from('transactions')
      .update({
        description,
        amount: parseFloat(amount),
        type,
        category: category || null,
        customer_id: customer_id || null,
        cost_center_id: cost_center_id || null,
        segment_id: segment_id || req.user.segment_id,
        date: date || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
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

    if (!updatedTransaction) {
      return res.status(404).json({
        error: 'Transação não encontrada',
        code: 'TRANSACTION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      transaction: updatedTransaction,
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

// Deletar transação
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar transação:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      message: 'Transação deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Importar transações em lote
router.post('/import', authenticateToken, async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({
        error: 'Lista de transações é obrigatória',
        code: 'MISSING_TRANSACTIONS'
      });
    }

    // Preparar dados para inserção
    const transactionsToInsert = transactions.map(transaction => ({
      description: transaction.description,
      amount: parseFloat(transaction.amount),
      type: transaction.type,
      category: transaction.category || null,
      customer_id: transaction.customer_id || null,
      cost_center_id: transaction.cost_center_id || null,
      segment_id: transaction.segment_id || req.user.segment_id,
      date: transaction.date || new Date().toISOString()
    }));

    const { data: newTransactions, error } = await supabase
      .from('transactions')
      .insert(transactionsToInsert)
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
      transactions: newTransactions,
      message: `${newTransactions.length} transações importadas com sucesso`
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