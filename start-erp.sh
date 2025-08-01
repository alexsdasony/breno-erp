#!/bin/bash

echo "🚀 Iniciando ERP Pro..."

# Função para matar processos existentes
kill_existing_processes() {
    echo "🔄 Parando processos existentes..."
    pkill -f "node server.js" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    pkill -f "npm run dev" 2>/dev/null
        sleep 2
}

# Função para iniciar o backend
start_backend() {
    echo "🔧 Iniciando backend..."
    cd supabase/backend
    node server.js &
    BACKEND_PID=$!
    echo "✅ Backend iniciado (PID: $BACKEND_PID)"
    cd ..
}

# Função para iniciar o frontend
start_frontend() {
    echo "🎨 Iniciando frontend..."
    npm run dev &
    FRONTEND_PID=$!
    echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
}

# Função para verificar se os serviços estão rodando
check_services() {
    echo "🔍 Verificando serviços..."
    sleep 3
    
    if lsof -i :3001 >/dev/null 2>&1; then
        echo "✅ Backend rodando na porta 3001"
    else
        echo "❌ Backend não está rodando"
    fi
    
    if lsof -i :5173 >/dev/null 2>&1; then
        echo "✅ Frontend rodando na porta 5173"
    else
        echo "❌ Frontend não está rodando"
    fi
}

# Função para mostrar instruções
show_instructions() {
    echo ""
    echo "🎉 ERP Pro iniciado com sucesso!"
    echo ""
    echo "📱 Acesse: http://localhost:5173"
    echo "🔧 Backend: http://localhost:3001"
    echo ""
    echo "💡 Para parar os serviços, pressione Ctrl+C"
    echo ""
}

# Função para limpeza ao sair
cleanup() {
    echo ""
    echo "🛑 Parando serviços..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "node server.js" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    echo "✅ Serviços parados"
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

# Executar sequência de inicialização
kill_existing_processes
start_backend
start_frontend
check_services
show_instructions

# Manter script rodando
echo "⏳ Mantendo serviços ativos..."
wait 