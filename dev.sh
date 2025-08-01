#!/bin/bash

echo "🚀 Iniciando Breno ERP - Desenvolvimento"
echo "📋 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:3001"
echo ""

# Parar processos existentes
echo "🛑 Parando processos existentes..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 2

# Iniciar desenvolvimento
echo "🎯 Iniciando frontend e backend simultaneamente..."
echo "📊 Logs em tempo real (Ctrl+C para parar):"
echo ""

npm run dev 