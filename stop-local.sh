#!/bin/bash

echo "🛑 PARANDO AMBIENTE LOCAL"
echo "========================="

# Parar backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "🔧 Parando Backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null || echo "   Backend já parado"
    rm .backend.pid
else
    echo "🔧 Parando Backend..."
    pkill -f "node server.js" 2>/dev/null || echo "   Backend não encontrado"
fi

# Parar frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "🌐 Parando Frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null || echo "   Frontend já parado"
    rm .frontend.pid
else
    echo "🌐 Parando Frontend..."
    pkill -f "vite" 2>/dev/null || echo "   Frontend não encontrado"
fi

# Limpar logs
echo "🧹 Limpando logs..."
rm -f backend.log frontend.log

echo ""
echo "✅ AMBIENTE LOCAL PARADO!"
echo "=========================" 