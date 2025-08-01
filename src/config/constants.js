// ============================================================================
// CONSTANTS - BRENO ERP
// ============================================================================
// Todas as variáveis de ambiente centralizadas em um só lugar
// ============================================================================

// ============================================================================
// SUPABASE CONFIGURATION
// ============================================================================
export const SUPABASE_CONFIG = {
  // Supabase URL e chaves
  URL: 'https://qerubjitetqwfqqydhzv.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwMDU5NDUsImV4cCI6MjA2OTU4MTk0NX0.eP6QxQI1oerd5HxPxYpHF8mhKLK6bwnuIyw_aKFjuwU',
  SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlcnViaml0ZXRxd2ZxcXlkaHp2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDAwNTk0NSwiZXhwIjoyMDY5NTgxOTQ1fQ.hBfdao-iJX4KvjMQ7LzcmBf4PXtbcMrat9IGr2asfDc',
  
  // Senha do usuário Supabase
  USER_PASSWORD: 'C0ntr0l3t0t@l#'
};

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================
export const DATABASE_CONFIG = {
  // Conexão direta com PostgreSQL
  URL: 'postgresql://postgres:C0ntr0l3t0t@l#@db.qerubjitetqwfqqydhzv.supabase.co:5432/postgres',
  
  // Conexão com pooler (para serverless)
  URL_POOLER: 'postgresql://postgres.qerubjitetqwfqqydhzv:C0ntr0l3t0t@l#@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
  
  // Conexão legacy (Render - para compatibilidade)
  URL_LEGACY: 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp'
};

// ============================================================================
// API CONFIGURATION
// ============================================================================
export const API_CONFIG = {
  // URL da API legacy (para compatibilidade durante migração)
  LEGACY_URL: 'https://breno-erp-backend.onrender.com/api',
  
  // URL da API local
  LOCAL_URL: 'http://localhost:3001/api',
  
  // URL da API de produção
  PRODUCTION_URL: 'https://breno-erp.vercel.app/api'
};

// ============================================================================
// SECURITY CONFIGURATION
// ============================================================================
export const SECURITY_CONFIG = {
  // JWT Secret para autenticação
  JWT_SECRET: 'f3696dd52f7674b95e4606c46a6e69065b65600544b4129ba7b09538476f06fa600fcc77ebe4c610026a24bfc95c4ce4cad1e353a4a9246562c1d90e35f01a1d'
};

// ============================================================================
// CORS CONFIGURATION
// ============================================================================
export const CORS_CONFIG = {
  // Origem permitida para CORS
  ORIGIN: 'https://breno-erp.vercel.app',
  
  // Origens locais para desenvolvimento
  LOCAL_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
  ]
};

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================
export const ENV_CONFIG = {
  // Ambiente atual
  NODE_ENV: 'development',
  
  // Porta do servidor
  PORT: 3001,
  
  // Porta do frontend
  FRONTEND_PORT: 5173
};

// ============================================================================
// EXPORT ALL CONFIGURATIONS
// ============================================================================
export default {
  SUPABASE: SUPABASE_CONFIG,
  DATABASE: DATABASE_CONFIG,
  API: API_CONFIG,
  SECURITY: SECURITY_CONFIG,
  CORS: CORS_CONFIG,
  ENV: ENV_CONFIG
}; 