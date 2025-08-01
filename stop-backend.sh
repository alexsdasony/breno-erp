#!/bin/bash

echo "🛑 Parando Backend Supabase..."

# Parar processos do Node.js que estão rodando na porta 3001
echo "🔍 Procurando processos na porta 3001..."
pkill -f "node.*server.js" 2>/dev/null

# Verificar se ainda há processos rodando
if pgrep -f "node.*server.js" > /dev/null; then
    echo "⚠️  Forçando parada dos processos..."
    pkill -9 -f "node.*server.js" 2>/dev/null
fi

echo "✅ Backend parado com sucesso!" 