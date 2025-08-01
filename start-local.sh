#!/bin/bash

echo "🚀 INICIANDO AMBIENTE LOCAL COMPLETO"
echo "=================================="

# Função para verificar se uma porta está em uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Porta $port já está em uso!"
        return 1
    else
        echo "✅ Porta $port disponível"
        return 0
    fi
}

# Verificar portas
echo "🔍 Verificando portas..."
check_port 3001 || echo "   Backend pode estar rodando"
check_port 5173 || echo "   Frontend pode estar rodando"

echo ""
echo "📦 Iniciando Backend (Porta 3001)..."
cd supabase/backend
if [ ! -f .env ]; then
    echo "⚠️  Arquivo .env não encontrado no backend, copiando..."
    cp ../.env.local .env
fi

# Iniciar backend em background
nohup node server.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend iniciado com PID: $BACKEND_PID"

cd ..

echo ""
echo "🌐 Iniciando Frontend (Porta 5173)..."
# Iniciar frontend em background
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend iniciado com PID: $FRONTEND_PID"

echo ""
echo "⏳ Aguardando serviços iniciarem..."
sleep 5

echo ""
echo "🧪 Testando serviços..."

# Testar backend
echo "🔧 Testando Backend..."
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "   ✅ Backend funcionando!"
else
    echo "   ❌ Backend não respondeu"
fi

# Testar frontend
echo "🎨 Testando Frontend..."
if curl -s http://localhost:5173 > /dev/null; then
    echo "   ✅ Frontend funcionando!"
else
    echo "   ❌ Frontend não respondeu"
fi

echo ""
echo "🎉 AMBIENTE LOCAL INICIADO!"
echo "=========================="
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3001"
echo "📊 Health:   http://localhost:3001/api/health"
echo ""
echo "📝 Logs:"
echo "   Backend:  tail -f backend.log"
echo "   Frontend: tail -f frontend.log"
echo ""
echo "🛑 Para parar: ./stop-local.sh"
echo ""

# Salvar PIDs para parar depois
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid 