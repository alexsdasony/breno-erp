#!/bin/bash

# 🚀 ERP Horizons - Simple Starter
# Versão simples - apenas inicia backend e frontend

echo "🚀 Iniciando ERP Horizons..."

# Parar processo ao receber Ctrl+C
trap 'echo "Parando serviços..."; pkill -f "node.*server.js"; pkill -f "vite"; exit 0' SIGINT SIGTERM

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo "❌ Execute este script no diretório raiz do projeto!"
    exit 1
fi

# Criar arquivos de configuração se não existirem
if [ ! -f "supabase/backend/.env" ]; then
  echo "Criando supabase/backend/.env..."
  cat > supabase/backend/.env << 'EOF'
PORT=3001
NODE_ENV=development
DB_PATH=./database/horizons.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789abcdef
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
fi

if [ ! -f ".env.local" ]; then
    echo "Criando .env.local..."
    echo "VITE_API_URL=http://localhost:3001/api" > .env.local
fi

# Parar processos existentes nas portas
lsof -ti :3001 | xargs kill -9 2>/dev/null || true
lsof -ti :5173 | xargs kill -9 2>/dev/null || true

echo "🔧 Iniciando backend..."
cd supabase/backend && npm start &
BACKEND_PID=$!
cd ..

echo "🎨 Iniciando frontend..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Serviços iniciados!"
echo "📊 Backend:  http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "Pressione Ctrl+C para parar ambos os serviços"

# Aguardar sinais
wait 