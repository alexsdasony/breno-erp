import express from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from './database/prodConfig.js';

const router = express.Router();

// Simple endpoint to initialize database
router.get('/setup', async (req, res) => {
  try {
    console.log('🚀 Setup endpoint chamado...');
    
    const db = await getDatabase();
    
    // Criar tabela segments
    await db.query(`
      CREATE TABLE IF NOT EXISTS segments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela segments criada');
    
    // Criar tabela users
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user' CHECK(role IN ('user', 'admin')),
        segment_id INTEGER REFERENCES segments(id),
        status VARCHAR(50) DEFAULT 'ativo' CHECK(status IN ('ativo', 'inativo', 'bloqueado')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabela users criada');
    
    // Criar segmento padrão
    await db.query(`
      INSERT INTO segments (name, description)
      VALUES ('Geral', 'Segmento geral do sistema')
      ON CONFLICT DO NOTHING
    `);
    console.log('✅ Segmento padrão criado');
    
    // Criar usuário admin
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    await db.query(`
      INSERT INTO users (name, email, password, role, status)
      VALUES ('Admin ERP Pro', 'admin@erppro.com', $1, 'admin', 'ativo')
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    `, [hashedPassword]);
    
    console.log('✅ Usuário admin criado/atualizado');
    
    res.json({
      success: true,
      message: 'Banco inicializado com sucesso!',
      login: {
        email: 'admin@erppro.com',
        password: 'admin123'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router; 