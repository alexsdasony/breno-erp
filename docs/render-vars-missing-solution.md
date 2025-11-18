# 🚨 Variáveis Pluggy Não Aparecem no Ambiente de Execução

## ❌ Problema Identificado

A rota de debug mostra:
- ✅ `totalEnvVars: 61` - Node.js está lendo variáveis
- ✅ Outras variáveis aparecem (DATABASE_URL, JWT_SECRET, etc.)
- ❌ `allPluggyKeysFound: []` - Nenhuma chave PLUGGY encontrada
- ❌ `hasClientId: false` e `hasClientSecret: false`

**Isso significa:** As variáveis estão configuradas no Render Dashboard, mas **não estão sendo carregadas** no ambiente de execução do Node.js.

## ✅ Solução

### 1. Verificar se as variáveis estão no serviço correto

**CRÍTICO:** No Render, você pode ter variáveis em dois lugares:
- **Environment Variables** do serviço específico ✅ (você já fez isso)
- **Environment Groups** (grupos compartilhados) ⚠️

### 2. Verificar Environment Groups

1. Render Dashboard → **Environment Groups** (menu lateral)
2. Verifique se há algum grupo criado
3. Se houver um grupo com as variáveis Pluggy:
   - Verifique se o grupo está **vinculado ao serviço** `breno-erp`
   - No serviço → **Environment** → Veja se o grupo aparece na lista
   - Se não aparecer, adicione o grupo ao serviço

**MAS:** Mesmo com grupos, é mais seguro ter as variáveis **diretamente no serviço**.

### 3. **DELETAR E RECRIAR AS VARIÁVEIS** (Solução Recomendada)

Às vezes, há um problema de sincronização. Tente:

1. No serviço `breno-erp` → **Environment**
2. **Delete** `PLUGGY_CLIENT_ID` (clique nos três pontos → Delete)
3. **Delete** `PLUGGY_CLIENT_SECRET`
4. Aguarde 10 segundos
5. **Adicione novamente:**
   - Clique em **"Add Environment Variable"**
   - Key: `PLUGGY_CLIENT_ID` (copie e cole exatamente assim)
   - Value: (cole seu client ID)
   - Clique em **"Add"**
   - Repita para `PLUGGY_CLIENT_SECRET`

### 4. **REINICIAR O SERVIÇO** (OBRIGATÓRIO)

Após recriar as variáveis:

1. No serviço → **Manual Deploy** → **Deploy latest commit**
2. Aguarde o deploy completar (2-5 minutos)
3. **NÃO** use apenas "Restart" - faça um deploy completo

### 5. Verificar se há múltiplos serviços

O fato de aparecer `VERCEL` e `NOW_REGION` nas variáveis sugere que pode haver múltiplos serviços ou configurações mistas.

1. Render Dashboard → Veja todos os seus serviços
2. Verifique se há outro Web Service além de `breno-erp`
3. Se houver, verifique qual tem o domínio customizado `rdsinvestimentos.com`
4. Configure as variáveis **nesse serviço específico**

### 6. Verificar domínio customizado

1. No serviço `breno-erp` → **Settings** → **Custom Domains**
2. Verifique se `rdsinvestimentos.com` está configurado
3. Se estiver, verifique o status (deve estar **Active**)
4. Se não estiver, adicione o domínio customizado

### 7. Testar após reiniciar

Após seguir todos os passos:

1. Aguarde 2-5 minutos após o deploy
2. Acesse: `https://www.rdsinvestimentos.com/api/debug/pluggy-env`
3. Deve retornar:
   ```json
   {
     "allPluggyKeysFound": ["PLUGGY_CLIENT_ID", "PLUGGY_CLIENT_SECRET"],
     "hasClientId": true,
     "hasClientSecret": true
   }
   ```

## 🔍 Diagnóstico Adicional

Se ainda não funcionar após seguir todos os passos:

1. Verifique os logs do Render após o deploy
2. Procure por erros relacionados a variáveis de ambiente
3. Verifique se outras variáveis (como `DATABASE_URL`) estão sendo lidas corretamente
4. Se outras variáveis também não estão sendo lidas, pode ser um problema mais amplo com o Render

## ⚡ Checklist Final

- [ ] Variáveis deletadas e recriadas no serviço `breno-erp`
- [ ] Nomes corretos: `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` (sem espaços extras)
- [ ] Valores corretos (copiados diretamente do painel Pluggy)
- [ ] **Manual Deploy** executado (não apenas Restart)
- [ ] Aguardou 2-5 minutos após deploy
- [ ] Rota `/api/debug/pluggy-env` mostra `allPluggyKeysFound` com as chaves
- [ ] Domínio customizado configurado e ativo

## 🆘 Última Alternativa

Se nada funcionar, considere:

1. **Recriar o serviço** no Render (último recurso)
2. Ou verificar se há algum problema conhecido do Render com variáveis de ambiente
3. Contatar suporte do Render com o Service ID: `srv-d1fs8jmmcj7s73c1scfg`

