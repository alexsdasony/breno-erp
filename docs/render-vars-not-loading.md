# 🚨 Variáveis Pluggy Não Estão Sendo Lidas

## ❌ Problema
A rota `/api/debug/pluggy-env` retorna:
```json
{
  "hasClientId": false,
  "hasClientSecret": false,
  "allPluggyVars": {}
}
```

Isso significa que o Node.js **não está conseguindo ler** as variáveis de ambiente, mesmo que elas estejam configuradas no Render.

## ✅ Solução Passo a Passo

### 1. Verificar se as variáveis estão no serviço correto

**CRÍTICO:** No Render, você pode ter variáveis em dois lugares:
- **Environment Variables** do serviço específico
- **Environment Groups** (grupos compartilhados)

**Você PRECISA adicionar as variáveis DIRETAMENTE no serviço:**

1. Render Dashboard → Seu Web Service
2. Menu lateral → **Environment**
3. Verifique se `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` aparecem na lista
4. Se **NÃO aparecerem**, adicione:
   - Clique em **"Add Environment Variable"**
   - Key: `PLUGGY_CLIENT_ID` (exatamente assim, case-sensitive)
   - Value: (cole seu client ID)
   - Clique em **"Add"**
   - Repita para `PLUGGY_CLIENT_SECRET`

### 2. Verificar nomes das variáveis

**IMPORTANTE:** Os nomes são **case-sensitive** e devem ser exatamente:
- `PLUGGY_CLIENT_ID` (não `pluggy_client_id` ou `Pluggy_Client_Id`)
- `PLUGGY_CLIENT_SECRET` (não `pluggy_client_secret` ou `Pluggy_Client_Secret`)

### 3. Verificar se há espaços extras

Ao colar os valores:
- Não deve haver espaços no início ou fim
- Não deve haver quebras de linha
- Copie e cole diretamente do painel Pluggy

### 4. **REINICIAR O SERVIÇO** (OBRIGATÓRIO)

Após adicionar/alterar variáveis:

**Opção A - Manual Deploy (Recomendado):**
1. No serviço → **Manual Deploy** → **Deploy latest commit**
2. Aguarde o deploy completar (2-5 minutos)
3. Verifique os logs para confirmar que o deploy foi bem-sucedido

**Opção B - Restart:**
1. No serviço → **Settings** → **Restart**
2. Aguarde 1-2 minutos

### 5. Verificar logs após reiniciar

1. Render Dashboard → **Logs**
2. Procure por: `🔍 Verificando credenciais Pluggy`
3. Deve mostrar:
   ```
   hasClientId: true
   hasClientSecret: true
   clientIdLength: (número > 0)
   ```

### 6. Verificar se há múltiplos serviços

Se você tem múltiplos Web Services:

1. Verifique qual serviço tem o domínio customizado `rdsinvestimentos.com`
2. Configure as variáveis **nesse serviço específico**
3. Reinicie **esse serviço**

Para verificar:
- Render Dashboard → Seu serviço → **Settings** → **Custom Domains**
- Veja qual serviço tem `rdsinvestimentos.com` configurado

### 7. Verificar Environment Groups

Se você está usando Environment Groups:

1. Render Dashboard → **Environment Groups**
2. Verifique se o grupo tem as variáveis `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET`
3. Verifique se o grupo está **vinculado ao serviço**:
   - No serviço → **Environment** → Veja se o grupo aparece na lista
   - Se não aparecer, adicione o grupo ao serviço

**MAS:** Mesmo com grupos, é mais seguro adicionar as variáveis **diretamente no serviço**.

### 8. Testar novamente

Após seguir todos os passos:

1. Aguarde 2-5 minutos após reiniciar
2. Acesse: `https://www.rdsinvestimentos.com/api/debug/pluggy-env`
3. Deve retornar:
   ```json
   {
     "success": true,
     "message": "✅ Variáveis Pluggy configuradas corretamente",
     "environment": {
       "hasClientId": true,
       "hasClientSecret": true,
       "clientIdLength": (número > 0),
       "clientSecretLength": (número > 0)
     }
   }
   ```

## 🔍 Diagnóstico Avançado

Se ainda não funcionar, use a rota de debug para ver mais informações:

```
https://www.rdsinvestimentos.com/api/debug/pluggy-env
```

A resposta agora inclui:
- `allPluggyKeysFound`: Lista de todas as chaves que contêm "PLUGGY"
- `similarKeysFound`: Chaves similares (para detectar typos)
- `sampleEnvKeys`: Primeiras 30 variáveis de ambiente (para verificar se outras estão sendo lidas)

## ⚡ Checklist Final

- [ ] Variáveis adicionadas **diretamente no serviço** (não apenas no grupo)
- [ ] Nomes corretos: `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` (case-sensitive)
- [ ] Valores sem espaços extras ou quebras de linha
- [ ] Serviço foi **reiniciado** após adicionar variáveis
- [ ] Aguardou 2-5 minutos após reiniciar
- [ ] Logs mostram `hasClientId: true` e `hasClientSecret: true`
- [ ] Domínio customizado aponta para o serviço correto
- [ ] Rota `/api/debug/pluggy-env` retorna sucesso

## 🆘 Se Nada Funcionar

1. Verifique se outras variáveis de ambiente estão sendo lidas (ex: `DATABASE_URL`, `JWT_SECRET`)
2. Se outras variáveis também não estão sendo lidas, pode ser um problema mais amplo com o Render
3. Entre em contato com o suporte do Render ou considere recriar o serviço

