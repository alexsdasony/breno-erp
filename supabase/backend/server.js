import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar configuração do Supabase
import { testConnection } from './config/supabase.js';
import { CORS_CONFIG } from './config/constants.js';

// Importar rotas
import authRoutes from './routes/auth.js';
import transactionsRoutes from './routes/transactions.js';
import customersRoutes from './routes/customers.js';
import segmentsRoutes from './routes/segments.js';
import productsRoutes from './routes/products.js';
import salesRoutes from './routes/sales.js';
import billingsRoutes from './routes/billings.js';
import costCentersRoutes from './routes/cost-centers.js';
import accountsPayableRoutes from './routes/accounts-payable.js';
import nfeRoutes from './routes/nfe.js';
import integrationsRoutes from './routes/integrations.js';
import metricsRoutes from './routes/metrics.js';
import usersRoutes from './routes/users.js';
import receitaRoutes from './routes/receita.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carregar variáveis de ambiente do arquivo .env.local na raiz do projeto
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // 1000 requisições por janela
  message: {
    error: 'Muitas requisições deste IP, tente novamente mais tarde.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Middleware de segurança e otimização
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);

// Configuração CORS
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://breno-erp.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000'
    ];
    
    // Permitir requests sem origin (ex: Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'Supabase',
    version: '2.0.0'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/segments', segmentsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/billings', billingsRoutes);
app.use('/api/cost-centers', costCentersRoutes);
app.use('/api/accounts-payable', accountsPayableRoutes);
app.use('/api/nfe', nfeRoutes);
app.use('/api/integrations', integrationsRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/receita', receitaRoutes);

// Rota de fallback para API não encontrada
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    code: 'ENDPOINT_NOT_FOUND',
    path: req.originalUrl
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  if (error.message === 'Não permitido pelo CORS') {
    return res.status(403).json({
      error: 'Acesso negado pelo CORS',
      code: 'CORS_ERROR'
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado'
  });
});

// Função para iniciar o servidor
async function startServer() {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Testar conexão com Supabase
    console.log('🔗 Testando conexão com Supabase...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Falha na conexão com Supabase. Encerrando...');
      process.exit(1);
    }
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('✅ Servidor iniciado com sucesso!');
      console.log(`🌐 Porta: ${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄️  Banco: Supabase`);
      console.log(`🔗 CORS Origin: ${CORS_CONFIG.ORIGIN || 'http://localhost:5173'}`);
      console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
      console.log('🎉 Backend pronto para receber requisições!');
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de sinais para graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
startServer(); 