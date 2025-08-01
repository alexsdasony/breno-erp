#!/bin/bash

echo "🛑 Parando todos os serviços de desenvolvimento..."

# Parar processos do backend
echo "🔧 Parando backend..."
pkill -f "node.*server" 2>/dev/null || true

# Parar processos do frontend
echo "📋 Parando frontend..."
pkill -f "vite" 2>/dev/null || true

# Parar processos do concurrently
echo "⚡ Parando concurrently..."
pkill -f "concurrently" 2>/dev/null || true

# Aguardar um pouco
sleep 2

echo "✅ Todos os serviços parados!"
echo "🎯 Para iniciar novamente: npm run dev ou ./dev.sh" 