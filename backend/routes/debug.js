import express from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/prodConfig.js';

const router = express.Router();

// POST /api/debug/create-admin
router.post('/create-admin', async (req, res) => {
  try {
    console.log('🔧 Criando usuário admin...');
    
    const db = await getDatabase();
    
    // Verificar se o usuário já existe
    const existingUser = await db.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['admin@erppro.com']
    );
    
    if (existingUser.rows && existingUser.rows.length > 0) {
      console.log('👤 Usuário admin já existe');
      return res.json({ 
        success: true, 
        message: 'Usuário admin já existe',
        user: existingUser.rows[0]
      });
    }
    
    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const result = await db.query(`
      INSERT INTO users (name, email, password, role, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, email, role
    `, ['Admin', 'admin@erppro.com', hashedPassword, 'admin', 'active']);
    
    console.log('✅ Usuário admin criado:', result.rows[0]);
    
    res.json({ 
      success: true, 
      message: 'Usuário admin criado com sucesso',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/debug/check-db
router.get('/check-db', async (req, res) => {
  try {
    console.log('🔍 Verificando banco de dados...');
    
    const db = await getDatabase();
    
    // Testar conexão
    const result = await db.query('SELECT NOW() as current_time');
    
    // Verificar tabelas
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    res.json({
      success: true,
      currentTime: result.rows[0].current_time,
      tables: tablesResult.rows.map(row => row.table_name),
      environment: process.env.NODE_ENV || 'development',
      render: !!process.env.RENDER
    });
    
  } catch (error) {
    console.error('❌ Erro ao verificar banco:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router; 