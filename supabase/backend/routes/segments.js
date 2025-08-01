import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Buscar todos os segmentos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: segments, error } = await supabase
      .from('segments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Erro ao buscar segmentos:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      segments: segments || []
    });

  } catch (error) {
    console.error('Erro ao buscar segmentos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Buscar segmento por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: segment, error } = await supabase
      .from('segments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar segmento:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (!segment) {
      return res.status(404).json({
        error: 'Segmento não encontrado',
        code: 'SEGMENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      segment
    });

  } catch (error) {
    console.error('Erro ao buscar segmento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Criar novo segmento
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Nome do segmento é obrigatório',
        code: 'MISSING_NAME'
      });
    }

    const { data: newSegment, error } = await supabase
      .from('segments')
      .insert({
        name,
        description: description || null
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar segmento:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.status(201).json({
      success: true,
      segment: newSegment,
      message: 'Segmento criado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao criar segmento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Atualizar segmento
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Nome do segmento é obrigatório',
        code: 'MISSING_NAME'
      });
    }

    const { data: updatedSegment, error } = await supabase
      .from('segments')
      .update({
        name,
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar segmento:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (!updatedSegment) {
      return res.status(404).json({
        error: 'Segmento não encontrado',
        code: 'SEGMENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      segment: updatedSegment,
      message: 'Segmento atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar segmento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// Deletar segmento
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se há usuários ou dados associados ao segmento
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .eq('segment_id', id)
      .limit(1);

    if (usersError) {
      console.error('Erro ao verificar usuários do segmento:', usersError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (users && users.length > 0) {
      return res.status(400).json({
        error: 'Não é possível deletar segmento com usuários associados',
        code: 'SEGMENT_HAS_USERS'
      });
    }

    const { error } = await supabase
      .from('segments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar segmento:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      message: 'Segmento deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar segmento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router; 