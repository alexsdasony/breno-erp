# 🚀 ERP Pro - Instruções de Uso

## 📋 Scripts Disponíveis

### 1. Iniciar Tudo (Backend + Frontend)
```bash
./start-erp.sh
```
- Inicia backend na porta 3001
- Inicia frontend na porta 5173
- Para parar: pressione `Ctrl+C`

### 2. Iniciar Apenas Backend
```bash
./start-backend.sh
```
- Inicia apenas o backend na porta 3001
- Para parar: pressione `Ctrl+C`

### 3. Parar Todos os Serviços
```bash
./stop-erp.sh
```
- Para todos os processos do ERP
- Libera as portas 3001 e 5173

## 🌐 URLs de Acesso

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 🔧 Comandos Manuais

### Iniciar Backend Manualmente
```bash
cd backend
node server.js
```

### Iniciar Frontend Manualmente
```bash
npm run dev
```

## 🛠️ Solução de Problemas

### Se a porta 3001 estiver ocupada:
```bash
lsof -ti :3001 | xargs kill -9
```

### Se a porta 5173 estiver ocupada:
```bash
lsof -ti :5173 | xargs kill -9
```

### Se o backend não iniciar:
1. Verifique se está no diretório correto
2. Execute: `cd backend && node server.js`
3. Verifique se o arquivo `server.js` existe

### Se o frontend não iniciar:
1. Verifique se está no diretório raiz
2. Execute: `npm run dev`
3. Verifique se o `package.json` existe

## 📝 Logs

- **Backend**: Os logs aparecem no terminal onde foi iniciado
- **Frontend**: Os logs aparecem no terminal onde foi iniciado

## 🎯 Dicas

1. **Sempre use os scripts** para evitar problemas de diretório
2. **Para parar tudo**: Use `./stop-erp.sh` ou `Ctrl+C`
3. **Se algo não funcionar**: Execute `./stop-erp.sh` e depois `./start-erp.sh`
4. **Verifique as portas**: Use `lsof -i :3001` e `lsof -i :5173`

## ✅ Checklist de Inicialização

- [ ] Backend rodando na porta 3001
- [ ] Frontend rodando na porta 5173
- [ ] Acesso ao frontend em http://localhost:5173
- [ ] Login funcionando
- [ ] Dashboard carregando dados
- [ ] Filtro de segmento funcionando 