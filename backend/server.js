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

// Import database
import { initDatabase } from './database/init.js';
import { initProductionDatabase } from './database/prodConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
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
    console.log('🔍 [server] NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 [server] DATABASE_URL existe:', !!process.env.DATABASE_URL);
    
    if (process.env.NODE_ENV === 'production') {
      console.log('⚡ [server] Inicializando PostgreSQL...');
      await initProductionDatabase();
      console.log('🔥 Production mode: PostgreSQL database');
    } else {
      console.log('⚡ [server] Inicializando SQLite...');
      await initDatabase();
      console.log('🛠️  Development mode: SQLite database');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: ${process.env.NODE_ENV === 'production' ? 'PostgreSQL' : 'SQLite'}`);
      console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 