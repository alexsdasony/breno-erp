#!/bin/bash

echo "🛑 Parando ERP Pro..."

# Parar processos do backend
echo "🔧 Parando backend..."
pkill -f "node server.js" 2>/dev/null

# Parar processos do frontend
echo "🎨 Parando frontend..."
pkill -f "vite" 2>/dev/null
pkill -f "npm run dev" 2>/dev/null

# Parar processos Node.js relacionados
echo "🧹 Limpando processos Node.js..."
pkill -f "node.*server.js" 2>/dev/null

# Aguardar um pouco
sleep 2

# Verificar se as portas estão livres
echo "🔍 Verificando portas..."
if lsof -i :3001 >/dev/null 2>&1; then
    echo "❌ Porta 3001 ainda em uso"
    lsof -ti :3001 | xargs kill -9 2>/dev/null
else
    echo "✅ Porta 3001 livre"
fi

if lsof -i :5173 >/dev/null 2>&1; then
    echo "❌ Porta 5173 ainda em uso"
    lsof -ti :5173 | xargs kill -9 2>/dev/null
else
    echo "✅ Porta 5173 livre"
fi

echo "✅ Todos os serviços do ERP foram parados!" 