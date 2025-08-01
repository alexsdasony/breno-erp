import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import transactionsRoutes from './routes/transactions.js';
import productsRoutes from './routes/products.js';
import salesRoutes from './routes/sales.js';
import customersRoutes from './routes/customers.js';
import billingsRoutes from './routes/billings.js';
import accountsPayableRoutes from './routes/accountsPayable.js';
import nfeRoutes from './routes/nfe.js';
import costCentersRoutes from './routes/costCenters.js';
import segmentsRoutes from './routes/segments.js';
import integrationsRoutes from './routes/integrations.js';
import metricsRoutes from './routes/metrics.js';
import chartOfAccountsRoutes from './routes/chartOfAccounts.js';
import costCenterAccountsRoutes from './routes/costCenterAccounts.js';
import reportsRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';
import debugRoutes from './routes/debug.js'; // TEMPORÁRIO
import receitaRoutes from './routes/receita.js';
import setupRoutes from './setup-endpoint.js';
import fixAdminRoutes from './fix-admin.js';

// Import database
import { initProductionDatabase, getDatabase } from './database/supabaseConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased from 100 to 1000 requests per windowMs for development
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);

// Enhanced CORS configuration with debug
const corsOptions = {
  origin: function (origin, callback) {
    // Lista de origens permitidas
    const allowedOrigins = [
      'https://breno-erp.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000'
    ];
    
    // Se CORS_ORIGIN está definido, usar ele em vez da lista
    if (process.env.CORS_ORIGIN) {
      allowedOrigins.push(process.env.CORS_ORIGIN);
    }
    
    // Permitir requests sem origin (ex: Postman, curl)
    if (!origin) return callback(null, true);
    
    // Debug: log da origem (reduzido drasticamente para evitar quota excedida)
    if (process.env.NODE_ENV === 'development' && Math.random() < 0.001) {
      console.log(`🌐 CORS Request from origin: ${origin}`);
    }
    
    if (allowedOrigins.includes(origin)) {
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.001) {
        console.log(`✅ CORS Allowed: ${origin}`);
      }
      callback(null, true);
    } else {
      if (process.env.NODE_ENV === 'development' && Math.random() < 0.001) {
        console.log(`❌ CORS Blocked: ${origin}`);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/billings', billingsRoutes);
app.use('/api/accounts-payable', accountsPayableRoutes);
app.use('/api/nfe', nfeRoutes);
app.use('/api/cost-centers', costCentersRoutes);
app.use('/api/segments', segmentsRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/chart-of-accounts', chartOfAccountsRoutes);
app.use('/api/cost-center-accounts', costCenterAccountsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/debug', debugRoutes); // TEMPORÁRIO
app.use('/api/receita', receitaRoutes);
app.use('/api', setupRoutes);
app.use('/api', fixAdminRoutes);

// Initialize database endpoint
app.post('/api/init-database', async (req, res) => {
  try {
    console.log('🚀 Inicializando banco de dados PostgreSQL...');
    
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
    
    // Criar segmento padrão
    const segmentResult = await db.query(`
      INSERT INTO segments (name, description)
      VALUES ('Geral', 'Segmento geral do sistema')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    console.log('✅ Segmento padrão criado');
    
    // Criar usuário admin
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminResult = await db.query(`
      INSERT INTO users (name, email, password, role, status)
      VALUES ('Admin ERP Pro', 'admin@erppro.com', $1, 'admin', 'ativo')
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, role
    `, [hashedPassword]);
    
    console.log('✅ Usuário admin criado/atualizado');
    
    res.json({
      success: true,
      message: 'Banco de dados inicializado com sucesso',
      admin: adminResult.rows[0],
      segment: segmentResult.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple admin creation endpoint
app.post('/api/create-admin', async (req, res) => {
  try {
    console.log('🚀 Criando usuário admin...');
    
    const db = await getDatabase();
    
    // Verificar se usuário admin existe
    const userCheck = await db.query(
      'SELECT id, email FROM users WHERE email = $1',
      ['admin@erppro.com']
    );
    
    if (userCheck.rows && userCheck.rows.length > 0) {
      console.log('👤 Usuário admin já existe');
      return res.json({
        success: true,
        message: 'Usuário admin já existe',
        user: userCheck.rows[0]
      });
    }
    
    // Criar usuário admin
    const bcrypt = await import('bcryptjs');
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

// Simple database initialization endpoint
app.post('/api/init-db', async (req, res) => {
  try {
    console.log('🚀 Inicializando banco de dados...');
    
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
    const segmentResult = await db.query(`
      INSERT INTO segments (name, description)
      VALUES ('Geral', 'Segmento geral do sistema')
      ON CONFLICT DO NOTHING
      RETURNING id
    `);
    console.log('✅ Segmento padrão criado');
    
    // Criar usuário admin
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminResult = await db.query(`
      INSERT INTO users (name, email, password, role, status)
      VALUES ('Admin ERP Pro', 'admin@erppro.com', $1, 'admin', 'ativo')
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, role
    `, [hashedPassword]);
    
    console.log('✅ Usuário admin criado/atualizado');
    
    res.json({
      success: true,
      message: 'Banco de dados inicializado com sucesso',
      admin: adminResult.rows[0],
      segment: segmentResult.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple endpoint to initialize database
app.get('/api/setup', async (req, res) => {
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
    const bcrypt = await import('bcryptjs');
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

// Simple fix endpoint
app.post('/api/fix-db', async (req, res) => {
  try {
    console.log('🔧 Corrigindo banco de dados...');
    
    const db = await getDatabase();
    
    // Verificar se tabela users existe
    const tableCheck = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as table_exists
    `);
    
    if (!tableCheck.rows[0].table_exists) {
      console.log('❌ Tabela users não existe - Inicializando...');
      
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
      
      console.log('✅ Banco inicializado com sucesso!');
    }
    
    // Criar usuário admin
    console.log('🔧 Criando usuário admin...');
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminResult = await db.query(`
      INSERT INTO users (name, email, password, role, status)
      VALUES ('Admin ERP Pro', 'admin@erppro.com', $1, 'admin', 'ativo')
      ON CONFLICT (email) DO UPDATE SET
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, email, role
    `, [hashedPassword]);
    
    console.log('✅ Usuário admin criado/atualizado');
    
    res.json({
      success: true,
      message: 'Banco corrigido com sucesso',
      admin: adminResult.rows[0]
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir banco:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { runScript } = req.query;
    console.log('🔍 Health check chamado com query:', req.query);
    
    if (runScript === 'create-admin') {
      console.log('🚀 Executando script de criação de usuário admin...');
      
      try {
        const db = await getDatabase();
        console.log('📊 Conexão com banco estabelecida');
        
        // Verificar se tabela users existe
        console.log('🔍 Verificando se tabela users existe...');
        const tableCheck = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'users'
          ) as table_exists
        `);
        
        if (!tableCheck.rows[0].table_exists) {
          console.log('❌ Tabela users não existe - Inicializando banco...');
          
          try {
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
            
            console.log('✅ Banco inicializado com sucesso!');
          } catch (initError) {
            console.error('❌ Erro ao inicializar banco:', initError);
            return res.status(500).json({
              status: 'ERROR',
              error: `Erro ao inicializar banco: ${initError.message}`,
              timestamp: new Date().toISOString()
            });
          }
        }
        
        // Verificar se usuário admin existe
        console.log('🔍 Verificando se usuário admin existe...');
        const userCheck = await db.query(
          'SELECT id, email FROM users WHERE email = $1',
          ['admin@erppro.com']
        );
        
        console.log('📋 Resultado da verificação:', userCheck);
        
        if (userCheck.rows && userCheck.rows.length > 0) {
          console.log('👤 Usuário admin já existe');
          return res.json({
            status: 'OK',
            message: 'Usuário admin já existe',
            user: userCheck.rows[0],
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
          });
        }
        
        console.log('🔧 Criando usuário admin...');
        // Criar usuário admin
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.default.hash('admin123', 10);
        console.log('🔐 Senha hash criada');
        
        const result = await db.query(`
          INSERT INTO users (name, email, password, role, status, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
          RETURNING id, email, role
        `, ['Admin', 'admin@erppro.com', hashedPassword, 'admin', 'active']);
        
        console.log('✅ Usuário admin criado:', result.rows[0]);
        
        return res.json({
          status: 'OK',
          message: 'Usuário admin criado com sucesso',
          user: result.rows[0],
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });
      } catch (dbError) {
        console.error('❌ Erro no banco:', dbError);
        return res.status(500).json({
          status: 'ERROR',
          error: dbError.message,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    if (runScript === 'init-database') {
      console.log('🚀 Inicializando banco de dados PostgreSQL...');
      
      try {
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
        
        // Criar segmento padrão
        const segmentResult = await db.query(`
          INSERT INTO segments (name, description)
          VALUES ('Geral', 'Segmento geral do sistema')
          ON CONFLICT DO NOTHING
          RETURNING id
        `);
        console.log('✅ Segmento padrão criado');
        
        // Criar usuário admin
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 12);
        
        const adminResult = await db.query(`
          INSERT INTO users (name, email, password, role, status)
          VALUES ('Admin ERP Pro', 'admin@erppro.com', $1, 'admin', 'ativo')
          ON CONFLICT (email) DO UPDATE SET
            password = EXCLUDED.password,
            role = EXCLUDED.role,
            status = EXCLUDED.status,
            updated_at = CURRENT_TIMESTAMP
          RETURNING id, email, role
        `, [hashedPassword]);
        
        console.log('✅ Usuário admin criado/atualizado');
        
        return res.json({
          status: 'OK',
          message: 'Banco de dados inicializado com sucesso',
          admin: adminResult.rows[0],
          segment: segmentResult.rows[0],
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });
        
      } catch (error) {
        console.error('❌ Erro ao inicializar banco:', error);
        return res.json({
          status: 'ERROR',
          error: error.message,
          timestamp: new Date().toISOString(),
          uptime: process.uptime()
        });
      }
    }
    
    console.log('📊 Health check normal');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  } catch (error) {
    console.error('❌ Erro no health check:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initProductionDatabase();
    console.log('✅ SQLite database initialized');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: SQLite (Local)`);
      console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 