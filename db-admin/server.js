import express from 'express';
import cors from 'cors';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConfig, serverConfig } from './config.js';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const pool = new Pool(dbConfig);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rota para servir a interface web
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API para testar conexão
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ status: 'OK', message: 'Conexão com PostgreSQL funcionando' });
  } catch (error) {
    res.status(500).json({ status: 'ERROR', message: error.message });
  }
});

// API para listar todas as tabelas
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar tabelas:', error);
    res.status(500).json({ error: error.message });
  }
});

// API para obter estrutura de uma tabela
app.get('/api/tables/:tableName/structure', async (req, res) => {
  try {
    const { tableName } = req.params;
    const result = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default,
        character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = $1 AND table_schema = 'public'
      ORDER BY ordinal_position
    `, [tableName]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao obter estrutura da tabela:', error);
    res.status(500).json({ error: error.message });
  }
});

// API para obter dados de uma tabela
app.get('/api/tables/:tableName/data', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit = 100, offset = 0 } = req.query;
    
    // Validar nome da tabela
    const validTableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = $1 AND table_schema = 'public'
    `, [tableName]);
    
    if (validTableResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    
    const result = await pool.query(`SELECT * FROM "${tableName}" LIMIT $1 OFFSET $2`, [limit, offset]);
    const countResult = await pool.query(`SELECT COUNT(*) FROM "${tableName}"`);
    
    res.json({
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Erro ao obter dados da tabela:', error);
    res.status(500).json({ error: error.message });
  }
});

// API para executar query personalizada
app.post('/api/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query é obrigatória' });
    }
    
    // Limitar apenas queries SELECT
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
      return res.status(403).json({ error: 'Apenas queries SELECT são permitidas' });
    }
    
    const result = await pool.query(query);
    res.json({
      rows: result.rows,
      rowCount: result.rowCount,
      fields: result.fields?.map(f => ({ name: f.name, dataTypeID: f.dataTypeID }))
    });
  } catch (error) {
    console.error('Erro ao executar query:', error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD: Criar registro
app.post('/api/tables/:tableName/records', async (req, res) => {
  console.log('POST /api/tables/:tableName/records chamado');
  console.log('Params:', req.params);
  console.log('Body:', req.body);
  
  try {
    const { tableName } = req.params;
    const data = req.body;
    
    // Validar dados
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Dados são obrigatórios' });
    }
    
    // Validar nome da tabela
    const validTableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = $1 AND table_schema = 'public'
    `, [tableName]);
    
    if (validTableResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    
    // Preparar query de inserção
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    const columnsStr = columns.map(col => `"${col}"`).join(', ');
    
    const query = `INSERT INTO "${tableName}" (${columnsStr}) VALUES (${placeholders}) RETURNING *`;
    console.log('Query:', query);
    console.log('Values:', values);
    
    const result = await pool.query(query, values);
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao inserir registro:', error);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// CRUD: Atualizar registro
app.put('/api/tables/:tableName/records/:id', async (req, res) => {
  console.log('PUT /api/tables/:tableName/records/:id chamado');
  
  try {
    const { tableName, id } = req.params;
    const data = req.body;
    
    // Validar dados
    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Dados são obrigatórios' });
    }
    
    // Validar nome da tabela
    const validTableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = $1 AND table_schema = 'public'
    `, [tableName]);
    
    if (validTableResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    
    // Preparar query de atualização
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => `"${col}" = $${index + 1}`).join(', ');
    
    const query = `UPDATE "${tableName}" SET ${setClause} WHERE id = $${columns.length + 1} RETURNING *`;
    const result = await pool.query(query, [...values, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    res.status(500).json({ error: error.message });
  }
});

// CRUD: Deletar registro
app.delete('/api/tables/:tableName/records/:id', async (req, res) => {
  console.log('DELETE /api/tables/:tableName/records/:id chamado');
  
  try {
    const { tableName, id } = req.params;
    
    // Validar nome da tabela
    const validTableResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = $1 AND table_schema = 'public'
    `, [tableName]);
    
    if (validTableResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    
    const query = `DELETE FROM "${tableName}" WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' });
    }
    
    res.json({ success: true, message: 'Registro deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    res.status(500).json({ error: error.message });
  }
});

// API para informações do banco
app.get('/api/database/info', async (req, res) => {
  try {
    const versionResult = await pool.query('SELECT version()');
    const sizeResult = await pool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `);
    const tablesCountResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    res.json({
      version: versionResult.rows[0].version,
      size: sizeResult.rows[0].size,
      tablesCount: parseInt(tablesCountResult.rows[0].count)
    });
  } catch (error) {
    console.error('Erro ao obter informações do banco:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error middleware:', err);
  res.status(500).json({ error: 'Erro interno do servidor', details: err.message });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.method, req.originalUrl);
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(serverConfig.port, () => {
  console.log(`🐘 DB Admin rodando em http://localhost:${serverConfig.port}`);
  console.log(`📊 Conectado ao PostgreSQL: breno_erp`);
  console.log('Rotas disponíveis:');
  console.log('  GET  /api/health');
  console.log('  GET  /api/tables');
  console.log('  GET  /api/tables/:tableName/structure');
  console.log('  GET  /api/tables/:tableName/data');
  console.log('  POST /api/query');
  console.log('  POST /api/tables/:tableName/records');
  console.log('  PUT  /api/tables/:tableName/records/:id');
  console.log('  DELETE /api/tables/:tableName/records/:id');
  console.log('  GET  /api/database/info');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Fechando conexões do banco...');
  await pool.end();
  process.exit(0);
}); 