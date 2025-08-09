# 📋 GUIA DE CONSTANTS - BRENO ERP

## 🎯 **OBJETIVO**
Centralizar todas as variáveis de ambiente em arquivos de constants organizados, eliminando a confusão e facilitando a manutenção.

## 📁 **ESTRUTURA DOS ARQUIVOS**

### Frontend Constants
```
src/config/constants.js
```

### Backend Constants  
```
supabase/backend/config/constants.js
```

## 🔧 **CONFIGURAÇÕES ORGANIZADAS**

### 1. **SUPABASE_CONFIG**
```javascript
export const SUPABASE_CONFIG = {
  URL: 'https://qerubjitetqwfqqydhzv.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  SERVICE_ROLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  USER_PASSWORD: 'C0ntr0l3t0t@l#'
};
```

### 2. **DATABASE_CONFIG**
```javascript
export const DATABASE_CONFIG = {
  URL: 'postgresql://postgres:C0ntr0l3t0t@l#@db.qerubjitetqwfqqydhzv.supabase.co:5432/postgres',
  URL_POOLER: 'postgresql://postgres.qerubjitetqwfqqydhzv:C0ntr0l3t0t@l#@aws-0-sa-east-1.pooler.supabase.com:6543/postgres',
  URL_LEGACY: 'postgresql://breno_erp_user:aHQO5rzBcecx5bRm2Xt53UQPxS49OXLj@dpg-d1fs2rali9vc739tpac0-a.oregon-postgres.render.com/breno_erp'
};
```

### 3. **API_CONFIG**
```javascript
export const API_CONFIG = {
  LEGACY_URL: 'https://breno-erp-backend.onrender.com/api',
  LOCAL_URL: 'http://localhost:3001/api',
  PRODUCTION_URL: 'https://breno-erp.vercel.app/api'
};
```

### 4. **SECURITY_CONFIG**
```javascript
export const SECURITY_CONFIG = {
  JWT_SECRET: 'f3696dd52f7674b95e4606c46a6e69065b65600544b4129ba7b09538476f06fa600fcc77ebe4c610026a24bfc95c4ce4cad1e353a4a9246562c1d90e35f01a1d'
};
```

### 5. **CORS_CONFIG**
```javascript
export const CORS_CONFIG = {
  ORIGIN: 'https://breno-erp.vercel.app',
  LOCAL_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:3001'
  ]
};
```

### 6. **ENV_CONFIG**
```javascript
export const ENV_CONFIG = {
  NODE_ENV: 'development',
  PORT: 3001,
  FRONTEND_PORT: 5173
};
```

## 🔄 **COMO USAR**

### No Frontend
```javascript
import { SUPABASE_CONFIG, SECURITY_CONFIG } from '../config/constants.js';

const supabaseUrl = SUPABASE_CONFIG.URL;
const jwtSecret = SECURITY_CONFIG.JWT_SECRET;
```

### No Backend
```javascript
import { DATABASE_CONFIG, CORS_CONFIG } from './config/constants.js';

const connectionString = DATABASE_CONFIG.URL;
const corsOrigin = CORS_CONFIG.ORIGIN;
```

## ✅ **ARQUIVOS ATUALIZADOS**

### Frontend
- ✅ `src/lib/supabase.js` - Usando SUPABASE_CONFIG e SECURITY_CONFIG

### Backend
- ✅ `supabase/backend/config/supabase.js` - Usando SUPABASE_CONFIG
- ✅ `supabase/backend/database/prodConfig.js` - Usando DATABASE_CONFIG
- ✅ `supabase/backend/database/supabaseConfig.js` - Usando SUPABASE_CONFIG
- ✅ `supabase/backend/middleware/auth.js` - Usando SECURITY_CONFIG
- ✅ `supabase/backend/routes/auth.js` - Usando SECURITY_CONFIG
- ✅ `supabase/backend/server.js` - Usando CORS_CONFIG

### Scripts e Testes
- ✅ `test-reports.js` - Usando DATABASE_CONFIG
- ✅ `test-dre-simple.js` - Usando DATABASE_CONFIG
- ✅ `test-dre-joins.js` - Usando DATABASE_CONFIG
- ✅ `update-customers-remote.js` - Usando DATABASE_CONFIG
- ✅ `fix-sequence-definitive.js` - Usando SECURITY_CONFIG

## 🎉 **BENEFÍCIOS**

1. **🔧 Manutenção Centralizada**: Todas as configurações em um só lugar
2. **🚫 Sem Confusão**: Não há mais variáveis de ambiente espalhadas
3. **📝 Documentação Clara**: Cada configuração tem comentários explicativos
4. **🔄 Fácil Atualização**: Mudar uma configuração atualiza todo o projeto
5. **🛡️ Segurança**: Hardcoded para evitar vazamentos de .env

## ⚠️ **IMPORTANTE**

- **NÃO** use mais `process.env.VITE_SUPABASE_URL` ou `process.env.JWT_SECRET`
- **SEMPRE** importe das constants: `import { SUPABASE_CONFIG } from './config/constants.js'`
- **MANTENHA** os arquivos de constants sincronizados entre frontend e backend 