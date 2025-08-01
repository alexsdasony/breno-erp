import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// GET /api/segments - Listar segmentos
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('segments')
      .select('*')
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: segments, error } = await query;

    if (error) {
      console.error('Erro ao buscar segmentos:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      segments: segments || [],
      count: segments?.length || 0
    });

  } catch (error) {
    console.error('Erro ao listar segmentos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /api/segments - Criar segmento
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Nome é obrigatório',
        code: 'MISSING_FIELDS'
      });
    }

    // Verificar se segmento já existe
    const { data: existingSegment, error: checkError } = await supabase
      .from('segments')
      .select('id')
      .eq('name', name)
      .limit(1);

    if (checkError) {
      console.error('Erro ao verificar segmento existente:', checkError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (existingSegment && existingSegment.length > 0) {
      return res.status(409).json({
        error: 'Segmento com este nome já existe',
        code: 'SEGMENT_ALREADY_EXISTS'
      });
    }

    const segmentData = {
      name,
      description: description || null,
      created_by: req.user.id,
      created_at: new Date().toISOString()
    };

    const { data: segment, error } = await supabase
      .from('segments')
      .insert(segmentData)
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
      segment,
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

// PUT /api/segments/:id - Atualizar segmento
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Nome é obrigatório',
        code: 'MISSING_FIELDS'
      });
    }

    // Verificar se nome já existe (exceto para o segmento atual)
    const { data: existingSegment, error: checkError } = await supabase
      .from('segments')
      .select('id')
      .eq('name', name)
      .neq('id', id)
      .limit(1);

    if (checkError) {
      console.error('Erro ao verificar segmento existente:', checkError);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    if (existingSegment && existingSegment.length > 0) {
      return res.status(409).json({
        error: 'Segmento com este nome já existe',
        code: 'SEGMENT_ALREADY_EXISTS'
      });
    }

    const updateData = {
      name,
      description: description || null,
      updated_at: new Date().toISOString()
    };

    const { data: segment, error } = await supabase
      .from('segments')
      .update(updateData)
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

    if (!segment) {
      return res.status(404).json({
        error: 'Segmento não encontrado',
        code: 'SEGMENT_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      segment,
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

// DELETE /api/segments/:id - Excluir segmento
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('segments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir segmento:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        code: 'DATABASE_ERROR'
      });
    }

    res.json({
      success: true,
      message: 'Segmento excluído com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir segmento:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /api/segments/:id - Buscar segmento específico
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

export default router; 