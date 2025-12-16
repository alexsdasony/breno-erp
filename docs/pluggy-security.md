# Segurança - Integração Pluggy

## Variáveis de Ambiente

Todas as variáveis de ambiente necessárias estão documentadas no `env.example`. Certifique-se de configurá-las no `.env.local`:

### Pluggy

```env
PLUGGY_CLIENT_ID=seu_client_id
PLUGGY_CLIENT_SECRET=seu_client_secret
PLUGGY_ENV=sandbox
PLUGGY_API_BASE=https://api.pluggy.ai
PLUGGY_X_API_KEY_CACHE_TTL=600
```

### Segurança

```env
SYNC_SECRET_TOKEN=um-token-secreto-para-webhooks
PLUGGY_SYNC_SERVICE_TOKEN=defina_um_token_seguro
```

### Supabase

```env
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
```

## Validação da API Key (X-API-KEY)

### ⚠️ IMPORTANTE: Não Sanitizar a API Key

A API Key da Pluggy **deve ser usada exatamente como retornada pela API**, sem sanitização agressiva.

**Implementação atual:**
- ✅ Apenas `trim()` para remover whitespace acidental
- ✅ Validação que não está vazia após trim
- ✅ Usada diretamente no header `X-API-KEY` sem modificações
- ✅ Armazenada no cache sem alterações

**O que NÃO fazer:**
- ❌ Não remover caracteres especiais
- ❌ Não converter para lowercase/uppercase
- ❌ Não truncar ou modificar de qualquer forma
- ❌ Não aplicar sanitização HTML ou SQL

### Cache da API Key

A API Key é cacheada em memória com TTL configurável:

- **Padrão**: 600 segundos (10 minutos)
- **Configurável**: Via `PLUGGY_X_API_KEY_CACHE_TTL`
- **Mínimo**: 60 segundos (proteção contra valores inválidos)
- **Renovação**: Automática quando expira

## Segurança de Webhooks

### Validação de Token

O endpoint `/api/pluggy/webhook` valida o token `SYNC_SECRET_TOKEN` se configurado:

```typescript
// Se SYNC_SECRET_TOKEN estiver configurado, valida no header Authorization
Authorization: Bearer SEU_SYNC_SECRET_TOKEN
```

**Recomendação**: Sempre configure `SYNC_SECRET_TOKEN` em produção para evitar webhooks não autorizados.

### Headers Esperados

```http
POST /api/pluggy/webhook
Authorization: Bearer SEU_SYNC_SECRET_TOKEN
Content-Type: application/json
```

## Boas Práticas

1. **Nunca commitar credenciais**: Use `.env.local` (já está no `.gitignore`)
2. **Rotacionar tokens periodicamente**: Especialmente em produção
3. **Usar HTTPS**: Sempre em produção para webhooks
4. **Validar webhooks**: Configure `SYNC_SECRET_TOKEN`
5. **Monitorar logs**: Verifique logs de autenticação regularmente

## Troubleshooting

### API Key inválida

Se receber erro 401:
1. Verifique se `PLUGGY_CLIENT_ID` e `PLUGGY_CLIENT_SECRET` estão corretos
2. Verifique se não há espaços extras nas variáveis
3. Limpe o cache: `clearPluggyApiKeyCache()`
4. Verifique o ambiente (`PLUGGY_ENV`)

### Webhook rejeitado

Se webhook retornar 401:
1. Verifique se `SYNC_SECRET_TOKEN` está configurado
2. Verifique se o header `Authorization: Bearer TOKEN` está sendo enviado
3. Verifique se o token corresponde exatamente ao configurado

### Cache não funcionando

Se a API Key não está sendo cacheada:
1. Verifique `PLUGGY_X_API_KEY_CACHE_TTL` (deve ser >= 60)
2. Verifique logs para ver TTL sendo aplicado
3. Verifique se não há múltiplas instâncias do servidor (cache é em memória)


