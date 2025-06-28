# 🚀 Guia de Deploy - Vercel + Render

Este guia vai te ajudar a fazer o deploy do ERP Horizons usando **Vercel** para o frontend e **Render** para o backend.

## 📋 Pré-requisitos

- [x] Conta no GitHub (já criada)
- [x] Código no repositório `alexsdasony/breno-erp`
- [ ] Conta na [Vercel](https://vercel.com/)
- [ ] Conta no [Render](https://render.com/)

## 🔧 Parte 1: Deploy do Backend (Render)

### 1.1. Criar conta no Render
1. Acesse https://render.com/
2. Clique em "Get Started for Free"
3. Conecte com sua conta GitHub

### 1.2. Criar PostgreSQL Database
1. No dashboard do Render, clique em "New +"
2. Selecione "PostgreSQL"
3. Configurações:
   - **Name**: `breno-erp-database`
   - **Database**: `breno_erp`
   - **User**: `breno_erp_user`
   - **Region**: Ohio (US East)
   - **Plan**: Free
4. Clique em "Create Database"
5. **IMPORTANTE**: Anote a "External Database URL" (será usado depois)

### 1.3. Deploy do Backend
1. No dashboard, clique em "New +" → "Web Service"
2. Conecte ao repositório `alexsdasony/breno-erp`
3. Configurações:
   - **Name**: `breno-erp-backend`
   - **Root Directory**: `backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 1.4. Configurar Variáveis de Ambiente
Na seção "Environment Variables", adicione:

```
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://breno-erp.vercel.app
JWT_SECRET=your-super-secret-jwt-key-here
DATABASE_URL=<cole-aqui-a-url-do-postgresql>
```

⚠️ **Importante**: Substitua:
- `your-super-secret-jwt-key-here` por uma chave secreta forte
- `<cole-aqui-a-url-do-postgresql>` pela URL do banco criado no passo 1.2

### 1.5. Deploy
1. Clique em "Create Web Service"
2. Aguarde o deploy (5-10 minutos)
3. Anote a URL gerada (ex: `https://breno-erp-backend.onrender.com`)

## 🌐 Parte 2: Deploy do Frontend (Vercel)

### 2.1. Criar conta na Vercel
1. Acesse https://vercel.com/
2. Clique em "Sign Up"
3. Conecte com sua conta GitHub

### 2.2. Importar Projeto
1. No dashboard, clique em "New Project"
2. Selecione o repositório `alexsdasony/breno-erp`
3. Configurações:
   - **Project Name**: `breno-erp`
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (raiz)

### 2.3. Configurar Variáveis de Ambiente
Na seção "Environment Variables", adicione:

```
VITE_API_URL=https://breno-erp-backend.onrender.com/api
```

⚠️ **Importante**: Substitua pela URL real do seu backend do Render

### 2.4. Deploy
1. Clique em "Deploy"
2. Aguarde o build (2-5 minutos)
3. Acesse a URL gerada (ex: `https://breno-erp.vercel.app`)

## 🔄 Parte 3: Atualizações e Sync

### 3.1. Atualizar CORS no Backend
1. Volte ao Render
2. Vá em "Environment Variables" do backend
3. Atualize `CORS_ORIGIN` com a URL real da Vercel:
   ```
   CORS_ORIGIN=https://breno-erp.vercel.app
   ```
4. Clique em "Save Changes" (vai fazer redeploy automático)

### 3.2. Verificar se está funcionando
1. Acesse a URL da Vercel
2. Tente fazer login/registro
3. Se der erro de CORS, verifique se a URL no `CORS_ORIGIN` está correta

## 🎯 URLs Finais

Depois do deploy completo, você terá:

- **Frontend**: `https://breno-erp.vercel.app`
- **Backend**: `https://breno-erp-backend.onrender.com`
- **Banco**: PostgreSQL no Render

## 🔧 Comandos Úteis

### Desenvolvimento Local
```bash
# Frontend
npm run dev

# Backend
cd backend
npm run dev
```

### Logs de Produção
- **Render**: Dashboard → Web Service → Logs
- **Vercel**: Dashboard → Project → Functions → Logs

## 🚨 Troubleshooting

### 1. Erro de CORS
- Verifique se `CORS_ORIGIN` no Render está correto
- URL deve ser exatamente igual à da Vercel

### 2. Erro de Database
- Verifique se `DATABASE_URL` está correto
- Aguarde uns minutos - bancos grátis podem demorar para inicializar

### 3. Build Error
- Verifique se todas as dependências estão no `package.json`
- Logs de build estão disponíveis em ambas plataformas

### 4. Frontend não carrega API
- Verifique se `VITE_API_URL` está correto na Vercel
- Teste a URL do backend diretamente: `https://seu-backend.onrender.com/api/health`

## 📱 Próximos Passos

Após o deploy:

1. **Teste completo**: Registre usuário, crie transações, etc.
2. **Backup**: Configure backup automático do PostgreSQL
3. **Domínio personalizado**: Configure domínio próprio na Vercel
4. **Monitoramento**: Configure alertas de uptime
5. **SSL**: Ambas plataformas já vêm com HTTPS

---

**💡 Dica**: Mantenha as URLs e credenciais em local seguro para futuras atualizações! 