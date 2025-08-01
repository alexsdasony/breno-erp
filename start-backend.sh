#!/bin/bash

echo "🚀 Iniciando Backend Supabase..."

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js primeiro."
    exit 1
fi

# Verificar se o arquivo .env.local existe
if [ ! -f ".env.local" ]; then
    echo "❌ Arquivo .env.local não encontrado!"
    echo "📝 Crie o arquivo .env.local com as configurações do Supabase"
    exit 1
fi

# Navegar para o diretório do backend
cd supabase/backend

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Iniciar o servidor
echo "🎯 Iniciando servidor na porta 3001..."
echo "📊 Health Check: http://localhost:3001/api/health"
echo "🔗 Frontend: http://localhost:5173"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

node server.js 