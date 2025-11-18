# 🔧 Como Corrigir Variáveis Pluggy no Render

## ⚠️ Problema
As variáveis `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` estão configuradas no Render, mas a API ainda retorna erro 500.

## ✅ Solução Passo a Passo

### 1. Verificar se as variáveis estão no serviço correto

**IMPORTANTE:** No Render, você pode ter:
- **Environment Variables** no serviço específico
- **Environment Groups** (grupos compartilhados)

**Verifique:**
1. No Render Dashboard, vá no seu serviço Web Service
2. Clique em **Environment** (menu lateral)
3. Verifique se `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` aparecem na lista
4. Se não aparecerem, você precisa adicioná-las **diretamente no serviço**, não apenas no grupo

### 2. Adicionar variáveis diretamente no serviço (se necessário)

1. No serviço Web Service → **Environment**
2. Clique em **Add Environment Variable**
3. Adicione:
   - Key: `PLUGGY_CLIENT_ID`
   - Value: (seu client ID)
4. Clique em **Add Environment Variable** novamente
5. Adicione:
   - Key: `PLUGGY_CLIENT_SECRET`
   - Value: (seu client secret)

### 3. **REINICIAR O SERVIÇO** (CRÍTICO)

Após adicionar/alterar variáveis, você **DEVE** reiniciar:

**Opção A - Manual Deploy:**
1. No serviço → **Manual Deploy** → **Deploy latest commit**
2. Aguarde o deploy completar (2-5 minutos)

**Opção B - Restart:**
1. No serviço → **Settings** → **Restart**
2. Aguarde o serviço reiniciar (1-2 minutos)

### 4. Verificar logs após reiniciar

1. No Render Dashboard → **Logs**
2. Procure por: `🔍 Verificando credenciais Pluggy`
3. Deve mostrar:
   ```
   hasClientId: true
   hasClientSecret: true
   clientIdLength: (número > 0)
   ```

### 5. Testar usando rota de debug

Após reiniciar, teste:
```
https://www.rdsinvestimentos.com/api/debug/pluggy-env
```

Deve retornar:
```json
{
  "success": true,
  "message": "✅ Variáveis Pluggy configuradas corretamente",
  "environment": {
    "hasClientId": true,
    "hasClientSecret": true,
    ...
  }
}
```

### 6. Se ainda não funcionar

**Verificar se há múltiplos serviços:**
1. No Render Dashboard, veja se há mais de um Web Service
2. Verifique qual serviço tem o domínio customizado `rdsinvestimentos.com`
3. Configure as variáveis **nesse serviço específico**
4. Reinicie **esse serviço**

**Verificar domínio customizado:**
1. No serviço → **Settings** → **Custom Domains**
2. Verifique se `rdsinvestimentos.com` está apontando para o serviço correto
3. Verifique se o status está **Active**

## 🔍 Diagnóstico

Se após seguir todos os passos ainda não funcionar:

1. Acesse: `https://www.rdsinvestimentos.com/api/debug/pluggy-env`
2. Copie a resposta completa
3. Verifique os logs no Render Dashboard
4. Procure por erros relacionados a variáveis de ambiente

## ⚡ Checklist Rápido

- [ ] Variáveis adicionadas **diretamente no serviço** (não apenas no grupo)
- [ ] Variáveis têm valores corretos (sem espaços extras)
- [ ] Serviço foi **reiniciado** após adicionar variáveis
- [ ] Logs mostram `hasClientId: true` e `hasClientSecret: true`
- [ ] Rota `/api/debug/pluggy-env` retorna sucesso
- [ ] Domínio customizado aponta para o serviço correto

