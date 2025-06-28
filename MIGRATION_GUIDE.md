# 🚀 Guia de Migração - ERP Horizons

## ✅ Status da Migração

A migração do localStorage para backend Node.js com SQLite foi **COMPLETADA COM SUCESSO!**

### O que foi implementado:

#### Backend (Node.js + Express + SQLite)
- ✅ API RESTful completa com autenticação JWT
- ✅ Banco de dados SQLite com todas as tabelas
- ✅ Middleware de segurança (Helmet, CORS, Rate Limiting)
- ✅ Validações robustas com express-validator
- ✅ Relacionamentos entre tabelas com foreign keys
- ✅ Índices para performance
- ✅ Logging detalhado

#### Frontend (React)
- ✅ Serviço de API centralizado (`src/services/api.js`)
- ✅ Hook `useAppData` migrado para usar APIs
- ✅ Autenticação JWT integrada
- ✅ Tratamento de erros e loading states
- ✅ Mantém toda funcionalidade original

## 🏃‍♂️ Como executar

### 🚀 Opção 1: Scripts Automatizados (RECOMENDADO)

```bash
# Iniciar tudo com script completo (interativo)
./start-erp.sh

# OU iniciar com script simples (rápido)
./start-simple.sh

# Parar todos os serviços
./stop-erp.sh
```

**Funcionalidades dos scripts:**
- ✅ Instalação automática de dependências
- ✅ Criação automática de arquivos `.env`
- ✅ Verificação e limpeza de portas
- ✅ Logs organizados
- ✅ Menu interativo (script completo)
- ✅ Cleanup automático

### 📋 Opção 2: Manual (Tradicional)

```bash
# 1. Backend
cd backend
npm install
npm start

# 2. Frontend (em outro terminal)
npm install
npm run dev
```

**URLs dos serviços:**
- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`

## 🔧 Configuração

### Backend (.env)
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

## 📊 Estrutura do Banco de Dados

### Tabelas Criadas:
- `users` - Usuários do sistema
- `segments` - Segmentos de negócio
- `cost_centers` - Centros de custo
- `customers` - Clientes
- `products` - Produtos
- `transactions` - Transações financeiras
- `sales` - Vendas
- `billings` - Cobranças
- `accounts_payable` - Contas a pagar
- `nfe` - Notas fiscais eletrônicas
- `integrations` - Configurações de integrações

## 🛠 APIs Disponíveis

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil do usuário
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/change-password` - Alterar senha

### Dados
- `GET/POST/PUT/DELETE /api/transactions` - Transações
- `GET/POST/PUT/DELETE /api/products` - Produtos
- `GET/POST/PUT/DELETE /api/customers` - Clientes
- `GET/POST/PUT/DELETE /api/sales` - Vendas
- `GET/POST/PUT/DELETE /api/billings` - Cobranças
- `GET/POST/PUT/DELETE /api/cost-centers` - Centros de custo
- `GET/POST/PUT/DELETE /api/nfe` - NFe
- `GET/POST/PUT/DELETE /api/accounts-payable` - Contas a pagar
- `GET/POST/PUT/DELETE /api/segments` - Segmentos
- `GET/PUT /api/integrations` - Integrações

### Métricas
- `GET /api/metrics/dashboard` - Métricas do dashboard
- `GET /api/metrics/financial` - Métricas financeiras
- `GET /api/metrics/sales` - Métricas de vendas

## 🔄 Migração de Dados Existentes

Os dados do localStorage serão automaticamente perdidos, mas você pode:

1. **Exportar dados antes da migração** (se necessário)
2. **Criar novos dados através da interface**
3. **Usar a funcionalidade de importação** para transações

## 🚀 Funcionalidades Mantidas

- ✅ Dashboard com métricas
- ✅ Gestão financeira completa
- ✅ Controle de estoque
- ✅ Gestão de vendas
- ✅ Cadastro de clientes
- ✅ Sistema de cobranças
- ✅ Contas a pagar
- ✅ Emissão de NFe
- ✅ Centros de custo
- ✅ Segmentação
- ✅ Integrações
- ✅ Relatórios
- ✅ Importação de dados
- ✅ Autenticação e perfis

## 🔮 Próximos Passos

### Migração para outros bancos:
O sistema está preparado para migrar facilmente para:
- **MySQL** - Trocar apenas a configuração do banco
- **PostgreSQL** - Idem
- **Supabase** - Configuração simples
- **MongoDB** - Requer ajustes nas queries

### Melhorias sugeridas:
- [ ] Implementar refresh token automático
- [ ] Cache de dados no frontend
- [ ] Paginação no frontend
- [ ] Upload de arquivos
- [ ] Notificações em tempo real
- [ ] Backup automático
- [ ] Logs de auditoria

## 🐛 Solução de Problemas

### Backend não inicia:
```bash
cd backend
npm install sqlite --save
npm start
```

### Frontend não conecta:
1. Verifique se o backend está rodando
2. Confirme o arquivo `.env.local` com `VITE_API_URL=http://localhost:3001/api`
3. Abra o console do navegador para ver erros

### Problemas de CORS:
- Verifique a configuração `CORS_ORIGIN` no backend
- Certifique-se que as URLs batem

## 📝 Notas Importantes

1. **Segurança**: Em produção, altere o `JWT_SECRET`
2. **Banco**: O arquivo SQLite será criado em `backend/database/horizons.db`
3. **Backup**: Faça backup regular do arquivo de banco
4. **Performance**: Para muitos dados, considere PostgreSQL
5. **Monitoramento**: Implemente logs em produção

---

**Migração realizada com sucesso! 🎉**

O sistema agora está totalmente funcional com backend robusto e escalável. 