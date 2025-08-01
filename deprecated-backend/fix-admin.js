import express from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from './database/prodConfig.js';

const router = express.Router();

// Endpoint para verificar e criar usuário admin
router.get('/fix-admin', async (req, res) => {
  try {
    console.log('🚀 Verificando usuário admin...');
    
    const db = await getDatabase();
    
    // Verificar se usuário admin existe
    const userResult = await db.query(
      'SELECT id, name, email, role, status FROM users WHERE email = $1',
      ['admin@erppro.com']
    );
    
    if (userResult.rows.length > 0) {
      console.log('✅ Usuário admin encontrado:', userResult.rows[0]);
      
      // Atualizar usuário admin
      console.log('🔧 Atualizando usuário admin...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await db.query(`
        UPDATE users 
        SET password = $1, role = 'admin', status = 'ativo', updated_at = CURRENT_TIMESTAMP
        WHERE email = 'admin@erppro.com'
      `, [hashedPassword]);
      
      console.log('✅ Usuário admin atualizado');
      
      res.json({
        success: true,
        message: 'Usuário admin atualizado',
        user: userResult.rows[0]
      });
    } else {
      console.log('❌ Usuário admin não encontrado');
      
      // Criar usuário admin
      console.log('🔧 Criando usuário admin...');
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      const createResult = await db.query(`
        INSERT INTO users (name, email, password, role, status)
        VALUES ('Admin ERP Pro', 'admin@erppro.com', $1, 'admin', 'ativo')
        RETURNING id, name, email, role, status
      `, [hashedPassword]);
      
      console.log('✅ Usuário admin criado:', createResult.rows[0]);
      
      res.json({
        success: true,
        message: 'Usuário admin criado',
        user: createResult.rows[0]
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 