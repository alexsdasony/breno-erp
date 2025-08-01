import express from 'express';
import { authenticateToken as auth } from './supabase/backend/middleware/auth.js';
import pkg from 'pg';
const { Pool } = pkg;

const app = express();
const PORT = 3003;

// Configuração do banco PostgreSQL
import { DATABASE_CONFIG } from './src/config/constants.js';

const connectionString = DATABASE_CONFIG.URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Middleware para validar parâmetros de data
const validateDateRange = (req, res, next) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ 
      error: 'Data inicial e final são obrigatórias' 
    });
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ 
      error: 'Formato de data inválido' 
    });
  }

  if (start > end) {
    return res.status(400).json({ 
      error: 'Data inicial não pode ser maior que a data final' 
    });
  }

  next();
};

// Rota de teste simples
app.get('/test', (req, res) => {
  res.json({ message: 'Teste funcionando!' });
});

// Rota de teste do DRE sem autenticação
app.get('/dre-test', validateDateRange, async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { startDate, endDate } = req.query;

    // Query simples para testar
    const query = `
      SELECT 
        t.id,
        t.description,
        t.amount,
        t.type,
        t.date
      FROM transactions t
      WHERE t.date >= $1 AND t.date <= $2
      LIMIT 10
    `;

    const result = await client.query(query, [startDate, endDate]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });

  } catch (error) {
    console.error('Erro no teste:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

// Rota para verificar estrutura das tabelas
app.get('/check-tables', async (req, res) => {
  const client = await pool.connect();
  
  try {
    // Verificar se as tabelas existem
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('transactions', 'cost_centers', 'chart_of_accounts')
    `;
    
    const tablesResult = await client.query(tablesQuery);
    
    // Verificar estrutura da tabela transactions
    const structureQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'transactions'
    `;
    
    const structureResult = await client.query(structureQuery);
    
    res.json({
      tables: tablesResult.rows,
      transactions_structure: structureResult.rows
    });

  } catch (error) {
    console.error('Erro ao verificar tabelas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`🧪 Servidor de teste rodando na porta ${PORT}`);
  console.log(`📊 Teste: http://localhost:${PORT}/test`);
  console.log(`📈 DRE Test: http://localhost:${PORT}/dre-test?startDate=2024-01-01&endDate=2024-12-31`);
  console.log(`🔍 Check Tables: http://localhost:${PORT}/check-tables`);
}); 