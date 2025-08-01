#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Lista de endpoints que estão faltando baseado no frontend
const missingEndpoints = [
  'billings',
  'cost-centers', 
  'accounts-payable',
  'nfe',
  'integrations',
  'metrics',
  'users',
  'receita'
];

// Template base para cada endpoint
const endpointTemplate = (name, displayName) => `import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// GET /api/${name} - Listar ${displayName}
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { segment_id, limit = 100, offset = 0 } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    
    // Filtrar por segmento se fornecido
    if (segment_id) {
      whereClause += \` AND segment_id = \$\${paramIndex++}\`;
      params.push(segment_id);
    }
    
    const query = \`
      SELECT 
        id,
        name,
        segment_id,
        created_at,
        updated_at
      FROM ${name.replace('-', '_')} 
      \${whereClause}
      ORDER BY name ASC
      LIMIT \$\${paramIndex++} OFFSET \$\${paramIndex++}
    \`;
    
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await db.query(query, params);
    
    res.json({
      success: true,
      ${name.replace('-', '')}: result.rows || [],
      total: result.rows?.length || 0
    });
    
  } catch (error) {
    console.error(\`Erro ao buscar ${displayName}:\`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// GET /api/${name}/:id - Buscar ${displayName} por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = \`
      SELECT 
        id,
        name,
        segment_id,
        created_at,
        updated_at
      FROM ${name.replace('-', '_')} 
      WHERE id = \$1
    \`;
    
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '${displayName} não encontrado'
      });
    }
    
    res.json({
      success: true,
      ${name.replace('-', '')}: result.rows[0]
    });
    
  } catch (error) {
    console.error(\`Erro ao buscar ${displayName}:\`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// POST /api/${name} - Criar ${displayName}
router.post('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { name, segment_id } = req.body;
    
    // Validar campos obrigatórios
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nome é obrigatório'
      });
    }
    
    const query = \`
      INSERT INTO ${name.replace('-', '_')} (name, segment_id)
      VALUES (\$1, \$2)
      RETURNING *
    \`;
    
    const params = [
      name,
      segment_id || req.user.segment_id
    ];
    
    const result = await db.query(query, params);
    
    res.status(201).json({
      success: true,
      ${name.replace('-', '')}: result.rows[0],
      message: '${displayName} criado com sucesso'
    });
    
  } catch (error) {
    console.error(\`Erro ao criar ${displayName}:\`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// PUT /api/${name}/:id - Atualizar ${displayName}
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    const { name, segment_id } = req.body;
    
    const query = \`
      UPDATE ${name.replace('-', '_')} SET
        name = COALESCE(\$1, name),
        segment_id = COALESCE(\$2, segment_id),
        updated_at = NOW()
      WHERE id = \$3
      RETURNING *
    \`;
    
    const params = [name, segment_id, id];
    
    const result = await db.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '${displayName} não encontrado'
      });
    }
    
    res.json({
      success: true,
      ${name.replace('-', '')}: result.rows[0],
      message: '${displayName} atualizado com sucesso'
    });
    
  } catch (error) {
    console.error(\`Erro ao atualizar ${displayName}:\`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

// DELETE /api/${name}/:id - Deletar ${displayName}
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { id } = req.params;
    
    const query = \`DELETE FROM ${name.replace('-', '_')} WHERE id = \$1 RETURNING *\`;
    const result = await db.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '${displayName} não encontrado'
      });
    }
    
    res.json({
      success: true,
      message: '${displayName} deletado com sucesso'
    });
    
  } catch (error) {
    console.error(\`Erro ao deletar ${displayName}:\`, error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
});

export default router;
`;

// Criar os endpoints
missingEndpoints.forEach(endpoint => {
  const displayName = endpoint.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
  
  const filePath = path.join('supabase/backend/routes', `${endpoint}.js`);
  const content = endpointTemplate(endpoint, displayName);
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Criado: ${filePath}`);
});

console.log('\n🎉 Todos os endpoints foram criados!');
console.log('📝 Agora você precisa adicionar as rotas ao server.js'); 