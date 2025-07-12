#!/bin/bash

echo "🔧 Iniciando backend do ERP Pro..."

# Verificar se estamos no diretório correto
if [ ! -d "backend" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto"
    exit 1
fi

# Parar processos existentes
echo "🔄 Parando processos existentes..."
pkill -f "node server.js" 2>/dev/null
sleep 2

# Iniciar backend
echo "🚀 Iniciando backend..."
cd backend
node server.js 