# 🔧 Troubleshooting - Render Domain Customizado

## ✅ Variáveis Configuradas

Se você já configurou as variáveis no Render mas o domínio customizado ainda não funciona:

## 🔍 Passos para Resolver

### 1. Verificar se o serviço foi reiniciado

**IMPORTANTE:** Após adicionar/alterar variáveis de ambiente, você **DEVE** reiniciar o serviço:

1. No Render Dashboard, vá no seu serviço
2. Clique em **Manual Deploy** → **Deploy latest commit**
3. Ou clique em **Restart** (se disponível)
4. Aguarde o deploy completar (2-5 minutos)

### 2. Verificar usando rota de debug

Teste em ambos os domínios:

**Domínio Render:**
```
https://breno-erp.onrender.com/api/debug/pluggy-env
```

**Domínio Customizado:**
```
https://www.rdsinvestimentos.com/api/debug/pluggy-env
```

Compare os resultados. Se um mostrar `hasClientId: false`, as variáveis não estão sendo lidas nesse serviço.

### 3. Verificar logs do Render

1. No Render Dashboard, vá em **Logs**
2. Procure por: `🔍 Verificando credenciais Pluggy`
3. Verifique se mostra:
   ```
   hasClientId: true
   hasClientSecret: true
   ```

### 4. Verificar se há múltiplos serviços

Se você tem múltiplos serviços no Render:
- Verifique qual serviço tem o domínio customizado configurado
- Configure as variáveis **nesse serviço específico**
- Reinicie **esse serviço**

### 5. Limpar cache do CDN (se usar Cloudflare)

Se o domínio customizado usa Cloudflare:
1. Acesse Cloudflare Dashboard
2. Vá em **Caching** → **Configuration**
3. Clique em **Purge Everything**
4. Aguarde 2-3 minutos

### 6. Verificar configuração do domínio customizado

No Render Dashboard:
1. Vá em **Settings** → **Custom Domains**
2. Verifique se `rdsinvestimentos.com` está apontando para o **mesmo serviço** onde você configurou as variáveis
3. Verifique se o status está **Active**

## ⚡ Solução Rápida

1. ✅ Variáveis já configuradas (confirmado)
2. ⚠️ **Reinicie o serviço** (Manual Deploy ou Restart)
3. ⏳ Aguarde 2-5 minutos
4. 🔍 Teste usando `/api/debug/pluggy-env` em ambos os domínios
5. 🔄 Se ainda não funcionar, limpe cache do CDN

## 📝 Nota Importante

O comportamento de "se igualarem depois de esperar" indica **cache do CDN/proxy**. Após reiniciar o serviço, aguarde alguns minutos para o cache expirar ou limpe manualmente.

