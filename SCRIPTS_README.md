# 🚀 Scripts de Automação - ERP Horizons

## 📋 Scripts Disponíveis

### 1. `start-erp.sh` - **Script Completo e Interativo**
```bash
./start-erp.sh
```

**Funcionalidades:**
- ✅ **ASCII Art** bonito na inicialização
- ✅ **Verificações automáticas** de dependências
- ✅ **Instalação automática** de dependências se necessário
- ✅ **Criação automática** de arquivos `.env` se não existirem
- ✅ **Verificação de portas** e limpeza de processos existentes
- ✅ **Logs organizados** em `logs/backend.log` e `logs/frontend.log`
- ✅ **Menu interativo** com opções:
  - Manter rodando em background
  - Mostrar logs em tempo real
  - Abrir aplicação no navegador
  - Parar todos os serviços
- ✅ **Cleanup automático** com `Ctrl+C`

### 2. `start-simple.sh` - **Script Simples e Rápido**
```bash
./start-simple.sh
```

**Funcionalidades:**
- ✅ **Inicialização rápida** sem interatividade
- ✅ **Criação automática** de arquivos de configuração
- ✅ **Limpeza de portas** antes de iniciar
- ✅ **Parada simples** com `Ctrl+C`
- ✅ **Menor complexidade** para uso básico

### 3. `stop-erp.sh` - **Script de Parada**
```bash
./stop-erp.sh
```

**Funcionalidades:**
- ✅ **Para todos os serviços** relacionados ao ERP
- ✅ **Limpa processos** por porta (3001, 5173)
- ✅ **Backup de limpeza** por nome do processo
- ✅ **Verificação final** do status das portas
- ✅ **Relatório** do que foi parado

## 🏃‍♂️ Como Usar

### Uso Básico (Recomendado)
```bash
# Iniciar tudo de uma vez (interativo)
./start-erp.sh

# OU iniciar simples
./start-simple.sh

# Parar tudo
./stop-erp.sh
```

### Primeira Execução
```bash
# Os scripts são inteligentes e farão automaticamente:
./start-erp.sh

# Isso irá:
# 1. Verificar se Node.js está instalado
# 2. Instalar dependências se necessário
# 3. Criar arquivos .env se não existirem
# 4. Limpar portas em uso
# 5. Iniciar backend e frontend
# 6. Verificar se estão respondendo
# 7. Mostrar menu de opções
```

## 📁 Estrutura de Logs

Os scripts criam uma estrutura organizada de logs:

```
logs/
├── backend.log    # Logs do servidor Node.js
└── frontend.log   # Logs do Vite/React
```

**Ver logs em tempo real:**
```bash
# Opção 2 no menu do start-erp.sh
# OU manualmente:
tail -f logs/backend.log
tail -f logs/frontend.log
```

## ⚙️ Configurações Automáticas

### Backend (.env)
Os scripts criam automaticamente:
```env
PORT=3001
NODE_ENV=development
DB_PATH=./database/horizons.db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789abcdef
CORS_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:3001/api
```

## 🐛 Solução de Problemas

### Script não executa
```bash
# Tornar executável
chmod +x start-erp.sh
chmod +x start-simple.sh
chmod +x stop-erp.sh
```

### Portas em uso
```bash
# Os scripts limpam automaticamente, mas manualmente:
lsof -ti :3001 | xargs kill -9
lsof -ti :5173 | xargs kill -9
```

### Dependências não instaladas
```bash
# O start-erp.sh instala automaticamente, mas manualmente:
npm install              # Frontend
cd backend && npm install  # Backend
```

### Backend não responde
```bash
# Verificar logs
tail -f logs/backend.log

# Ou iniciar manualmente para debug
cd backend
npm run dev
```

### Frontend não responde
```bash
# Verificar logs
tail -f logs/frontend.log

# Ou iniciar manualmente para debug
npm run dev
```

## 🚀 URLs dos Serviços

Após executar os scripts:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Teste API**: http://localhost:3001/api/auth/register

## 📋 Comandos Úteis Extras

```bash
# Ver processos Node.js rodando
ps aux | grep node

# Ver quem está usando as portas
lsof -i :3001
lsof -i :5173

# Matar todos os processos Node.js (cuidado!)
pkill -f node

# Ver logs em tempo real (ambos)
tail -f logs/*.log
```

## 🎯 Escolha seu Script

| Cenário | Script Recomendado |
|---------|-------------------|
| **Primeira vez** | `./start-erp.sh` |
| **Desenvolvimento diário** | `./start-simple.sh` |
| **Debug/problemas** | `./start-erp.sh` |
| **Parar tudo** | `./stop-erp.sh` |
| **Produção** | Manual com PM2 |

## 🔧 Personalização

Os scripts podem ser editados para:
- Mudar portas padrão
- Adicionar mais verificações
- Integrar com outros serviços
- Adicionar notificações
- Configurar environment específico

---

**Aproveite os scripts e seja mais produtivo! 🚀** 