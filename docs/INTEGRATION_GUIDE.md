# Guia de Integração Frontend-Backend

## 🎯 Visão Geral

Este documento explica como o frontend React e o backend Node.js/Express estão integrados com o Supabase para funcionar como um sistema ERP completo.

## 🏗️ Arquitetura da Integração

### Frontend (React + Vite)
- **Localização**: `/src/`
- **Porta**: 5173 (desenvolvimento)
- **Tecnologias**: React, Vite, Tailwind CSS, Framer Motion

### Backend (Node.js + Express)
- **Localização**: `/backend/`
- **Porta**: 3001
- **Tecnologias**: Express, Supabase, JWT

### Banco de Dados (Supabase)
- **Tipo**: PostgreSQL gerenciado
- **Autenticação**: JWT customizado + Supabase Auth

## 🔧 Componentes Principais

### 1. Hooks de Autenticação (`src/hooks/useAuth.jsx`)
```javascript
// Hook responsável por toda a autenticação
const { currentUser, loginUser, registerUser, logoutUser } = useAuth();
```

**Funcionalidades:**
- Login/Logout
- Registro de usuários
- Verificação de autenticação
- Gerenciamento de tokens JWT

### 2. Hooks de CRUD (`src/hooks/useCrud.jsx`)
```javascript
// Hook responsável por todas as operações CRUD
const { addTransaction, updateCustomer, deleteProduct } = useCrud();
```

**Funcionalidades:**
- Operações CRUD para todas as entidades
- Integração direta com a API
- Tratamento de erros
- Notificações toast

### 3. Gerenciamento de Estado (`src/hooks/useAppData.jsx`)
```javascript
// Hook principal que gerencia todo o estado da aplicação
const { data, currentUser, loading, metrics } = useAppData();
```

**Funcionalidades:**
- Cache em memória
- Carregamento lazy de dados
- Sincronização com backend
- Cálculo de métricas

### 4. Serviço de API (`src/services/api.js`)
```javascript
// Cliente HTTP centralizado para comunicação com backend
const apiService = new ApiService();
```

**Funcionalidades:**
- Requisições HTTP padronizadas
- Gerenciamento de tokens
- Tratamento de erros
- Integração com Supabase

## 🔄 Fluxo de Dados

### 1. Autenticação
```
Frontend → API Service → Backend → Supabase → JWT Token → Frontend
```

### 2. Operações CRUD
```
Frontend → useCrud → API Service → Backend → Supabase → Response → Frontend
```

### 3. Carregamento de Dados
```
Frontend → useAppData → API Service → Backend → Supabase → Cache → Frontend
```

## 🚀 Como Iniciar o Sistema

### 1. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_do_supabase

# JWT Secret
JWT_SECRET=seu_jwt_secret

# API Configuration
VITE_API_URL=http://localhost:3001/api

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 2. Instalar Dependências
```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 3. Iniciar Serviços
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm run dev
```

## 🔍 Testando a Integração

### Script de Teste Automático
```bash
node test-integration.js
```

Este script verifica:
- ✅ Estrutura de arquivos
- ✅ Dependências instaladas
- ✅ Configurações de ambiente
- ✅ Sintaxe dos arquivos
- ✅ Conectividade dos serviços

### Teste Manual
1. Acesse `http://localhost:5173`
2. Faça login com um usuário válido
3. Teste as operações CRUD em diferentes módulos
4. Verifique se os dados são persistidos no Supabase

## 🛠️ Solução de Problemas

### Problema: "Backend não está respondendo"
**Solução:**
1. Verifique se o backend está rodando na porta 3001
2. Confirme as variáveis de ambiente
3. Verifique os logs do backend

### Problema: "Erro de autenticação"
**Solução:**
1. Verifique as chaves do Supabase
2. Confirme se o JWT_SECRET está configurado
3. Limpe o cache do navegador

### Problema: "Dados não são carregados"
**Solução:**
1. Verifique a conexão com o Supabase
2. Confirme se as tabelas existem no banco
3. Verifique os logs do console

### Problema: "CORS errors"
**Solução:**
1. Verifique a configuração CORS no backend
2. Confirme se as origens estão corretas
3. Reinicie o backend

## 📊 Monitoramento

### Logs do Frontend
- Console do navegador (F12)
- Logs de autenticação
- Logs de requisições API

### Logs do Backend
- Terminal onde o backend está rodando
- Logs de requisições
- Logs de erro

### Logs do Supabase
- Dashboard do Supabase
- Logs de queries
- Logs de autenticação

## 🔒 Segurança

### Autenticação
- JWT tokens para sessões
- Verificação de permissões por segmento
- Logout automático em token expirado

### Autorização
- Controle de acesso baseado em roles
- Filtros por segmento de usuário
- Validação de dados no backend

### Dados
- Criptografia de senhas com bcrypt
- Validação de entrada
- Sanitização de dados

## 🚀 Deploy

### Frontend (Vercel)
1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático

### Backend (Render)
1. Conecte o repositório ao Render
2. Configure as variáveis de ambiente
3. Deploy automático

### Banco de Dados (Supabase)
1. Configure as políticas de segurança
2. Configure backups automáticos
3. Monitore o uso de recursos

## 📈 Performance

### Otimizações Implementadas
- Cache em memória para dados frequentes
- Carregamento lazy de módulos
- Compressão de respostas
- Rate limiting

### Monitoramento
- Métricas de tempo de resposta
- Uso de memória
- Queries lentas
- Erros de API

## 🎉 Conclusão

A integração está completa e funcional. O sistema oferece:

- ✅ Autenticação segura
- ✅ Operações CRUD completas
- ✅ Cache inteligente
- ✅ Tratamento de erros
- ✅ Interface responsiva
- ✅ Performance otimizada

Para suporte adicional, consulte os logs ou entre em contato com a equipe de desenvolvimento. 