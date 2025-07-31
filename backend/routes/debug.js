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

// POST /api/debug/run-remote-script
router.post('/run-remote-script', async (req, res) => {
  try {
    console.log('🚀 Executando script remoto...');
    
    const db = await getDatabase();
    
    // 1. Verificar conexão
    console.log('🔍 Testando conexão...');
    const connectionTest = await db.query('SELECT NOW() as current_time');
    console.log('✅ Conexão OK:', connectionTest.rows[0].current_time);
    
    // 2. Verificar se tabela users existe
    console.log('🔍 Verificando tabela users...');
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as table_exists
    `);
    
    if (!tableCheck.rows[0].table_exists) {
      console.log('❌ Tabela users não existe, inicializando banco...');
      
      // Inicializar banco de dados
      console.log('🔧 Criando tabelas...');
      
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
      
      // Criar tabela cost_centers
      await db.query(`
        CREATE TABLE IF NOT EXISTS cost_centers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          segment_id INTEGER REFERENCES segments(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela cost_centers criada');
      
      // Criar tabela customers
      await db.query(`
        CREATE TABLE IF NOT EXISTS customers (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          cpf VARCHAR(20),
          email VARCHAR(255),
          phone VARCHAR(20),
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(50),
          total_purchases DECIMAL(10,2) DEFAULT 0,
          last_purchase_date DATE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela customers criada');
      
      // Criar tabela products
      await db.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          stock INTEGER DEFAULT 0,
          min_stock INTEGER DEFAULT 0,
          price DECIMAL(10,2) NOT NULL,
          category VARCHAR(100),
          segment_id INTEGER REFERENCES segments(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela products criada');
      
      // Criar tabela transactions
      await db.query(`
        CREATE TABLE IF NOT EXISTS transactions (
          id SERIAL PRIMARY KEY,
          type VARCHAR(50) NOT NULL CHECK(type IN ('receita', 'despesa')),
          amount DECIMAL(10,2) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          segment_id INTEGER REFERENCES segments(id),
          cost_center_id INTEGER REFERENCES cost_centers(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabela transactions criada');
      
      console.log('✅ Banco de dados inicializado com sucesso!');
    }
    
    console.log('✅ Tabela users existe');
    
    // 3. Verificar se usuário admin existe
    console.log('🔍 Verificando usuário admin...');
    const userCheck = await db.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      ['admin@erppro.com']
    );
    
    if (userCheck.rows && userCheck.rows.length > 0) {
      console.log('👤 Usuário admin já existe:', userCheck.rows[0]);
      
      // Verificar se a senha está correta
      const passwordCheck = await db.query(
        'SELECT password FROM users WHERE email = $1',
        ['admin@erppro.com']
      );
      
      const isValidPassword = await bcrypt.compare('admin123', passwordCheck.rows[0].password);
      
      if (!isValidPassword) {
        console.log('🔧 Senha incorreta, atualizando...');
        const newHashedPassword = await bcrypt.hash('admin123', 10);
        await db.query(
          'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2',
          [newHashedPassword, 'admin@erppro.com']
        );
        console.log('✅ Senha atualizada');
      } else {
        console.log('✅ Senha está correta');
      }
      
      return res.json({
        success: true,
        message: 'Usuário admin já existe e foi verificado',
        user: userCheck.rows[0]
      });
    }
    
    // 4. Criar usuário admin
    console.log('🔧 Criando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const createResult = await db.query(`
      INSERT INTO users (name, email, password, role, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING id, email, role
    `, ['Admin', 'admin@erppro.com', hashedPassword, 'admin', 'active']);
    
    console.log('✅ Usuário admin criado:', createResult.rows[0]);
    
    // 5. Verificar/criar segmento padrão
    console.log('🔍 Verificando segmento padrão...');
    const segmentCheck = await db.query(
      'SELECT id, name FROM segments WHERE name = $1',
      ['Segmento Principal']
    );
    
    if (segmentCheck.rows.length === 0) {
      console.log('🔧 Criando segmento padrão...');
      await db.query(`
        INSERT INTO segments (name, description, created_at, updated_at)
        VALUES ($1, $2, NOW(), NOW())
      `, ['Segmento Principal', 'Segmento padrão do sistema']);
      console.log('✅ Segmento padrão criado');
    } else {
      console.log('✅ Segmento padrão já existe');
    }
    
    console.log('🎉 Script remoto executado com sucesso!');
    
    res.json({
      success: true,
      message: 'Script remoto executado com sucesso',
      user: createResult.rows[0],
      environment: process.env.NODE_ENV || 'development',
      render: !!process.env.RENDER
    });
    
  } catch (error) {
    console.error('❌ Erro ao executar script remoto:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router; 