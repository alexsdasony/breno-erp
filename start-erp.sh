#!/bin/bash

# 🚀 ERP Horizons - Starter Script
# Executa backend e frontend simultaneamente

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art
echo -e "${CYAN}"
echo "██╗  ██╗ ██████╗ ██████╗ ██╗███████╗ ██████╗ ███╗   ██╗███████╗"
echo "██║  ██║██╔═══██╗██╔══██╗██║╚══███╔╝██╔═══██╗████╗  ██║██╔════╝"
echo "███████║██║   ██║██████╔╝██║  ███╔╝ ██║   ██║██╔██╗ ██║███████╗"
echo "██╔══██║██║   ██║██╔══██╗██║ ███╔╝  ██║   ██║██║╚██╗██║╚════██║"
echo "██║  ██║╚██████╔╝██║  ██║██║███████╗╚██████╔╝██║ ╚████║███████║"
echo "╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝"
echo -e "${NC}"
echo -e "${PURPLE}🚀 Sistema ERP - Iniciando Ambientes...${NC}\n"

# Função para cleanup ao sair
cleanup() {
    echo -e "\n${YELLOW}🛑 Parando serviços...${NC}"
    
    # Mata processo do backend
    if [ ! -z "$BACKEND_PID" ]; then
        echo -e "${RED}Parando backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    # Mata processo do frontend
    if [ ! -z "$FRONTEND_PID" ]; then
        echo -e "${RED}Parando frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Mata processos Node.js relacionados se necessário
    pkill -f "node.*server.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    
    echo -e "${GREEN}✅ Todos os serviços foram parados!${NC}"
    exit 0
}

# Trap para cleanup ao receber sinais
trap cleanup SIGINT SIGTERM

# Função para verificar se porta está em uso
check_port() {
    local port=$1
    local service=$2
    
    if lsof -i :$port >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Porta $port já está em uso ($service)${NC}"
        echo -e "${BLUE}Tentando parar processo existente...${NC}"
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
    echo -e "${RED}❌ Erro: Execute este script no diretório raiz do projeto Horizons${NC}"
    echo -e "${BLUE}Certifique-se de estar em /Applications/MAMP/htdocs/horizons${NC}"
    exit 1
fi

# Verificar dependências do Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não está instalado!${NC}"
    echo -e "${BLUE}Instale o Node.js em: https://nodejs.org${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não está instalado!${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Verificando ambiente...${NC}"

# Verificar se dependências estão instaladas
echo -e "${CYAN}🔍 Verificando dependências do backend...${NC}"
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
    cd backend
    npm install
    cd ..
fi

echo -e "${CYAN}🔍 Verificando dependências do frontend...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do frontend...${NC}"
    npm install
fi

# Verificar arquivos de configuração
echo -e "${CYAN}⚙️  Verificando configurações...${NC}"

# Verificar .env do backend
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo backend/.env não encontrado. Criando...${NC}"
    cat > backend/.env << 'EOF'
PORT=3001
NODE_ENV=development
DB_PATH=./database/horizons.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789abcdef
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF
    echo -e "${GREEN}✅ Arquivo backend/.env criado${NC}"
fi

# Verificar .env.local do frontend
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env.local não encontrado. Criando...${NC}"
    echo "VITE_API_URL=http://localhost:3001/api" > .env.local
    echo -e "${GREEN}✅ Arquivo .env.local criado${NC}"
fi

# Verificar se as portas estão livres
check_port 3001 "Backend"
check_port 5173 "Frontend"

echo -e "\n${GREEN}🚀 Iniciando serviços...${NC}\n"

# Criar diretório de logs se não existir
mkdir -p logs

# Iniciar backend
echo -e "${BLUE}🔧 Iniciando Backend (Node.js + Express + SQLite)...${NC}"
cd backend
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID) - http://localhost:3001${NC}"

# Aguardar backend estar pronto
echo -e "${CYAN}⏳ Aguardando backend inicializar...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3001/api/auth/register >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend está respondendo!${NC}"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Backend demorou muito para iniciar. Verifique os logs:${NC}"
        echo -e "${BLUE}tail -f logs/backend.log${NC}"
        cleanup
        exit 1
    fi
    
    printf "."
    sleep 1
done

# Iniciar frontend
echo -e "\n${BLUE}🎨 Iniciando Frontend (React + Vite)...${NC}"
npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID) - http://localhost:5173${NC}"

# Aguardar frontend estar pronto
echo -e "${CYAN}⏳ Aguardando frontend inicializar...${NC}"
for i in {1..20}; do
    if curl -s http://localhost:5173 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend está respondendo!${NC}"
        break
    fi
    
    if [ $i -eq 20 ]; then
        echo -e "${YELLOW}⚠️  Frontend demorou para responder, mas pode estar iniciando...${NC}"
        break
    fi
    
    printf "."
    sleep 1
done

# Mostrar status final
echo -e "\n${PURPLE}════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 ERP HORIZONS INICIADO COM SUCESSO! 🎉${NC}"
echo -e "${PURPLE}════════════════════════════════════════${NC}"
echo -e "${CYAN}📊 Backend API:${NC}  http://localhost:3001"
echo -e "${CYAN}🌐 Frontend:${NC}     http://localhost:5173"
echo -e "${CYAN}📁 Logs:${NC}        logs/backend.log | logs/frontend.log"
echo -e "${PURPLE}════════════════════════════════════════${NC}"

# Mostrar comandos úteis
echo -e "\n${YELLOW}📋 Comandos úteis:${NC}"
echo -e "${BLUE}• Ver logs backend:${NC}  tail -f logs/backend.log"
echo -e "${BLUE}• Ver logs frontend:${NC} tail -f logs/frontend.log"
echo -e "${BLUE}• Parar serviços:${NC}   Ctrl+C"
echo -e "${BLUE}• Teste API:${NC}        curl http://localhost:3001/api/auth/register"

# Função para mostrar logs em tempo real
show_logs() {
    echo -e "\n${CYAN}📄 Logs em tempo real (Ctrl+C para parar de mostrar):${NC}"
    tail -f logs/backend.log logs/frontend.log 2>/dev/null
}

# Menu interativo
echo -e "\n${PURPLE}Escolha uma opção:${NC}"
echo -e "${BLUE}1)${NC} Manter rodando em background"
echo -e "${BLUE}2)${NC} Mostrar logs em tempo real"
echo -e "${BLUE}3)${NC} Abrir aplicação no navegador"
echo -e "${BLUE}q)${NC} Parar todos os serviços"

while true; do
    read -p "Opção: " choice
    case $choice in
        1)
            echo -e "${GREEN}✅ Serviços rodando em background!${NC}"
            echo -e "${YELLOW}Para parar, execute: kill $BACKEND_PID $FRONTEND_PID${NC}"
            break
            ;;
        2)
            show_logs
            ;;
        3)
            echo -e "${CYAN}🌐 Abrindo aplicação no navegador...${NC}"
            if command -v open &> /dev/null; then
                open http://localhost:5173
            elif command -v xdg-open &> /dev/null; then
                xdg-open http://localhost:5173
            else
                echo -e "${BLUE}Abra manualmente: http://localhost:5173${NC}"
            fi
            ;;
        q|Q)
            cleanup
            ;;
        *)
            echo -e "${YELLOW}Opção inválida. Tente novamente.${NC}"
            ;;
    esac
done

# Manter script rodando para capturar Ctrl+C
while true; do
    sleep 1
done 