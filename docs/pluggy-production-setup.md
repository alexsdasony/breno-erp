# 🔧 Configuração Pluggy em Produção

## ⚠️ Erro: "Credenciais Pluggy não configuradas"

Se você está vendo este erro ao tentar conectar dados bancários, significa que as variáveis de ambiente da Pluggy não estão configuradas no ambiente de produção.

## 📋 Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente no seu provedor de hospedagem (Render, Vercel, etc.):

### Obrigatórias

```env
PLUGGY_CLIENT_ID=seu_client_id_aqui
PLUGGY_CLIENT_SECRET=seu_client_secret_aqui
```

### Opcionais (mas recomendadas)

```env
PLUGGY_ENV=production
SYNC_SECRET_TOKEN=um-token-secreto-forte-para-webhooks
```

## 🚀 Como Configurar

### Render.com

1. Acesse seu projeto no Render Dashboard
2. Vá em **Environment** (ou **Settings** > **Environment Variables**)
3. Adicione as variáveis:
   - `PLUGGY_CLIENT_ID` = seu Client ID da Pluggy
   - `PLUGGY_CLIENT_SECRET` = seu Client Secret da Pluggy
   - `PLUGGY_ENV` = `production`
   - `SYNC_SECRET_TOKEN` = um token secreto (opcional)
4. Clique em **Save Changes**
5. Faça um novo deploy ou reinicie o serviço

### Vercel

1. Acesse seu projeto no Vercel Dashboard
2. Vá em **Settings** > **Environment Variables**
3. Adicione as variáveis para o ambiente **Production**:
   - `PLUGGY_CLIENT_ID` = seu Client ID da Pluggy
   - `PLUGGY_CLIENT_SECRET` = seu Client Secret da Pluggy
   - `PLUGGY_ENV` = `production`
   - `SYNC_SECRET_TOKEN` = um token secreto (opcional)
4. Clique em **Save**
5. Faça um novo deploy

### Outros Provedores

O processo é similar:
1. Encontre a seção de **Environment Variables** ou **Config Vars**
2. Adicione as variáveis listadas acima
3. Reinicie o serviço ou faça um novo deploy

## 🔑 Onde Obter as Credenciais

1. Acesse o [Pluggy Dashboard](https://dashboard.pluggy.ai/)
2. Faça login na sua conta
3. Vá em **Settings** > **API Keys**
4. Copie o **Client ID** e **Client Secret**
5. Cole nas variáveis de ambiente do seu provedor

## ✅ Verificação

Após configurar as variáveis:

1. Faça um novo deploy ou reinicie o serviço
2. Tente conectar uma conta bancária novamente
3. O erro deve desaparecer e o widget Pluggy deve abrir normalmente

## 🐛 Troubleshooting

### Erro persiste após configurar variáveis

1. **Verifique se as variáveis foram salvas corretamente**
   - Certifique-se de que não há espaços extras
   - Verifique se não há aspas desnecessárias

2. **Reinicie o serviço**
   - As variáveis de ambiente são carregadas na inicialização
   - Um simples restart pode resolver

3. **Verifique os logs**
   - Procure por mensagens como "❌ Credenciais Pluggy não configuradas"
   - Isso confirma que as variáveis não estão sendo lidas

4. **Verifique o ambiente**
   - Certifique-se de que configurou as variáveis para o ambiente correto (Production)
   - Alguns provedores têm ambientes separados (Production, Preview, Development)

## 📝 Notas Importantes

- ⚠️ **Nunca** commite as credenciais no código
- ⚠️ **Nunca** compartilhe as credenciais publicamente
- ✅ Use variáveis de ambiente sempre
- ✅ Use diferentes credenciais para desenvolvimento e produção (se possível)

## 🔗 Links Úteis

- [Documentação Pluggy](https://docs.pluggy.ai/)
- [Pluggy Dashboard](https://dashboard.pluggy.ai/)

