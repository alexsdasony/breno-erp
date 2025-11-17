# 🔧 Configuração de Domínio Customizado no Render

## ⚠️ Problema: Domínio customizado não percebe variáveis de ambiente

Se você configurou as variáveis no Render mas o domínio customizado (`rdsinvestimentos.com`) não está funcionando, siga estes passos:

## ✅ Verificações Necessárias

### 1. Verificar se o domínio customizado aponta para o serviço correto

No Render Dashboard:
1. Vá em **Settings** → **Custom Domains**
2. Verifique se `rdsinvestimentos.com` está apontando para o **mesmo serviço** onde você configurou as variáveis
3. Se houver múltiplos serviços, certifique-se de que as variáveis estão no serviço correto

### 2. Verificar variáveis de ambiente no serviço correto

1. No Render Dashboard, vá no serviço que está recebendo o tráfego do domínio customizado
2. Vá em **Environment**
3. Verifique se as variáveis estão configuradas:
   - `PLUGGY_CLIENT_ID`
   - `PLUGGY_CLIENT_SECRET`
   - `PLUGGY_ENV=production`

### 3. Reiniciar o serviço após configurar variáveis

Após adicionar/alterar variáveis:
1. Vá em **Manual Deploy** → **Deploy latest commit**
2. Ou clique em **Restart** no serviço
3. Aguarde o deploy completar

### 4. Verificar logs do serviço correto

1. No Render Dashboard, vá em **Logs**
2. Procure por: `🔍 Verificando credenciais Pluggy`
3. Verifique se mostra `hasClientId: true` e `hasClientSecret: true`
4. Se mostrar `false`, as variáveis não estão sendo lidas

### 5. Limpar cache do CDN (se usar Cloudflare ou similar)

Se o domínio customizado usa Cloudflare ou outro CDN:
1. Acesse o painel do CDN
2. Vá em **Caching** → **Purge Cache**
3. Ou aguarde 5-15 minutos para o cache expirar naturalmente

### 6. Verificar se há múltiplos serviços

Se você tem múltiplos serviços no Render:
- **Serviço principal** (breno-erp.onrender.com)
- **Serviço do domínio customizado** (rdsinvestimentos.com)

Certifique-se de configurar as variáveis em **AMBOS** os serviços, ou verifique se ambos apontam para o mesmo serviço.

## 🔍 Como Verificar Qual Serviço Está Sendo Usado

1. No Render Dashboard, veja todos os serviços
2. Verifique qual serviço tem o domínio customizado configurado
3. Configure as variáveis nesse serviço específico

## ⚡ Solução Rápida

1. **Identifique o serviço correto** que recebe tráfego do domínio customizado
2. **Configure as variáveis** nesse serviço
3. **Reinicie o serviço** (Manual Deploy ou Restart)
4. **Aguarde 2-3 minutos** para o deploy completar
5. **Teste novamente** no domínio customizado

## 📝 Nota Importante

Se o domínio customizado usa um proxy/CDN na frente (como Cloudflare), pode levar alguns minutos para as mudanças propagarem. O comportamento de "se igualarem depois de esperar" confirma que é cache.

