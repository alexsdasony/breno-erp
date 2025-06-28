#!/bin/bash

# 🛑 ERP Horizons - Stop Script
# Para todos os serviços relacionados ao ERP

echo "🛑 Parando ERP Horizons..."

# Função para matar processos por porta
kill_by_port() {
    local port=$1
    local service=$2
    
    local pids=$(lsof -ti :$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🔴 Parando $service (porta $port)..."
        echo $pids | xargs kill -9 2>/dev/null
        echo "✅ $service parado"
    else
        echo "✅ $service já estava parado"
    fi
}

# Parar por porta
kill_by_port 3001 "Backend"
kill_by_port 5173 "Frontend"

# Parar por nome do processo (backup)
echo "🧹 Limpando processos restantes..."

# Parar Node.js do backend
pkill -f "node.*server.js" 2>/dev/null && echo "✅ Processos backend parados" || true

# Parar Vite do frontend  
pkill -f "vite" 2>/dev/null && echo "✅ Processos frontend parados" || true

# Parar nodemon se estiver rodando
pkill -f "nodemon" 2>/dev/null && echo "✅ Nodemon parado" || true

echo ""
echo "🎉 Todos os serviços do ERP foram parados!"
echo ""

# Verificar se ainda há processos nas portas
if lsof -i :3001 >/dev/null 2>&1; then
    echo "⚠️  Ainda há algo rodando na porta 3001"
    lsof -i :3001
else
    echo "✅ Porta 3001 livre"
fi

if lsof -i :5173 >/dev/null 2>&1; then
    echo "⚠️  Ainda há algo rodando na porta 5173"
    lsof -i :5173
else
    echo "✅ Porta 5173 livre"
fi 