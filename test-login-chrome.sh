#!/bin/bash

echo "🧪 Iniciando testes E2E de login no Chrome..."
echo "🔍 Browser será aberto para visualização..."

# Parar processos existentes
echo "🛑 Parando processos existentes..."
pkill -f "node.*server" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Aguardar um pouco
sleep 2

# Executar testes apenas no Chrome
echo "🚀 Executando testes no Chrome..."
npx playwright test --project=chromium --headed

echo "✅ Testes concluídos!" 