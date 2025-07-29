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

// Import database
import { initProductionDatabase, getDatabase } from './database/prodConfig.js';

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

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { runScript } = req.query;
    
    if (runScript === 'create-admin') {
      console.log('🚀 Executando script de criação de usuário admin...');
      
      try {
        const db = await getDatabase();
        
        // Verificar se usuário admin existe
        const userCheck = await db.query(
          'SELECT id, email FROM users WHERE email = $1',
          ['admin@erppro.com']
        );
        
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
        
        // Criar usuário admin
        const bcrypt = await import('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
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