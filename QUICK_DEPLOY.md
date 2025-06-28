# ⚡ Deploy Rápido - ERP Horizons

## 🎯 TL;DR - Checklist de Deploy

### 1. Backend (Render) - 10 minutos
- [ ] Criar conta: https://render.com/
- [ ] New + → PostgreSQL → `breno-erp-database`
- [ ] New + → Web Service → `alexsdasony/breno-erp`
- [ ] Root Directory: `backend`
- [ ] Variáveis:
  ```
  NODE_ENV=production
  CORS_ORIGIN=https://breno-erp.vercel.app
  JWT_SECRET=sua-chave-secreta-aqui
  DATABASE_URL=<url-do-postgresql>
  ```

### 2. Frontend (Vercel) - 5 minutos
- [ ] Criar conta: https://vercel.com/
- [ ] New Project → `alexsdasony/breno-erp`
- [ ] Framework: Vite
- [ ] Environment Variable:
  ```
  VITE_API_URL=https://breno-erp-backend.onrender.com/api
  ```

### 3. Finalizar - 2 minutos
- [ ] Atualizar `CORS_ORIGIN` no Render com URL real da Vercel
- [ ] Testar: registrar usuário no app
- [ ] ✅ **Pronto!**

## 🔗 Links Úteis

- **GitHub**: https://github.com/alexsdasony/breno-erp
- **Documentação completa**: `DEPLOY_GUIDE.md`
- **Configurações técnicas**: `PRODUCTION_CONFIG.md`

## 🆘 Problemas Comuns

| Erro | Solução |
|------|---------|
| CORS | Verificar `CORS_ORIGIN` no Render |
| 404 API | Verificar `VITE_API_URL` na Vercel |
| Build Error | Verificar logs no dashboard |
| Database | Aguardar inicialização (pode demorar) |

---
**⏱️ Tempo total**: ~17 minutos
**💰 Custo**: Grátis (free tiers)
**🔄 Auto-deploy**: Configurado (git push = deploy automático) 