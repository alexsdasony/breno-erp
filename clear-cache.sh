#!/bin/bash

echo "🧹 Limpando cache e reiniciando serviços..."

# Parar todos os processos
echo "🛑 Parando processos..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null

# Aguardar um pouco
sleep 2

# Limpar cache do npm
echo "📦 Limpando cache do npm..."
npm cache clean --force

# Limpar cache do Vite
echo "⚡ Limpando cache do Vite..."
rm -rf node_modules/.vite 2>/dev/null
rm -rf .vite 2>/dev/null

# Reinstalar dependências do frontend
echo "📦 Reinstalando dependências do frontend..."
npm install

# Iniciar backend
echo "🚀 Iniciando backend..."
cd backend && npm start &
BACKEND_PID=$!

# Aguardar backend inicializar
sleep 3

# Iniciar frontend
echo "🌐 Iniciando frontend..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo "✅ Serviços iniciados!"
echo "📊 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "💡 Para parar os serviços, execute: ./stop-erp.sh"
echo "💡 Para limpar cache do navegador, pressione Ctrl+Shift+R"

# Aguardar processos
wait $BACKEND_PID $FRONTEND_PID 