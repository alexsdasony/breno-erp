#!/bin/bash

echo "🧹 Reiniciando sistema ERP limpo..."

# Parar todos os processos
echo "🛑 Parando todos os processos..."
pkill -f "node server.js" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "npm.*dev" 2>/dev/null

# Aguardar processos terminarem
sleep 3

# Limpar cache
echo "📦 Limpando cache..."
npm cache clean --force 2>/dev/null
rm -rf node_modules/.vite 2>/dev/null
rm -rf .vite 2>/dev/null

# Verificar se as portas estão livres
echo "🔍 Verificando portas..."
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

sleep 2

# Iniciar backend
echo "🚀 Iniciando backend..."
cd supabase/backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Aguardar backend inicializar
echo "⏳ Aguardando backend inicializar..."
sleep 8

# Verificar se backend está rodando
echo "🔍 Testando backend..."
if curl -s http://localhost:3001/api/dashboard > /dev/null 2>&1; then
    echo "✅ Backend funcionando!"
else
    echo "❌ Backend não iniciou corretamente"
    echo "📋 Log do backend:"
    cat backend.log
    exit 1
fi

# Iniciar frontend
echo "🌐 Iniciando frontend..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Aguardar frontend inicializar
sleep 3

# Verificar se frontend está rodando
if curl -s -I http://localhost:5173 > /dev/null; then
    echo "✅ Frontend funcionando!"
else
    echo "❌ Frontend não iniciou corretamente"
    exit 1
fi

echo ""
echo "🎉 Sistema ERP reiniciado com sucesso!"
echo "📊 Backend: http://localhost:3001"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "💡 Para acessar: http://localhost:5173"
echo "💡 Para parar: ./stop-erp.sh"
echo "💡 Para limpar cache do navegador: Ctrl+Shift+R"

# Manter script rodando
wait $BACKEND_PID $FRONTEND_PID 